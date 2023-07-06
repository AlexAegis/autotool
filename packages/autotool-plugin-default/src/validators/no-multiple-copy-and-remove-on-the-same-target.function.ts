import { isNotNullish } from '@alexaegis/common';
import type { AutotoolElementValidator, ElementError } from 'autotool-plugin';

/**
 * Checks the target file is inside the workspacePackage
 */
export const validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget: AutotoolElementValidator =
	(workspacePackageElementsByTarget) => {
		return Object.entries(workspacePackageElementsByTarget.targetedElementsByFile)
			.map<ElementError | undefined>(([targetFile, packageElements]) => {
				const copyAndSymlinkElements = packageElements.filter(
					(packageElement) =>
						packageElement.element.executor === 'fileCopy' ||
						packageElement.element.executor === 'fileSymlink',
				);
				const packageJsonElements = packageElements.filter(
					(packageElement) => packageElement.element.executor === 'packageJson',
				);
				const normalizedPackageJsonElementCount = Math.min(packageJsonElements.length, 1);

				const fileRemoveElements = packageElements.filter(
					(packageElement) => packageElement.element.executor === 'fileRemove',
				);
				const normalizedRemoveElementCount = Math.min(fileRemoveElements.length, 1);

				const elementCountAfterConsolidate =
					normalizedPackageJsonElementCount +
					normalizedRemoveElementCount +
					copyAndSymlinkElements.length;

				return elementCountAfterConsolidate > 1
					? ({
							code: 'EOVERWRITE',
							message: `There are more than one elements trying to copy to or remove "${targetFile}"`,
							targetFile,
							sourceElements: copyAndSymlinkElements.map(
								(packageElement) => packageElement.element,
							),
							sourcePlugins: copyAndSymlinkElements
								.flatMap((packageElement) => packageElement.sourcePlugin)
								.filter(isNotNullish),
					  } as ElementError)
					: undefined;
			})
			.filter(isNotNullish);
	};
