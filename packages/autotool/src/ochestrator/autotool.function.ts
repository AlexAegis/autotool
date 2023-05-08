import { asyncMap } from '@alexaegis/common';
import type { NormalizedLoggerOption } from '@alexaegis/logging';
import { collectWorkspacePackages } from '@alexaegis/workspace-tools';
import {
	normalizeAutotoolOptions,
	type AutotoolElement,
	type AutotoolElementExecutor,
	type AutotoolOptions,
	type AutotoolPluginObject,
	type ExecutorMap,
	type NormalizedAutotoolPluginOptions,
} from 'autotool-plugin';
import { defaultPlugin } from 'autotool-plugin-default';
import { executeElementsOnPackage } from './execute-elements-on-package.function.js';
import { findInstalledPlugins, loadInstalledPlugins } from './find-installed-plugins.function.js';
import { filterElementsForPackage } from './helpers/filter-elements-for-package.function.js';
import { groupAndConsolidateElementsByTargetFile } from './helpers/group-elements-by-target-file.function.js';
import { reportElementError } from './report-element-error.function.js';
import type { PackageElementErrorWithSourceData } from './types.js';

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

export const checkIfTheresAnElementWithoutValidExecutor = (
	plugins: AutotoolPluginObject[],
	executorMap: ExecutorMap,
	options: NormalizedLoggerOption
): boolean => {
	let failed = false;
	for (const plugin of plugins) {
		for (const element of plugin.elements ?? []) {
			if (!executorMap.has(element.executor)) {
				failed = true;
				options.logger.error(
					`Plugin ${plugin.name} contains an element with no executor: ${element.executor}`
				);
			}
		}
	}
	return failed;
};

export const autotool = async (rawOptions: AutotoolOptions): Promise<void> => {
	const options = normalizeAutotoolOptions(rawOptions);

	// collect target packages
	const workspacePackages = await collectWorkspacePackages(options);
	const workspaceRootPackage = workspacePackages.find(
		(workspacePackage) => workspacePackage.packageKind === 'root'
	);

	if (!workspaceRootPackage) {
		options.logger.warn('cannot do setup, not in a workspace!');
		return;
	}

	// Load plugins
	const installedPlugins = await findInstalledPlugins(options);
	options.logger.info('plugins found:', installedPlugins);

	const plugins: AutotoolPluginObject[] = await loadInstalledPlugins(installedPlugins, {
		...options,
		workspaceRootPackage,
	});
	plugins.unshift(defaultPlugin as AutotoolPluginObject);

	options.logger.info(
		'plugins loaded:',
		plugins.map((plugin) => plugin.name)
	);

	const executorMap = createExecutorMap(plugins, options);
	options.logger.info('executors loaded:', [...executorMap.keys()]);

	if (checkIfTheresAnElementWithoutValidExecutor(plugins, executorMap, options)) {
		return;
	}

	const validators = plugins.flatMap((plugin) => plugin.validators ?? []);
	// Collect elements?

	const workspacePackagesWithElements = workspacePackages.map((workspacePackage) =>
		filterElementsForPackage(workspacePackage, plugins)
	);
	const workspacePackagesWithElementsByTarget = await asyncMap(
		workspacePackagesWithElements,
		(workspacePackageWithElements) =>
			groupAndConsolidateElementsByTargetFile(workspacePackageWithElements, executorMap)
	);

	console.log('workspacePackagesWithElementsByTarget', workspacePackagesWithElementsByTarget);

	const elementOptions: NormalizedAutotoolPluginOptions = {
		logger: options.logger,
		cwd: options.cwd,
		dry: options.dryish,
		force: options.force,
		workspaceRootPackage: workspaceRootPackage,
	};

	const unflattenedErrors: PackageElementErrorWithSourceData[][] = await asyncMap(
		validators,
		async (validator) => {
			const elementErrors = await asyncMap(
				workspacePackagesWithElementsByTarget,
				async (workspacePackageElements) => {
					const validationErrors = await validator(
						workspacePackageElements,
						executorMap,
						elementOptions
					);
					return validationErrors.map<PackageElementErrorWithSourceData>((error) => ({
						// TODO fill metadata
						sourceElements: [],
						sourcePlugins: [],
						target: '',
						workspacePackage: workspacePackageElements.workspacePackage,
						message: error.message,
					}));
				}
			);
			return elementErrors.flat(1);
		}
	);
	const errors: PackageElementErrorWithSourceData[] = unflattenedErrors.flat(1);

	if (errors.length > 0) {
		options.logger.error('Error detected within setup elements!');
		for (const error of errors) {
			reportElementError(error, options);
		}
		return undefined;
	}

	options.logger.info('Valid setup elements, proceeding');

	await Promise.allSettled(
		workspacePackagesWithElementsByTarget.map((workspacePackageElementsByTarget) =>
			executeElementsOnPackage(
				workspacePackageElementsByTarget,
				executorMap,
				elementOptions,
				options
			)
		)
	);
};
