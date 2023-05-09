import { asyncMap } from '@alexaegis/common';
import { collectWorkspacePackages } from '@alexaegis/workspace-tools';
import {
	normalizeAutotoolOptions,
	type AutotoolOptions,
	type AutotoolPluginObject,
	type NormalizedAutotoolPluginOptions,
} from 'autotool-plugin';
import { defaultPlugin } from 'autotool-plugin-default';
import { executeElementsOnPackage } from './execute-elements-on-package.function.js';
import { findInstalledPlugins, loadInstalledPlugins } from './find-installed-plugins.function.js';
import { checkIfTheresAnElementWithoutValidExecutor } from './helpers/check-if-theres-an-element-without-valid-executor.function.js';
import { createExecutorMap } from './helpers/create-executor-map.function.js';
import { filterElementsForPackage } from './helpers/filter-elements-for-package.function.js';
import { groupAndConsolidateElementsByTargetFile } from './helpers/group-elements-by-target-file.function.js';
import { isRootWorkspacePackage } from './helpers/is-root-workspace-package.function.js';
import { reportElementError } from './report-element-error.function.js';
import type { PackageElementErrorWithSourceData } from './types.js';

export const autotool = async (rawOptions: AutotoolOptions): Promise<void> => {
	const options = normalizeAutotoolOptions(rawOptions);

	// collect target packages
	const workspacePackages = await collectWorkspacePackages(options);
	const workspaceRootPackage = workspacePackages.find(isRootWorkspacePackage);

	if (!workspaceRootPackage) {
		options.logger.warn('cannot do setup, not in a workspace!');
		return;
	}

	// Load plugins
	const installedPlugins = await findInstalledPlugins(options);
	const plugins: AutotoolPluginObject[] = await loadInstalledPlugins(installedPlugins, {
		...options,
		rootWorkspacePackage: workspaceRootPackage,
	});
	plugins.unshift(defaultPlugin as AutotoolPluginObject);

	options.logger.info(
		'plugins loaded:',
		plugins.map((plugin) => plugin.name)
	);
	const validators = plugins.flatMap((plugin) => plugin.validators ?? []);
	const executorMap = createExecutorMap(plugins, options);
	options.logger.info('executors loaded:', [...executorMap.keys()]);

	if (checkIfTheresAnElementWithoutValidExecutor(plugins, executorMap, options)) {
		return;
	}

	const workspacePackagesWithElements = workspacePackages.map((workspacePackage) =>
		filterElementsForPackage(workspacePackage, plugins)
	);
	const workspacePackagesWithElementsByTarget = await asyncMap(
		workspacePackagesWithElements,
		(workspacePackageWithElements) =>
			groupAndConsolidateElementsByTargetFile(workspacePackageWithElements, executorMap)
	);

	const elementOptions: NormalizedAutotoolPluginOptions = {
		logger: options.logger,
		cwd: options.cwd,
		dry: options.dryish,
		force: options.force,
		rootWorkspacePackage: workspaceRootPackage,
	};

	const unflattenedErrors: PackageElementErrorWithSourceData[][] = await asyncMap(
		validators,
		async (validator) => {
			const elementErrors = await asyncMap(
				workspacePackagesWithElementsByTarget,
				async (workspacePackageElements) => {
					const validationErrors = await validator(
						workspacePackageElements,
						executorMap,
						elementOptions
					);
					return validationErrors.map<PackageElementErrorWithSourceData>((error) => ({
						...error,
						workspacePackage: workspacePackageElements.workspacePackage,
					}));
				}
			);
			return elementErrors.flat(1);
		}
	);
	const errors: PackageElementErrorWithSourceData[] = unflattenedErrors.flat(1);

	if (errors.length > 0) {
		options.logger.error('Error detected within setup elements!');
		for (const error of errors) {
			reportElementError(error, options);
		}
		return undefined;
	}

	options.logger.info('Valid setup elements, proceeding');

	await Promise.allSettled(
		workspacePackagesWithElementsByTarget.map((workspacePackageElementsByTarget) => {
			const targetPackageLogger = options.logger.getSubLogger({
				name: workspacePackageElementsByTarget.workspacePackage.packagePathFromRootPackage,
			});
			return executeElementsOnPackage(
				workspacePackageElementsByTarget,
				workspaceRootPackage,
				executorMap,
				{ ...elementOptions, logger: targetPackageLogger },
				{
					...options,
					logger: targetPackageLogger,
				}
			);
		})
	);
};
