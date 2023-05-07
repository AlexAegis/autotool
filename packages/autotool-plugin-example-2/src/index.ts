import { getAssumedFinalInstallLocationOfPackage, type AutotoolPlugin } from 'autotool-plugin';
import { join } from 'node:path';
import packageJson from '../package.json';

const plugin: AutotoolPlugin = (options) => {
	console.log('EXAMPLE PLUGIN 2!!!');
	const logger = options.logger.getSubLogger({ name: 'ts' });
	const packageDirectory = getAssumedFinalInstallLocationOfPackage(options, packageJson);

	logger.info('loading...');

	return {
		name: 'autotool-plugin-example-2',
		elements: [
			{
				description: 'doin stuff',
				executor: 'file-copy',
				packageKind: 'root',
				targetFile: 'tsconfig.json',

				sourceFile: join(packageDirectory, 'static', 'workspace-tsconfig.json'),
			},
		],
	};
};

export default plugin;
