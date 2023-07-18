import { asyncFilterMap, deepFreeze, isObject } from '@alexaegis/common';
import { normalizeCwdOption, type CwdOption } from '@alexaegis/fs';
import {
	AUTOTOOL_PLUGIN_NAME_PREFIX,
	type AutotoolElement,
	type AutotoolPlugin,
	type AutotoolPluginFactory,
	type AutotoolPluginObject,
	type NormalizedAutotoolPluginOptions,
} from 'autotool-plugin';
import defaultPlugin from 'autotool-plugin-default';
import { globby } from 'globby';

/**
 * @returns the installed npm packages that match the naming convetion
 * autotool uses
 */
export const findInstalledPlugins = async (rawOptions: CwdOption): Promise<string[]> => {
	const options = normalizeCwdOption(rawOptions);
	const results = await globby(
		[
			`node_modules/${AUTOTOOL_PLUGIN_NAME_PREFIX}-*`,
			`node_modules/@*/${AUTOTOOL_PLUGIN_NAME_PREFIX}*`, // Not checking for a '-' to allow names like @org/autotool-plugin
		],
		{
			onlyDirectories: true,
			deep: 2,
			gitignore: false,
			cwd: options.cwd,
		},
	);
	return results.map((path) => path.replace('node_modules/', ''));
};

type AssumedPluginModule = {
	default?: AutotoolPlugin<AutotoolElement> | undefined;
} & AutotoolPlugin<AutotoolElement>;

export const isAutotoolPluginObject = <Element extends AutotoolElement = AutotoolElement>(
	plugin: unknown,
): plugin is AutotoolPluginObject<Element> => {
	const assumed = plugin as AutotoolPluginObject<Element>;
	return (
		typeof assumed === 'object' &&
		!Array.isArray(assumed) &&
		isObject(assumed) &&
		Array.isArray(assumed.elements)
	);
};

export const loadPlugin = async <Elements extends AutotoolElement>(
	plugin: AutotoolPluginObject<Elements> | AutotoolPluginFactory<Elements>,
	packageName: string,
	options: NormalizedAutotoolPluginOptions,
): Promise<AutotoolPluginObject<Elements>[]> => {
	if (typeof plugin === 'function') {
		const factoryResult = await plugin({
			...options,
			logger: options.logger.getSubLogger({ name: packageName }),
		});

		return Array.isArray(factoryResult) ? factoryResult : [factoryResult];
	} else if (isAutotoolPluginObject(plugin)) {
		return [plugin];
	} else {
		return [];
	}
};

export const loadInstalledPlugins = async (
	plugins: string[],
	options: NormalizedAutotoolPluginOptions,
): Promise<AutotoolPluginObject<AutotoolElement>[]> => {
	const modules = await asyncFilterMap(
		plugins,
		(name) =>
			import(name).then((mod) => ({ mod: mod as AssumedPluginModule, name })) as Promise<{
				mod: AssumedPluginModule;
				name: string;
			}>,
	);

	const loadedPlugins = await asyncFilterMap(modules, async ({ mod, name }) => {
		const modulePrefDefault = await (mod.default ?? mod);
		const loadedPlugins = await (Array.isArray(modulePrefDefault)
			? asyncFilterMap(
					modulePrefDefault.map((m) => loadPlugin(m, name, options)),
					async (m) => await m,
			  )
			: loadPlugin(modulePrefDefault, name, options));

		return loadedPlugins
			.flat(1)
			.map((plugin) => ({ ...plugin, name: plugin.name || name }))
			.filter(isAutotoolPluginObject);
	});
	const result = loadedPlugins.flat(1);
	// Always include the default plugin as the first one.
	result.unshift(defaultPlugin as AutotoolPluginObject<AutotoolElement>);

	// Don't you dare touch anything in your plugin after they're loaded!
	deepFreeze(result);

	return result;
};
