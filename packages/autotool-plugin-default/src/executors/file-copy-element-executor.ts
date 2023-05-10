import {
	getAssumedFinalInstallLocationOfPackage,
	isManagedFile,
	type AutotoolElementExecutor,
	type AutotoolElementFileCopy,
} from 'autotool-plugin';
import { cp, mkdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

export const autotoolElementFileCopyExecutor: AutotoolElementExecutor<AutotoolElementFileCopy> = {
	type: 'fileCopy',
	apply: async (element, target, options): Promise<void> => {
		const sourcePackagePath = getAssumedFinalInstallLocationOfPackage(
			target.rootPackage,
			element.sourcePluginPackageName
		);
		const sourceFilePath = join(sourcePackagePath, element.sourceFile);
		options.logger.trace('Copy file from', sourceFilePath);

		const isSourceFileManaged = await isManagedFile(sourceFilePath);
		if (!isSourceFileManaged) {
			options.logger.warn(
				`File ${relative(
					target.rootPackage.packagePath,
					sourceFilePath
				)} is not managed, it won't be overwritten on the next run unless forced!`
			);
		}

		if (options.dry) {
			options.logger.info('(Dry) Pretending to make sure target file has a directory...');
		} else {
			options.logger.info('Making sure target file has a directory...');
			await mkdir(dirname(target.targetFilePathAbsolute), { recursive: true });
		}

		if (options.dry) {
			options.logger.info(
				`(Dry) Pretending to copy ${element.sourceFile} to ${target.targetFilePackageRelative}`
			);
		} else {
			await cp(sourceFilePath, target.targetFilePathAbsolute);
			options.logger.info(
				`Copied ${element.sourceFile} to ${target.targetFilePackageRelative}`
			);
		}
	},
};
