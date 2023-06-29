import { type AutotoolPlugin, type AutotoolPluginObject } from 'autotool-plugin';
import packageJson from '../package.json';

export const plugin: AutotoolPlugin = (_options): AutotoolPluginObject => {
	return {
		name: packageJson.name,
		elements: [
			{
				description: 'Recursion test end: remove packages added during recursion',
				executor: 'packageJson',
				packageKind: 'root',
				consolidationPass: 1,
				data: {
					devDependencies: {
						'@alexaegis/autotool-plugin-recursive-2': undefined,
					},
				},
			},
			{
				description: 'Clean up',
				executor: 'packageJson',
				consolidationPass: 1,
				data: {
					foo: undefined,
					bar: undefined,
				},
			},
		],
	};
};

export default plugin;
