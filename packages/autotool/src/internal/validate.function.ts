import { asyncMap } from '@alexaegis/common';
import {
	type NormalizedAutotoolOptions,
	type NormalizedAutotoolPluginOptions,
	type WorkspacePackageElementsByTarget,
} from 'autotool-plugin';
import type { AutotoolContext } from './autotool-context.type.js';
import { reportElementError } from './report-element-error.function.js';
import type { PackageElementErrorWithSourceData } from './types.js';

export const validate = async (
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
