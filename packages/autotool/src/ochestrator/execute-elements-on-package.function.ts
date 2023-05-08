import type { RootWorkspacePackage } from '@alexaegis/workspace-tools';
import {
	AUTOTOOL_MARK,
	isManagedFile,
	type ElementTarget,
	type ExecutorMap,
	type NormalizedAutotoolOptions,
	type NormalizedAutotoolPluginOptions,
	type WorkspacePackageElementsByTarget,
} from 'autotool-plugin';
import { join, relative } from 'node:path';

/**
 * Targeted files are executed concurrently but elements targeting the same
 * file are executed sequentially to avoid data-loss if two elements want to
 * modify it.
 *
 * TODO: chainable/consolidateable elements like 'json' modifications to avoid writing multiple times, instead
 */
export const executeElementsOnPackage = async (
	packageElements: WorkspacePackageElementsByTarget,
	rootWorkspacePackage: RootWorkspacePackage,
	executorMap: ExecutorMap,
	elementOptions: NormalizedAutotoolPluginOptions,
	options: NormalizedAutotoolOptions
): Promise<void> => {
	options.logger.info(
		`processing elements targeting "${packageElements.workspacePackage.packagePathFromRootPackage}"`
	);

	await Promise.allSettled(
		Object.entries(packageElements.targetedElementsByFile).map(
			async ([targetFile, elements]) => {
				const targetFilePathAbsolute = join(
					packageElements.workspacePackage.packagePath,
					targetFile
				);

				const target: ElementTarget = {
					targetFilePackageRelative: targetFile,
					targetFilePath: relative(options.cwd, targetFilePathAbsolute),
					targetFilePathAbsolute,
					targetPackage: packageElements.workspacePackage,
					rootPackage: rootWorkspacePackage,
				};

				const bearsTheMark = await isManagedFile(targetFilePathAbsolute);
				if (!bearsTheMark) {
					if (options.force) {
						options.logger.warn(
							`Target file ${targetFile} at ${packageElements.workspacePackage.packagePath} bears no mark ("${AUTOTOOL_MARK}") but it's ignored because '--force' was used.`
						);
					} else {
						options.logger.warn(
							`Target file ${targetFile} at ${packageElements.workspacePackage.packagePath} bears no mark ("${AUTOTOOL_MARK}"), skipping!`
						);

						return;
					}
				}

				// Elements are applied one at a time
				for (const resolvedElement of elements) {
					const executor = executorMap.get(resolvedElement.element.executor);
					if (executor) {
						const logMessage = `element${
							resolvedElement.element.description
								? ' "' + resolvedElement.element.description + '"'
								: ''
						} using "${executor.type}" on "${targetFile}" at "${
							packageElements.workspacePackage.packagePathFromRootPackage
						}"`;

						if (options.dry) {
							options.logger.info('Dry execution, skipping ' + logMessage);
						} else {
							if (options.dryish) {
								options.logger.info('Dryish execution, running ' + logMessage);
							} else {
								options.logger.info('Executing ' + logMessage);
							}
							await executor.apply(resolvedElement.element, target, elementOptions);
						}
					} else {
						throw new Error('Executor not found');
					}
				}
			}
		)
	);
};
