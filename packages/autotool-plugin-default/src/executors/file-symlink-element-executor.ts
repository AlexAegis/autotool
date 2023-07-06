import { toAbsolute } from '@alexaegis/fs';
import {
	getAssumedFinalInstallLocationOfPackage,
	isManagedFile,
	type AutotoolElementExecutor,
	type AutotoolElementFileSymlink,
} from 'autotool-plugin';
import { mkdir, symlink } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

export const autotoolElementFileSymlinkExecutor: AutotoolElementExecutor<AutotoolElementFileSymlink> =
	{
		type: 'fileSymlink',
		apply: async (element, target, options): Promise<void> => {
			const sourcePackagePath = getAssumedFinalInstallLocationOfPackage(
				target.rootPackage,
				element.sourcePluginPackageName,
			);
			const sourceFilePath = join(sourcePackagePath, element.sourceFile);
			options.logger.trace('Symlink file from', sourceFilePath);

			const isSourceFileManaged = await isManagedFile(sourceFilePath);
			if (!isSourceFileManaged) {
				options.logger.warn(
					`File ${relative(
						target.rootPackage.packagePath,
						sourceFilePath,
					)} is not managed, it won't be overwritten on the next run unless forced!`,
				);
			}

			const targetDir = dirname(target.targetFilePathAbsolute);

			if (options.dry) {
				options.logger.info('(Dry) Pretending to make sure target file has a directory...');
			} else {
				options.logger.info('Making sure target file has a directory...');
				await mkdir(targetDir, { recursive: true });
			}

			const relativeFromTargetBackToFile = relative(
				targetDir,
				toAbsolute(sourceFilePath, options),
			);

			if (options.dry) {
				options.logger.info(
					`(Dry) Pretending to create symlink at ${target.targetFilePath} to link to ${relativeFromTargetBackToFile} from the target!`,
				);
			} else {
				await symlink(relativeFromTargetBackToFile, target.targetFilePathAbsolute);
				options.logger.info(
					`Created symlink at ${target.targetFilePath} to link to ${relativeFromTargetBackToFile} from the target!`,
				);
			}
		},
	};
