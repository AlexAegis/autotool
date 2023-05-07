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

type AssumedPluginModule = { default?: AutotoolPlugin | undefined } & AutotoolPlugin;

export const isAutotoolPluginObject = (plugin: unknown): plugin is AutotoolPluginObject => {
	const assumed = plugin as AutotoolPluginObject;
	return (
		typeof assumed === 'object' &&
		!Array.isArray(assumed) &&
		isObject(assumed) &&
		Array.isArray(assumed.elements)
	);
};

export const loadPlugin = async <Elements extends AutotoolElement<string>>(
	plugin: AutotoolPluginObject<Elements> | AutotoolPluginFactory<Elements>,
	packageName: string,
	options: NormalizedAutotoolPluginOptions
): Promise<AutotoolPluginObject<Elements>[]> => {
	console.log('loadPlugin', packageName);
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
): Promise<AutotoolPluginObject[]> => {
	console.log('pluginPaths', plugins);

	const modules = await asyncFilterMap(
		plugins,
		(name) =>
			import(name).then((mod) => ({ mod: mod as AssumedPluginModule, name })) as Promise<{
				mod: AssumedPluginModule;
				name: string;
			}>
	);
	console.log('modules', modules);

	const loadedPlugins = await asyncFilterMap(modules, async ({ mod, name }) => {
		const modulePrefDefault = await (mod.default ?? mod);
		console.log('asdasda', typeof modulePrefDefault === 'function');

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

	console.log('load', loadedPlugins);
	return loadedPlugins.flat(1);
};
/*
const r = await loadInstalledPlugins(await findInstalledPlugins(normalizeCwdOption()), {
	cwd: process.cwd(),
	dry: false,
	dryish: false,
	workspaceRootPackage: {
		packageJson: {},
		packageJsonPath: '',
		packageKind: 'regular',
		packagePath: '',
	},
	logger: noopLogger,
});
for (const p of r) {
	console.log('plugin loaded:', p);
}
*/
