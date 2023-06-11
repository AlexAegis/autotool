import { asyncMap } from '@alexaegis/common';
import { type WorkspacePackage } from '@alexaegis/workspace-tools';
import { isManagedContent, type WorkspacePackageElementsByTarget } from 'autotool-plugin';
import { filterElementsForPackage } from '../helpers/filter-elements-for-package.function.js';
import { groupAndConsolidateElementsByTargetFile } from '../helpers/group-elements-by-target-file.function.js';
import type { AutotoolContext } from './autotool-context.type.js';

/**
 * Also filters out all packages that are not marked
 */
export const assignElementsToTargets = async (
	workspacePackages: WorkspacePackage[],
	context: AutotoolContext
): Promise<WorkspacePackageElementsByTarget[]> => {
	const workspacePackagesWithElements = workspacePackages
		.filter((workspacePackage) =>
			isManagedContent(JSON.stringify(workspacePackage.packageJson))
		)
		.map((workspacePackage) => filterElementsForPackage(workspacePackage, context.plugins));
	return asyncMap(workspacePackagesWithElements, (workspacePackageWithElements) =>
		groupAndConsolidateElementsByTargetFile(workspacePackageWithElements, context.executorMap)
	);
};
