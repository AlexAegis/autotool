import { type AutotoolPlugin } from 'autotool-plugin';
import { join } from 'node:path';
import packageJson from '../package.json';

const plugin: AutotoolPlugin = (_options) => {
	return {
		name: packageJson.name,
		elements: [
			{
				description: 'a valid copy',
				executor: 'fileCopy',
				packageKind: 'root',
				targetFile: 'foo.txt',
				sourcePluginPackageName: packageJson.name,
				sourceFile: join('static', 'foo.txt'),
			},
			{
				description: 'removing the valid copy, I will trigger an error!',
				executor: 'fileRemove',
				packageKind: 'root',
				targetFile: 'foo.txt',
			},
			{
				description: 'copying foo outside of the project, I will cause an error!',
				executor: 'fileCopy',
				packageKind: 'root',
				targetFile: '../foo.txt',
				sourcePluginPackageName: packageJson.name,
				sourceFile: join('static', 'foo.txt'),
			},
			{
				description: 'copying foo outside of the package, I will cause an error too!',
				executor: 'fileCopy',
				packageKind: 'regular',
				targetFile: '../foo.txt',
				sourcePluginPackageName: packageJson.name,
				sourceFile: join('static', 'foo.txt'),
			},
		],
	};
};

export default plugin;
