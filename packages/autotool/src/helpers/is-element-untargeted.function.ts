import { isNotNullish, isNullish } from '@alexaegis/common';
import {
	type AutotoolElement,
	type ExecutorMap,
	type PackageResolvedElement,
	type UntargetedAutotoolElement,
} from 'autotool-plugin';

export const isElementUntargeted = <
	Elements extends UntargetedAutotoolElement = UntargetedAutotoolElement,
>(
	element: UntargetedAutotoolElement<Elements['executor']>,
	executorMap: ExecutorMap<Elements>,
): element is UntargetedAutotoolElement<Elements['executor']> => {
	return (
		isNullish((element as AutotoolElement).targetFile) &&
		isNullish((element as AutotoolElement).targetFilePatterns) &&
		isNullish(executorMap.get(element.executor)?.defaultTarget)
	);
};

export const isElementTargeted = <
	Elements extends UntargetedAutotoolElement = UntargetedAutotoolElement,
>(
	element: UntargetedAutotoolElement<Elements['executor']>,
	executorMap: ExecutorMap<Elements>,
): element is AutotoolElement<Elements['executor']> => {
	return (
		isNotNullish((element as AutotoolElement).targetFile) ||
		isNotNullish((element as AutotoolElement).targetFilePatterns) ||
		isNotNullish(executorMap.get(element.executor)?.defaultTarget)
	);
};

export const isPackageElementUntargeted = <
	Elements extends UntargetedAutotoolElement = UntargetedAutotoolElement,
>(
	packageElement: PackageResolvedElement<Elements>,
	executorMap: ExecutorMap<Elements>,
): packageElement is PackageResolvedElement<Elements> => {
	return isElementUntargeted<Elements>(packageElement.element, executorMap);
};

export const isPackageElementTargeted = <
	Elements extends UntargetedAutotoolElement = UntargetedAutotoolElement,
>(
	packageElement: PackageResolvedElement,
	executorMap: ExecutorMap<Elements>,
): packageElement is PackageResolvedElement<AutotoolElement<Elements['executor']>> => {
	return isElementTargeted<Elements>(packageElement.element, executorMap);
};

/**
 * This extra function lets me use the type assert functionm directly,
 * letting typescript infer the return type
 */
export const createIsPackageElementTargeted =
	<Elements extends UntargetedAutotoolElement = UntargetedAutotoolElement>(
		executorMap: ExecutorMap<Elements>,
	) =>
	(
		packageElement: PackageResolvedElement,
	): packageElement is PackageResolvedElement<AutotoolElement<Elements['executor']>> =>
		isPackageElementTargeted<Elements>(packageElement, executorMap);
