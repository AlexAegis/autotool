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
				targetFile: 'foo2.txt',
			},
		],
	};
};

export default plugin;
