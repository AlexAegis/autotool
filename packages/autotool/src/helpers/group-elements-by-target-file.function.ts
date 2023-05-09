import type {
	AutotoolElement,
	ExecutorMap,
	PackageResolvedElement,
	WorkspacePackageElementsByTarget,
} from 'autotool-plugin';
import type { WorkspacePackageWithElements } from '../internal/types.js';
import { consolidateElementsAndFilterOutNonExecutables } from './consolidate-elements.function.js';
import { mapRecord } from './map-record.function.js';
import { normalizeElementTargets } from './normalize-element-targets.function.js';

export const groupAndConsolidateElementsByTargetFile = async <
	Elements extends AutotoolElement = AutotoolElement
>(
	workspacePackage: WorkspacePackageWithElements<Elements>,
	executorMap: ExecutorMap<Elements>
): Promise<WorkspacePackageElementsByTarget<Elements>> => {
	const resolved = await normalizeElementTargets(workspacePackage, executorMap);
	const targetedElementsByFile = resolved.targetedElements.reduce<
		Record<string, PackageResolvedElement<Elements>[]>
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
			consolidateElementsAndFilterOutNonExecutables(
				elements,
				resolved.workspacePackage,
				executorMap
			)
		),
	};
};
