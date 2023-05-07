import { isNullish } from '@alexaegis/common';
import { type AutotoolElement, type PackageResolvedElement } from 'autotool-plugin';

export const isElementUntargeted = <Elements extends AutotoolElement = AutotoolElement>(
	packageElement: PackageResolvedElement<Elements>
): boolean => {
	return (
		isNullish(packageElement.element.targetFile) &&
		isNullish(packageElement.element.targetFilePatterns)
	);
};
