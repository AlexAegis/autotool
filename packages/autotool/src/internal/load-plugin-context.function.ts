import { type RootWorkspacePackage } from '@alexaegis/workspace-tools';
import {
	type AutotoolElement,
	type AutotoolPluginObject,
	type NormalizedAutotoolOptions,
} from 'autotool-plugin';
import { createExecutorMap } from '../helpers/create-executor-map.function.js';
import type { AutotoolContext } from './autotool-context.type.js';
import { autotoolPluginFilterPredicate } from './autotool-plugin-filter-predicate.function.js';
import { findInstalledPlugins, loadInstalledPlugins } from './find-installed-plugins.function.js';

export const loadContext = async (
	rootWorkspacePackage: RootWorkspacePackage,
	options: NormalizedAutotoolOptions,
): Promise<AutotoolContext> => {
	const installedPlugins = await findInstalledPlugins(options);
	let plugins: AutotoolPluginObject<AutotoolElement>[] = await loadInstalledPlugins(
		installedPlugins,
		{
			...options,
			rootWorkspacePackage,
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
	};
};
