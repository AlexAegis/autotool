import { fillStringWithTemplateVariables } from '@alexaegis/common';
import { tryPrettify, turnIntoExecutable } from '@alexaegis/fs';
import { getPackageJsonTemplateVariables } from '@alexaegis/workspace-tools';
import {
	getAssumedFinalInstallLocationOfPackage,
	isManagedFile,
	type AutotoolElementExecutor,
	type AutotoolElementFileCopy,
} from 'autotool-plugin';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { type BuiltInParserName } from 'prettier';

/**
 * TODO: Find a more roboust solution => prettier has a getFileInfo fn but that also tries to read the file and I want to do this before writing it out
 */
const guessPrettierParser = (path: string): BuiltInParserName => {
	const extension = extname(path);
	switch (extension) {
		case '.json': {
			return 'json';
		}
		case '.ts': {
			return 'typescript';
		}
		case '.yml':
		case '.yaml': {
			return 'yaml';
		}
		default: {
			return 'babel';
		}
	}
};
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
			element.sourcePluginPackageName,
		);
		const sourceFilePath = join(sourcePackagePath, element.sourceFile);
		options.logger.trace('Copy file from', sourceFilePath);

		const isSourceFileManaged = await isManagedFile(sourceFilePath);
		if (!isSourceFileManaged) {
			options.logger.warn(
				`File ${relative(
					target.rootPackage.packagePath,
					sourceFilePath,
				)} is not managed, it won't be overwritten on the next run unless forced!`,
			);
		}

		let fileContent = (await readFile(sourceFilePath, { encoding: 'utf8' })) || '';
		options.logger.silly('filecontent read from source file', sourceFilePath, fileContent);

		fileContent =
			element.transformers?.reduce(
				(content, transformer) => transformer(content),
				fileContent,
			) ?? fileContent;
		options.logger.silly('filecontent ran through transformers', fileContent);

		fileContent = fillStringWithTemplateVariables(fileContent, templateVariables);
		options.logger.silly('filecontent filled with template variables', fileContent);

		const prettierParser = element.formatWithPrettier;
		if (prettierParser) {
			fileContent = await tryPrettify(fileContent, {
				...options,
				parser:
					prettierParser === true
						? guessPrettierParser(target.targetFilePathAbsolute)
						: (prettierParser as BuiltInParserName), // TODO: remove type coerce after update
			});
		}

		options.logger.silly('filecontent formatted using prettier (first 50 char):', fileContent);

		if (options.dry) {
			options.logger.info('(Dry) Pretending to make sure target file has a directory...');
		} else {
			options.logger.info('Making sure target file has a directory...');
			await mkdir(dirname(target.targetFilePathAbsolute), { recursive: true });
		}

		if (options.dry) {
			options.logger.info(
				`(Dry) Pretending to copy ${element.sourceFile} to ${target.targetFilePackageRelative}...`,
			);

			if (element.markAsExecutable) {
				options.logger.info(
					`(Dry) Pretending to mark ${target.targetFilePackageRelative} as executable...`,
				);
			}
		} else {
			options.logger.info(
				`Copying ${element.sourceFile} to ${target.targetFilePackageRelative}...`,
			);

			try {
				await writeFile(target.targetFilePathAbsolute, fileContent);
				if (element.markAsExecutable) {
					options.logger.info(
						`Marking ${target.targetFilePackageRelative} as executable...`,
					);
					await turnIntoExecutable(target.targetFilePathAbsolute, options);
				}
			} catch (error) {
				options.logger.error('Error happened during execution!', error);
			}
		}
	},
};
