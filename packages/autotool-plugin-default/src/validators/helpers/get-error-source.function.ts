import { isNotNullish } from '@alexaegis/common';
import type { AutotoolElement, ElementError, PackageResolvedElement } from 'autotool-plugin';

export const getErrorSourcesFromPackageElement = <Elements extends AutotoolElement>(
	packageElements: PackageResolvedElement<Elements>[],
): Pick<ElementError<Elements>, 'sourcePlugins' | 'sourceElements'> => {
	return {
		sourceElements: packageElements.map((packageElement) => packageElement.element),
		sourcePlugins: packageElements
			.flatMap((packageElement) => packageElement.sourcePlugin)
			.filter(isNotNullish),
	};
};
