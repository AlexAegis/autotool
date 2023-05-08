import { getAssumedFinalInstallLocationOfPackage, type AutotoolPlugin } from 'autotool-plugin';
import { join } from 'node:path';
import packageJson from '../package.json';

const plugin: AutotoolPlugin = (options) => {
	const packageDirectory = getAssumedFinalInstallLocationOfPackage(options, packageJson);
	options.logger.info('distributing files from', packageDirectory);

	return {
		name: packageJson.name,
		elements: [
			{
				description: 'doin stuff',
				executor: 'fileCopy',
				packageKind: 'root',
				targetFile: 'foo.txt',
				sourceFile: join(packageDirectory, 'static', 'foo.txt'),
			},
		],
	};
};

export default plugin;
