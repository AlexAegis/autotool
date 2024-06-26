import type { NormalizedLoggerOption } from '@alexaegis/logging';
import type {
	AutotoolElement,
	ExecutorMap,
	PackageResolvedElement,
	WorkspacePackage,
	WorkspacePackageElementsByTarget,
} from 'autotool-plugin';
import type { PackageManager } from '../../../autotool-plugin/src/helpers/discover-package-manager.function.js';
import type { WorkspacePackageWithElements } from '../internal/types.js';
import { consolidateElementsAndFilterOutNonExecutables } from './consolidate-elements.function.js';
import { mapRecord } from './map-record.function.js';
import { normalizeElementTargets } from './normalize-element-targets.function.js';

export const groupAndConsolidateElementsByTargetFile = async <
	Elements extends AutotoolElement = AutotoolElement,
>(
	workspacePackage: WorkspacePackageWithElements,
	executorMap: ExecutorMap<Elements>,
	allWorkspacePackages: WorkspacePackage[],
	packageManager: PackageManager,
	options: NormalizedLoggerOption,
): Promise<WorkspacePackageElementsByTarget<Elements>> => {
	const resolved = await normalizeElementTargets<Elements>(workspacePackage, executorMap);
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
		allWorkspacePackages,
		packageManager,
		targetedElementsByFile: mapRecord(targetedElementsByFile, (elements) =>
			consolidateElementsAndFilterOutNonExecutables<Elements>(
				elements,
				resolved.workspacePackage,
				executorMap,
				options,
			),
		),
	};
};
