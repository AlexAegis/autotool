import { asyncFilterMap, isObject } from '@alexaegis/common';
import { normalizeCwdOption, type CwdOption } from '@alexaegis/fs';
import type {
	AutotoolElement,
	AutotoolPlugin,
	AutotoolPluginFactory,
	AutotoolPluginObject,
	NormalizedAutotoolPluginOptions,
} from 'autotool-plugin';
import { globby } from 'globby';

/**
 * Applies Object.freeze deeply, as seen on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 *
 * @returns the same object but frozen.
 * @deprecated use core
 */
export const deepFreeze = <T>(object: T, dontFreeze = new Set()): T => {
	dontFreeze.add(object);
	const propNames = Reflect.ownKeys(object as object);
	for (const name of propNames) {
		const value = (object as Record<string | number | symbol, unknown>)[name];

		if (
			((value && typeof value === 'object') || typeof value === 'function') &&
			!dontFreeze.has(value)
		) {
			deepFreeze(value as T, dontFreeze);
		}
	}

	return Object.freeze(object);
};

/**
 * @returns the installed npm packages that match the naming convetion
 * autotool uses
 */
export const findInstalledPlugins = async (rawOptions: CwdOption): Promise<string[]> => {
	const options = normalizeCwdOption(rawOptions);
	const results = await globby(
		['node_modules/autotool-plugin-*', 'node_modules/@*/autotool-plugin*'],
		{
			onlyDirectories: true,
			deep: 2,
			gitignore: false,
			cwd: options.cwd,
		}
	);
	return results.map((path) => path.replace('node_modules/', ''));
};

type AssumedPluginModule = {
	default?: AutotoolPlugin<AutotoolElement> | undefined;
} & AutotoolPlugin<AutotoolElement>;

export const isAutotoolPluginObject = <Element extends AutotoolElement = AutotoolElement>(
	plugin: unknown
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
	options: NormalizedAutotoolPluginOptions
): Promise<AutotoolPluginObject<Elements>[]> => {
	if (typeof plugin === 'function') {
		const factoryResult = await plugin({
			...options,
			logger: options.logger.getSubLogger({ name: packageName }),
		});

		return Array.isArray(factoryResult)
			? factoryResult.map((factoryResultPlugin) => factoryResultPlugin)
			: [factoryResult];
	} else if (isAutotoolPluginObject(plugin)) {
		return [plugin];
	} else {
		return [];
	}
};

export const loadInstalledPlugins = async (
	plugins: string[],
	options: NormalizedAutotoolPluginOptions
): Promise<AutotoolPluginObject<AutotoolElement>[]> => {
	const modules = await asyncFilterMap(
		plugins,
		(name) =>
			import(name).then((mod) => ({ mod: mod as AssumedPluginModule, name })) as Promise<{
				mod: AssumedPluginModule;
				name: string;
			}>
	);

	const loadedPlugins = await asyncFilterMap(modules, async ({ mod, name }) => {
		const modulePrefDefault = await (mod.default ?? mod);
		const loadedPlugins = await (Array.isArray(modulePrefDefault)
			? asyncFilterMap(
					modulePrefDefault.map((m) => loadPlugin(m, name, options)),
					async (m) => await m
			  )
			: loadPlugin(modulePrefDefault, name, options));

		return loadedPlugins
			.flat(1)
			.map((plugin) => ({ ...plugin, name: plugin.name || name }))
			.filter(isAutotoolPluginObject);
	});
	const result = loadedPlugins.flat(1);

	// Don't you dare touch anything in your plugin after it's loaded
	deepFreeze(result);

	return result;
};
