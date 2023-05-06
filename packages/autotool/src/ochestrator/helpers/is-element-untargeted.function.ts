import { isNullish } from '@alexaegis/common';
import { type PackageResolvedElement } from 'autotool-plugin';

export const isElementUntargeted = (packageElement: PackageResolvedElement): boolean => {
	return (
		isNullish(packageElement.element.targetFile) &&
		isNullish(packageElement.element.targetFilePatterns)
	);
};
