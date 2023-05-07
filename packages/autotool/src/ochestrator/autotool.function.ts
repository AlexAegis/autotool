import { asyncMap } from '@alexaegis/common';
import type { NormalizedLoggerOption } from '@alexaegis/logging';
import { collectWorkspacePackages } from '@alexaegis/workspace-tools';
import {
	normalizeAutotoolOptions,
	type AutotoolElement,
	type AutotoolElementExecutor,
	type AutotoolOptions,
	type AutotoolPluginObject,
} from 'autotool-plugin';
import { executeElementsOnPackage } from './execute-elements-on-package.function.js';
import { findInstalledPlugins, loadInstalledPlugins } from './find-installed-plugins.function.js';
import { filterElementsForPackage } from './helpers/filter-elements-for-package.function.js';
import { groupAndConsolidateElementsByTargetFile } from './helpers/group-elements-by-target-file.function.js';
import { reportElementError } from './report-element-error.function.js';
import type { ExecutorMap, PackageElementErrorWithSourceData } from './types.js';

export const createExecutorMap = (
	plugins: AutotoolPluginObject[],
	options: NormalizedLoggerOption
): ExecutorMap => {
	return plugins.reduce((executorMap, plugin) => {
		if (plugin.executors) {
			plugin.executors;
			for (const [key, executor] of Object.entries(plugin.executors)) {
				if (key !== executor.type) {
					options.logger.warn(
						`Executor ${executor.type} was declared with the wrong key (${key}) in ${plugin.name}!`
					);
				}
				if (executorMap.has(executor.type)) {
					options.logger.warn(
						`Executor ${executor.type} already loaded! Plugin: ${plugin.name} trying to load it again!`
					);
				} else {
					executorMap.set(executor.type, executor);
				}
			}
		}
		return executorMap;
	}, new Map<string, AutotoolElementExecutor<AutotoolElement>>());
};

export const autotool = async (rawOptions: AutotoolOptions): Promise<void> => {
	const options = normalizeAutotoolOptions(rawOptions);
	const logger = options.logger.getSubLogger({ name: 'autotool' });

	// collect target packages
	const workspacePackages = await collectWorkspacePackages(options);
	const workspaceRootPackage = workspacePackages.find(
		(workspacePackage) => workspacePackage.packageKind === 'root'
	);

	if (!workspaceRootPackage) {
		logger.warn('cannot do setup, not in a workspace!');
		return;
	}

	// Load plugins
	const installedPlugins = await findInstalledPlugins(options);
	options.logger.info('plugins found:', installedPlugins);

	const plugins: AutotoolPluginObject[] = await loadInstalledPlugins(installedPlugins, {
		...options,
		workspaceRootPackage,
	});

	options.logger.info(
		'plugins loaded:',
		plugins.map((plugin) => plugin.name)
	);

	const executorMap = createExecutorMap(plugins, options);

	options.logger.info('executors loaded:', [...executorMap.keys()]);

	const verifiers = plugins.flatMap((plugin) => plugin.validators ?? []);
	// Collect elements?

	const workspacePackagesWithElements = workspacePackages.map((workspacePackage) =>
		filterElementsForPackage(workspacePackage, plugins)
	);

	const workspacePackagesWithElementsByTarget = await asyncMap(
		workspacePackagesWithElements,
		(workspacePackageWithElements) =>
			groupAndConsolidateElementsByTargetFile(workspacePackageWithElements, executorMap)
	);

	const errors: PackageElementErrorWithSourceData[] = verifiers.flatMap((verifier) =>
		workspacePackagesWithElementsByTarget.flatMap((workspacePackageElements) =>
			verifier(workspacePackageElements).map<PackageElementErrorWithSourceData>((error) => ({
				// TODO fill metadata
				sourceElements: [],
				sourcePlugins: [],
				target: '',
				workspacePackage: workspacePackageElements.workspacePackage,
				message: error.message,
			}))
		)
	);

	if (errors.length > 0) {
		logger.error('Error detected within setup elements!');
		for (const error of errors) {
			reportElementError(error, options);
		}
		return undefined;
	}

	logger.info('Valid setup elements, proceeding');

	await Promise.allSettled(
		workspacePackagesWithElementsByTarget.map((workspacePackageElementsByTarget) =>
			executeElementsOnPackage(workspacePackageElementsByTarget, executorMap, options)
		)
	);
};
