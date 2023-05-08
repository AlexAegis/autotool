import { type AutotoolPlugin } from 'autotool-plugin';
import { join } from 'node:path';
import packageJson from '../package.json';

const plugin: AutotoolPlugin = (_options) => {
	return {
		name: packageJson.name,
		elements: [
			{
				description: 'doin stuff',
				executor: 'fileCopy',
				packageKind: 'root',
				targetFile: 'foo.txt',
				sourcePluginPackageName: packageJson.name,
				sourceFile: join('static', 'foo.txt'),
			},
		],
	};
};

export default plugin;
