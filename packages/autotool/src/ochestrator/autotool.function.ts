import { asyncMap } from '@alexaegis/common';
import { collectWorkspacePackages } from '@alexaegis/workspace-tools';
import { tsPlugin } from 'autotool-example-plugin';
import {
	normalizeAutotoolOptions,
	type AutotoolElement,
	type AutotoolElementExecutor,
	type AutotoolOptions,
	type AutotoolPlugin,
	type AutotoolPluginFactory,
	type AutotoolPluginOptions,
	type DefaultAutotoolElements,
} from 'autotool-plugin';
import { executeElementsOnPackage } from './execute-elements-on-package.function.js';
import { filterElementsForPackage } from './helpers/filter-elements-for-package.function.js';
import { groupAndConsolidateElementsByTargetFile } from './helpers/group-elements-by-target-file.function.js';
import { reportElementError } from './report-element-error.function.js';
import type { PackageElementErrorWithSourceData } from './types.js';

export const normalizePlugin = <Element extends AutotoolElement<string> = DefaultAutotoolElements>(
	pluginOrFactory:
		| AutotoolPlugin<Element>
		| AutotoolPlugin<Element>[]
		| AutotoolPluginFactory<Element>,
	options: AutotoolPluginOptions
): AutotoolPlugin<Element>[] => {
	if (typeof pluginOrFactory === 'function') {
		const plugin = pluginOrFactory(options);
		return Array.isArray(plugin) ? plugin : [plugin];
	} else {
		return Array.isArray(pluginOrFactory) ? pluginOrFactory : [pluginOrFactory];
	}
};

export const autotool = async (rawOptions: AutotoolOptions): Promise<void> => {
	const options = normalizeAutotoolOptions(rawOptions);
	const logger = options.logger.getSubLogger({ name: 'setup' });

	// collect target packages
	const workspacePackages = await collectWorkspacePackages(options);
	const workspaceRootPackage = workspacePackages.find(
		(workspacePackage) => workspacePackage.packageKind === 'root'
	);

	if (!workspaceRootPackage) {
		logger.warn('cannot do setup, not in a workspace!');
		return;
	}

	const pluginOptions: AutotoolPluginOptions = {
		...options,
		workspaceRoot: workspaceRootPackage.packagePath,
	};

	// Load plugins
	// TODO: instead of having a fixed set of plugins, detect them
	const plugins: AutotoolPlugin[] = [...normalizePlugin(tsPlugin, pluginOptions)];

	const executorMap = plugins.reduce((executorMap, plugin) => {
		if (plugin.executors) {
			for (const executor of plugin.executors) {
				if (executorMap.has(executor.type)) {
					options.logger.warn(`Executor ${executor.type} already loaded!`);
				} else {
					executorMap.set(executor.type, executor);
				}
			}
		}
		return executorMap;
	}, new Map<string, AutotoolElementExecutor<AutotoolElement<string>>>());

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
