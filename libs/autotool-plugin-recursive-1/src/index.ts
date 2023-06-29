import type { AutotoolPlugin, AutotoolPluginObject } from 'autotool-plugin';
import packageJson from '../package.json';

export const plugin: AutotoolPlugin = (): AutotoolPluginObject => {
	return {
		name: packageJson.name,
		elements: [
			{
				description: 'Recursion test end: add the next plugin',
				executor: 'packageJson',
				packageKind: 'root',
				data: {
					devDependencies: {
						'@alexaegis/autotool-plugin-recursive-2':
							packageJson.devDependencies['@alexaegis/autotool-plugin-recursive-2'],
					},
				},
			},
		],
	};
};

export default plugin;
