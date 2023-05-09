import { asyncMap } from '@alexaegis/common';
import { type WorkspacePackage } from '@alexaegis/workspace-tools';
import { type WorkspacePackageElementsByTarget } from 'autotool-plugin';
import { filterElementsForPackage } from '../helpers/filter-elements-for-package.function.js';
import { groupAndConsolidateElementsByTargetFile } from '../helpers/group-elements-by-target-file.function.js';
import type { AutotoolContext } from './autotool-context.type.js';

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
