import type { InternalSetupElement, WorkspacePackageElementsByTarget } from 'autotool-plugin';
import type { ExecutorMap, WorkspacePackageWithElements } from '../types.js';
import { consolidateSetupElementsAndFilterOutNonExecutable } from './consolidate-elements.function.js';
import { mapRecord } from './map-record.function.js';
import { normalizeElementTargets } from './normalize-element-targets.function.js';

export const groupAndConsolidateElementsByTargetFile = async (
	workspacePackage: WorkspacePackageWithElements,
	executorMap: ExecutorMap
): Promise<WorkspacePackageElementsByTarget> => {
	const resolved = await normalizeElementTargets(workspacePackage);
	const targetedElementsByFile = resolved.targetedElements.reduce<
		Record<string, InternalSetupElement[]>
	>((groups, next) => {
		for (const targetFile of next.resolvedTargetFiles) {
			groups[targetFile]?.push(next.element);

			if (!groups[targetFile]) {
				groups[targetFile] = [next.element];
			}
		}

		return groups;
	}, {});

	return {
		workspacePackage: resolved.workspacePackage,
		untargetedElements: resolved.untargetedElements,
		targetedElementsByFile: mapRecord(targetedElementsByFile, (elements) =>
			consolidateSetupElementsAndFilterOutNonExecutable(elements, executorMap)
		),
	};
};
