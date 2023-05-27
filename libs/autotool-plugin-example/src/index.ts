import { type AutotoolPlugin, type AutotoolPluginObject } from 'autotool-plugin';
import { join } from 'node:path';
import packageJson from '../package.json';

export const plugin: AutotoolPlugin = (_options): AutotoolPluginObject => {
	return {
		name: packageJson.name,
		elements: [
			{
				description: 'copy unformatted example json file',
				executor: 'fileCopy',
				packageKind: 'root',
				targetFile: 'example.json',
				sourcePluginPackageName: packageJson.name,
				formatWithPrettier: true,
				sourceFile: join('static', 'example.txt'),
			},
			{
				description: 'copy unformatted example cjs file',
				executor: 'fileCopy',
				packageKind: 'root',
				targetFile: 'example.cjs',
				formatWithPrettier: 'babel',
				sourcePluginPackageName: packageJson.name,
				sourceFile: join('static', 'js-example.txt'),
			},
		],
	};
};

export default plugin;
