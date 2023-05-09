import { type RootWorkspacePackage } from '@alexaegis/workspace-tools';
import { type AutotoolPluginObject, type NormalizedAutotoolOptions } from 'autotool-plugin';
import { defaultPlugin } from 'autotool-plugin-default';
import { createExecutorMap } from '../helpers/create-executor-map.function.js';
import type { AutotoolContext } from './autotool-context.type.js';
import { findInstalledPlugins, loadInstalledPlugins } from './find-installed-plugins.function.js';

export const loadContext = async (
	rootWorkspacePackage: RootWorkspacePackage,
	options: NormalizedAutotoolOptions
): Promise<AutotoolContext> => {
	const installedPlugins = await findInstalledPlugins(options);
	const plugins: AutotoolPluginObject[] = await loadInstalledPlugins(installedPlugins, {
		...options,
		rootWorkspacePackage,
	});
	plugins.unshift(defaultPlugin as AutotoolPluginObject);

	options.logger.info(
		'plugins loaded:',
		plugins.map((plugin) => plugin.name)
	);
	const validators = plugins.flatMap((plugin) => plugin.validators ?? []);
	const executorMap = createExecutorMap(plugins, options);
	options.logger.info('executors loaded:', [...executorMap.keys()]);

	return {
		plugins,
		validators,
		executorMap,
	};
};
