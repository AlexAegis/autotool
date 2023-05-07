import { asyncFilterMap } from '@alexaegis/common';
import type { AutotoolElement } from 'autotool-plugin';
import { globby } from 'globby';
import type {
	InternalElementsWithResolvedTargets,
	WorkspacePackageWithElements,
	WorkspacePackageWithTargetedElements,
} from '../types.js';
import { isElementUntargeted } from './is-element-untargeted.function.js';

export const normalizeElementTargets = async <Elements extends AutotoolElement = AutotoolElement>(
	workspacePackageWithElements: WorkspacePackageWithElements<Elements>
): Promise<WorkspacePackageWithTargetedElements<Elements>> => {
	const elementsWithTargeting = workspacePackageWithElements.elements.filter(
		(element) => !isElementUntargeted(element)
	);
	const elementsWithoutTargeting = workspacePackageWithElements.elements.filter((element) =>
		isElementUntargeted(element)
	);

	const elements = await asyncFilterMap(elementsWithTargeting, async (packageElement) => {
		const targetFiles: string[] = [];

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
