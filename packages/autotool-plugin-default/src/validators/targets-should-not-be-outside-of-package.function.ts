import type { AutotoolElementValidator, ElementError } from 'autotool-plugin';
import { normalize } from 'node:path';
import { getErrorSourcesFromPackageElement } from './helpers/get-error-source.function.js';

/**
 * Checks the target file is inside the workspacePackage
 */
export const validateTargetsAreNotOutsideOfPackage: AutotoolElementValidator = (
	workspacePackageElementsByTarget
) => {
	return Object.entries(workspacePackageElementsByTarget.targetedElementsByFile)
		.filter(([targetFile]) => normalize(targetFile).startsWith('..'))
		.map<ElementError>(([targetFile, packageElements]) => ({
			code: 'ETARGETISOUTSIDE',
			message: `Target ${targetFile} is pointing outside of the package!`,
			targetFile,
			...getErrorSourcesFromPackageElement(packageElements),
		}));
};
