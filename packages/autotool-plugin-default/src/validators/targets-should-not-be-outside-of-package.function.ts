import type { AutotoolElementValidator, ElementError } from 'autotool-plugin';
import { normalize } from 'node:path';

/**
 * Checks the target file is inside the workspacePackage
 */
export const validateTargetsAreNotOutsideOfPackage: AutotoolElementValidator = (
	workspacePackageElementsByTarget
) => {
	return Object.keys(workspacePackageElementsByTarget.targetedElementsByFile)
		.filter((target) => normalize(target).startsWith('..'))
		.map<ElementError>((target) => ({
			code: 'ETARGETISOUTSIDE',
			message: `Target ${target} is pointing outside of the package!`,
		}));
};
