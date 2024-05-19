import { type WorkspacePackage } from '@alexaegis/workspace-tools';
import {
	type AutotoolElement,
	type AutotoolPluginObject,
	type NormalizedAutotoolOptions,
} from 'autotool-plugin';
import { discoverPackageManager } from '../../../autotool-plugin/src/helpers/discover-package-manager.function.js';
import { createExecutorMap } from '../helpers/create-executor-map.function.js';
import { isRootWorkspacePackage } from '../helpers/is-root-workspace-package.function.js';
import type { AutotoolContext } from './autotool-context.type.js';
import { autotoolPluginFilterPredicate } from './autotool-plugin-filter-predicate.function.js';
import { findInstalledPlugins, loadInstalledPlugins } from './find-installed-plugins.function.js';

export const loadContext = async (
	allWorkspacePackages: WorkspacePackage[],
	options: NormalizedAutotoolOptions,
): Promise<AutotoolContext> => {
	const rootWorkspacePackage = allWorkspacePackages.find(isRootWorkspacePackage);
	if (!rootWorkspacePackage) {
		options.logger.warn('cannot do setup, not in a workspace!');
		throw new Error('Not in a workspace!');
	}

	const packageManager = await discoverPackageManager(rootWorkspacePackage, {
		...options,
		logger: options.logger.getSubLogger({ name: 'discoverPackageManager' }),
	});

	const installedPlugins = await findInstalledPlugins(options);
	let plugins: AutotoolPluginObject<AutotoolElement>[] = await loadInstalledPlugins(
		installedPlugins,
		{
			...options,
			rootWorkspacePackage,
			allWorkspacePackages,
			packageManager,
		},
	);

	const executorMap = createExecutorMap(plugins, options);
	const validators = plugins.flatMap((plugin) => plugin.validators ?? []);
	options.logger.trace('executors loaded:', [...executorMap.keys()]);

	plugins = plugins.filter((plugin) => autotoolPluginFilterPredicate(plugin.name, options));

	options.logger.info(
		'plugins loaded after filters:',
		plugins.map((plugin) => plugin.name),
	);

	return {
		plugins,
		validators,
		executorMap,
		packageManager,
		rootWorkspacePackage,
		allWorkspacePackages,
	};
};
