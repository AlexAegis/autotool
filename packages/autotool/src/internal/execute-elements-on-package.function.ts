import { isNotNullish } from '@alexaegis/common';
import { readJson } from '@alexaegis/fs';
import {
	isPackageJsonDependencyField,
	type PackageJson,
	type RootWorkspacePackage,
} from '@alexaegis/workspace-tools';
import {
	AUTOTOOL_MARK,
	AUTOTOOL_PLUGIN_NAME_PREFIX,
	isManagedFile,
	type ElementTarget,
	type ExecutorMap,
	type NormalizedAutotoolOptions,
	type NormalizedAutotoolPluginOptions,
	type WorkspacePackageElementsByTarget,
} from 'autotool-plugin';
import diff, { type Difference } from 'microdiff';
import { join, relative } from 'node:path';

export interface WorkspacePackageElementExecutionResult {
	packageElements: WorkspacePackageElementsByTarget;
	finalPackageJson: PackageJson;
	packageJsonDiff: Difference[];
	someDependencyChanged: boolean;
	addedAutotoolPlugins: string[];
}

/**
 * Targeted files are executed concurrently but elements targeting the same
 * file are executed sequentially to avoid data-loss if two elements want to
 * modify it.
 *
 * @throws Error
 */
export const executeElementsOnPackage = async (
	packageElements: WorkspacePackageElementsByTarget,
	rootWorkspacePackage: RootWorkspacePackage,
	executorMap: ExecutorMap,
	elementOptions: NormalizedAutotoolPluginOptions,
	options: NormalizedAutotoolOptions
): Promise<WorkspacePackageElementExecutionResult> => {
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

	// Execute all targeted elements
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

	// Execute all non-targeted elements
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
		options.logger.info('finished processing elements here!');
	}

	// Read results to calculate deltas
	const finalPackageJson = await readJson<PackageJson>(
		packageElements.workspacePackage.packageJsonPath
	);

	if (!finalPackageJson) {
		throw new Error('PackageJson got corrupted!');
	}

	const packageJsonDiff = diff(packageElements.workspacePackage.packageJson, finalPackageJson);

	const someDependencyChanged = packageJsonDiff.some((difference) =>
		isPackageJsonDependencyField(difference.path[0])
	);

	const addedAutotoolPlugins = packageJsonDiff
		.map((difference) => {
			// Searching for dependencies added
			const lastPathFragment = difference.path.at(-1);

			if (
				difference.type === 'CREATE' &&
				isPackageJsonDependencyField(difference.path[0]) &&
				typeof lastPathFragment === 'string' &&
				lastPathFragment.includes(AUTOTOOL_PLUGIN_NAME_PREFIX)
			) {
				return lastPathFragment;
			}

			return undefined;
		})
		.filter(isNotNullish);

	return {
		packageElements,
		finalPackageJson,
		packageJsonDiff,
		someDependencyChanged,
		addedAutotoolPlugins,
	};
};
