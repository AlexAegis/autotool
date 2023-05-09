import { isNullish } from '@alexaegis/common';
import {
	type AutotoolElement,
	type ExecutorMap,
	type PackageResolvedElement,
} from 'autotool-plugin';

export const isElementUntargeted = <Elements extends AutotoolElement = AutotoolElement>(
	packageElement: PackageResolvedElement<Elements>,
	executorMap: ExecutorMap<Elements>
): boolean => {
	return (
		isNullish(packageElement.element.targetFile) &&
		isNullish(packageElement.element.targetFilePatterns) &&
		isNullish(executorMap.get(packageElement.element.executor)?.defaultTarget)
	);
};
