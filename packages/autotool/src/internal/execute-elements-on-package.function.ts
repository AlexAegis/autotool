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
	const targetedEntries = Object.entries(packageElements.targetedElementsByFile);

	if (targetedEntries.length > 0) {
		options.logger.info(
			`processing elements targeting "${packageElements.workspacePackage.packagePathFromRootPackage}..."`
		);
	} else {
		options.logger.info(
			`no elements targeting "${packageElements.workspacePackage.packagePathFromRootPackage}"`
		);
	}

	for (const [target, elements] of targetedEntries) {
		options.logger.trace(
			`all elements on ${target}`,
			elements.map((element) => element.element.executor)
		);
	}

	const untarget: ElementTarget = {
		targetFilePackageRelative: '',
		targetFilePath: '',
		targetFilePathAbsolute: '',
		targetPackage: packageElements.workspacePackage,
		rootPackage: rootWorkspacePackage,
	};

	await Promise.allSettled(
		targetedEntries.map(async ([targetFile, elements]) => {
			const targetFilePathAbsolute = join(
				packageElements.workspacePackage.packagePath,
				targetFile
			);

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

			const target: ElementTarget = {
				...untarget,
				targetFilePackageRelative: targetFile,
				targetFilePath: relative(options.cwd, targetFilePathAbsolute),
				targetFilePathAbsolute,
			};

			// Elements are applied one at a time
			for (const resolvedElement of elements) {
				const executor = executorMap.get(resolvedElement.element.executor);
				if (executor) {
					const elementLogger = elementOptions.logger.getSubLogger({
						name: resolvedElement.element.executor,
					});

					const logMessage = `element${
						resolvedElement.element.description
							? ' "' + resolvedElement.element.description + '"'
							: ''
					} using "${executor.type}" on "${targetFile}" at "${
						packageElements.workspacePackage.packagePathFromRootPackage
					}"`;

					if (options.dry) {
						elementLogger.info('Dry execution, skipping ' + logMessage);
					} else {
						if (options.dryish) {
							elementLogger.info('Dryish execution, running ' + logMessage);
						} else {
							elementLogger.info('Executing ' + logMessage);
						}
						await executor.apply(resolvedElement.element, target, {
							...elementOptions,
							logger: elementLogger,
						});
					}
				} else {
					throw new Error('Executor not found');
				}
			}
		})
	);

	for (const resolvedElement of packageElements.untargetedElements) {
		const executor = executorMap.get(resolvedElement.element.executor);
		if (executor) {
			const elementLogger = elementOptions.logger.getSubLogger({
				name: resolvedElement.element.executor,
			});

			const logMessage = `element${
				resolvedElement.element.description
					? ' "' + resolvedElement.element.description + '"'
					: ''
			} using "${executor.type}" at "${
				packageElements.workspacePackage.packagePathFromRootPackage
			}"`;

			if (options.dry) {
				elementLogger.info('Dry execution, skipping ' + logMessage);
			} else {
				if (options.dryish) {
					elementLogger.info('Dryish execution, running ' + logMessage);
				} else {
					elementLogger.info('Executing ' + logMessage);
				}
				await executor.apply(resolvedElement.element, untarget, {
					...elementOptions,
					logger: elementLogger,
				});
			}
		} else {
			throw new Error('Executor not found');
		}
	}

	if (targetedEntries.length > 0) {
		options.logger.info(
			`finished processing elements targeting "${packageElements.workspacePackage.packagePathFromRootPackage}!"`
		);
	}
};