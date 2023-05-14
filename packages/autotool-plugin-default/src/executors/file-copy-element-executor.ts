import { fillStringWithTemplateVariables } from '@alexaegis/common';
import { turnIntoExecutable } from '@alexaegis/fs';
import { getPackageJsonTemplateVariables } from '@alexaegis/workspace-tools';
import {
	getAssumedFinalInstallLocationOfPackage,
	isManagedFile,
	type AutotoolElementExecutor,
	type AutotoolElementFileCopy,
} from 'autotool-plugin';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

/**
 * Defines how and when files should be copied
 *
 * The target file is not checked if managed or not becuase that's already
 * checked for by the time this even runs. It happens at
 * packages/autotool/src/internal/execute-elements-on-package.function.ts
 */
export const autotoolElementFileCopyExecutor: AutotoolElementExecutor<AutotoolElementFileCopy> = {
	type: 'fileCopy',
	apply: async (element, target, options): Promise<void> => {
		const templateVariables = getPackageJsonTemplateVariables(target.targetPackage.packageJson);
		templateVariables['relativePathFromPackageToRoot'] =
			relative(target.targetPackage.packagePath, target.rootPackage.packagePath) || '.';
		Object.assign(templateVariables, element.templateVariables);

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

		const sourceFileContent = (await readFile(sourceFilePath, { encoding: 'utf8' })) || '';
		let transformedContent =
			element.transformers?.reduce(
				(content, transformer) => transformer(content),
				sourceFileContent
			) ?? sourceFileContent;
		transformedContent = fillStringWithTemplateVariables(transformedContent, templateVariables);

		if (options.dry) {
			options.logger.info('(Dry) Pretending to make sure target file has a directory...');
		} else {
			options.logger.info('Making sure target file has a directory...');
			await mkdir(dirname(target.targetFilePathAbsolute), { recursive: true });
		}

		if (options.dry) {
			options.logger.info(
				`(Dry) Pretending to copy ${element.sourceFile} to ${target.targetFilePackageRelative}...`
			);

			if (element.markAsExecutable) {
				options.logger.info(
					`(Dry) Pretending to mark ${target.targetFilePackageRelative} as executable...`
				);
			}
		} else {
			options.logger.info(
				`Copying ${element.sourceFile} to ${target.targetFilePackageRelative}...`
			);

			try {
				await writeFile(target.targetFilePathAbsolute, transformedContent);
				if (element.markAsExecutable) {
					options.logger.info(
						`Marking ${target.targetFilePackageRelative} as executable...`
					);
					await turnIntoExecutable(target.targetFilePathAbsolute, options);
				}
			} catch (error) {
				options.logger.error('Error happened during execution!', error);
			}
		}
	},
};
