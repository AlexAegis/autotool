import { asyncFilterMap } from '@alexaegis/common';
import { globby } from 'globby';
import type {
	InternalElementsWithResolvedTargets,
	WorkspacePackageWithElements,
	WorkspacePackageWithTargetedElements,
} from '../types.js';
import { isElementUntargeted } from './is-element-untargeted.function.js';

export const normalizeElementTargets = async (
	workspacePackageWithElements: WorkspacePackageWithElements
): Promise<WorkspacePackageWithTargetedElements> => {
	const elementsWithTargeting = workspacePackageWithElements.elements.filter(
		(element) => !isElementUntargeted(element)
	);
	const elementsWithoutTargeting = workspacePackageWithElements.elements.filter((element) =>
		isElementUntargeted(element)
	);

	const elements = await asyncFilterMap(elementsWithTargeting, async (element) => {
		const targetFiles: string[] = [];

		if (element.targetFile) {
			if (typeof element.targetFile === 'string') {
				targetFiles.push(element.targetFile);
			} else {
				targetFiles.push(...element.targetFile);
			}
		}

		if (element.targetFilePatterns) {
			const matchedFiles = await globby(element.targetFilePatterns, {
				cwd: workspacePackageWithElements.workspacePackage.packagePath,
				dot: true,
				globstar: true,
				braceExpansion: true,
			});

			targetFiles.push(...matchedFiles);
		}

		return {
			element,
			resolvedTargetFiles: [...new Set(targetFiles)],
		} as InternalElementsWithResolvedTargets;
	});

	return {
		...workspacePackageWithElements,
		targetedElements: elements,
		untargetedElements: elementsWithoutTargeting,
	};
};
