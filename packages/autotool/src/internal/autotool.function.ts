import { asyncMap } from '@alexaegis/common';
import { collectWorkspacePackages, type WorkspacePackage } from '@alexaegis/workspace-tools';
import {
	normalizeAutotoolOptions,
	type AutotoolOptions,
	type NormalizedAutotoolOptions,
	type NormalizedAutotoolPluginOptions,
	type WorkspacePackageElementsByTarget,
} from 'autotool-plugin';
import { checkIfTheresAnElementWithoutValidExecutor } from '../helpers/check-if-theres-an-element-without-valid-executor.function.js';
import { filterElementsForPackage } from '../helpers/filter-elements-for-package.function.js';
import { groupAndConsolidateElementsByTargetFile } from '../helpers/group-elements-by-target-file.function.js';
import { isRootWorkspacePackage } from '../helpers/is-root-workspace-package.function.js';
import type { AutotoolContext } from './autotool-context.type.js';
import { executeElementsOnPackage } from './execute-elements-on-package.function.js';
import { loadContext } from './load-plugin-context.function.js';
import { reportElementError } from './report-element-error.function.js';
import type { PackageElementErrorWithSourceData } from './types.js';

export const handleErrors = async (
	workspacePackagesWithElementsByTarget: WorkspacePackageElementsByTarget[],
	context: Pick<AutotoolContext, 'executorMap' | 'validators'>,
	elementOptions: NormalizedAutotoolPluginOptions,
	options: NormalizedAutotoolOptions
): Promise<boolean> => {
	const unflattenedErrors: PackageElementErrorWithSourceData[][] = await asyncMap(
		context.validators,
		async (validator) => {
			const elementErrors = await asyncMap(
				workspacePackagesWithElementsByTarget,
				async (workspacePackageElements) => {
					const validationErrors = await validator(
						workspacePackageElements,
						context.executorMap,
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
		return false;
	} else {
		options.logger.info('Valid elements, proceeding');
		return true;
	}
};

export const assignElementsToTargets = async (
	workspacePackages: WorkspacePackage[],
	context: AutotoolContext
): Promise<WorkspacePackageElementsByTarget[]> => {
	const workspacePackagesWithElements = workspacePackages.map((workspacePackage) =>
		filterElementsForPackage(workspacePackage, context.plugins)
	);
	return asyncMap(workspacePackagesWithElements, (workspacePackageWithElements) =>
		groupAndConsolidateElementsByTargetFile(workspacePackageWithElements, context.executorMap)
	);
};

export const autotool = async (rawOptions: AutotoolOptions): Promise<void> => {
	const options = normalizeAutotoolOptions(rawOptions);

	// collect target packages
	const workspacePackages = await collectWorkspacePackages(options);
	const rootWorkspacePackage = workspacePackages.find(isRootWorkspacePackage);

	if (!rootWorkspacePackage) {
		options.logger.warn('cannot do setup, not in a workspace!');
		return;
	}

	// Load context
	const context = await loadContext(rootWorkspacePackage, options);

	if (checkIfTheresAnElementWithoutValidExecutor(context, options)) {
		return;
	}

	const workspacePackagesWithElementsByTarget = await assignElementsToTargets(
		workspacePackages,
		context
	);

	const elementOptions: NormalizedAutotoolPluginOptions = {
		logger: options.logger,
		cwd: options.cwd,
		dry: options.dryish,
		force: options.force,
		rootWorkspacePackage,
	};

	const isValid = await handleErrors(
		workspacePackagesWithElementsByTarget,
		context,
		elementOptions,
		options
	);

	if (isValid) {
		await Promise.allSettled(
			workspacePackagesWithElementsByTarget.map((workspacePackageElementsByTarget) => {
				const targetPackageLogger = options.logger.getSubLogger({
					name: workspacePackageElementsByTarget.workspacePackage
						.packagePathFromRootPackage,
				});
				return executeElementsOnPackage(
					workspacePackageElementsByTarget,
					rootWorkspacePackage,
					context.executorMap,
					{ ...elementOptions, logger: targetPackageLogger },
					{
						...options,
						logger: targetPackageLogger,
					}
				);
			})
		);
	}
};
