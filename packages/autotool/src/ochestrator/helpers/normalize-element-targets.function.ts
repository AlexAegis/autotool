import { asyncFilterMap } from '@alexaegis/common';
import type { AutotoolElement, ExecutorMap } from 'autotool-plugin';
import { globby } from 'globby';
import type {
	InternalElementsWithResolvedTargets,
	WorkspacePackageWithElements,
	WorkspacePackageWithTargetedElements,
} from '../types.js';
import { isElementUntargeted } from './is-element-untargeted.function.js';
import { partition } from './partition.function.js';

export const normalizeElementTargets = async <Elements extends AutotoolElement = AutotoolElement>(
	workspacePackageWithElements: WorkspacePackageWithElements<Elements>,
	executorMap: ExecutorMap<Elements>
): Promise<WorkspacePackageWithTargetedElements<Elements>> => {
	const [elementsWithoutTargeting, elementsWithTargeting] = partition(
		workspacePackageWithElements.elements,
		(element) => isElementUntargeted(element, executorMap)
	);

	const elements = await asyncFilterMap(elementsWithTargeting, async (packageElement) => {
		const targetFiles: string[] = [];
		const defaultTarget = executorMap.get(packageElement.element.executor)?.defaultTarget;

		if (defaultTarget) {
			targetFiles.push(defaultTarget);
		}

		if (packageElement.element.targetFile) {
			if (typeof packageElement.element.targetFile === 'string') {
				targetFiles.push(packageElement.element.targetFile);
			} else {
				targetFiles.push(...packageElement.element.targetFile);
			}
		}

		if (packageElement.element.targetFilePatterns) {
			const matchedFiles = await globby(packageElement.element.targetFilePatterns, {
				cwd: workspacePackageWithElements.workspacePackage.packagePath,
				dot: true,
				globstar: true,
				braceExpansion: true,
			});

			targetFiles.push(...matchedFiles);
		}

		return {
			element: packageElement,
			resolvedTargetFiles: [...new Set(targetFiles)],
		} as InternalElementsWithResolvedTargets<Elements>;
	});

	return {
		...workspacePackageWithElements,
		targetedElements: elements,
		untargetedElements: elementsWithoutTargeting,
	};
};
