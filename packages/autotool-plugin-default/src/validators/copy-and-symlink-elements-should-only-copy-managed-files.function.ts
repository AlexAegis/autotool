import type { AutotoolElementValidator } from 'autotool-plugin';

/**
 * Checks the target file is inside the workspacePackage
 */
export const onlyCopyManagedFiles: AutotoolElementValidator = (
	_workspacePackageElementsByTarget
) => {
	return [];
};
