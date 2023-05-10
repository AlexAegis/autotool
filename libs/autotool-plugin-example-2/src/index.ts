import {
	type AutotoolPlugin,
	type AutotoolPluginObject,
	type DefaultAutotoolElements,
} from 'autotool-plugin';
import { join } from 'node:path';
import packageJson from '../package.json';

const plugin: AutotoolPlugin = (_options): AutotoolPluginObject<DefaultAutotoolElements> => {
	return {
		name: packageJson.name,
		elements: [
			{
				description: 'a valid copy',
				executor: 'fileCopy',
				packageKind: 'root',
				targetFile: 'asd',
				sourcePluginPackageName: packageJson.name,
				sourceFile: join('static', 'foo.txt'),
			},
			{
				description: 'removing the valid copy, I will trigger an error!',
				executor: 'fileRemove',
				packageKind: 'root',
				targetFile: 'foo2.txt',
			},
			{
				executor: 'custom',
				description: 'say hello to all public packages!',
				apply: (_e, target, options) => {
					options.logger.info('Hello', target.targetPackage.packageJson.name);
				},
			},
		],
	};
};

export default plugin;
