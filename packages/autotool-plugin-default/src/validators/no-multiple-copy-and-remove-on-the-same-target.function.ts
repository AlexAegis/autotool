import { isNotNullish } from '@alexaegis/common';
import type { AutotoolElementValidator, ElementError } from 'autotool-plugin';

/**
 * Checks the target file is inside the workspacePackage
 */
export const validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget: AutotoolElementValidator =
	(workspacePackageElementsByTarget) => {
		return Object.entries(workspacePackageElementsByTarget.targetedElementsByFile)
			.map<ElementError | undefined>(([targetFile, packageElements]) => {
				const copyAndRemoveElements = packageElements.filter(
					(packageElement) =>
						packageElement.element.executor === 'fileRemove' ||
						packageElement.element.executor === 'fileCopy' ||
						packageElement.element.executor === 'fileSymlink'
				);
				return copyAndRemoveElements.length > 1
					? ({
							code: 'EOVERWRITE',
							message: `There are more than one elements trying to copy to or remove "${targetFile}"`,
							targetFile,
							sourceElements: copyAndRemoveElements.map(
								(packageElement) => packageElement.element
							),
							sourcePlugins: copyAndRemoveElements
								.flatMap((packageElement) => packageElement.sourcePlugin)
								.filter(isNotNullish),
					  } as ElementError)
					: undefined;
			})
			.filter(isNotNullish);
	};
