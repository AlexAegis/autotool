import type { PackageResolvedElement } from 'autotool-plugin';
import type { ExecutorMap } from '../types.js';

/**
 * Returns a smaller list of elements if their executor can consolidate them
 *
 * Original ordering of the elements is not respected! It's not important and
 * easier to implement like this.
 *
 * I also drops all elements that do not have an executor. This is checkd for
 * in an earlier step anyway, which would result in an error.
 */
export const consolidateElementsAndFilterOutNonExecutable = (
	elements: PackageResolvedElement[],
	executorMap: ExecutorMap
): PackageResolvedElement[] => {
	return [...executorMap.values()].flatMap((executor) => {
		const elementsOfExecutor = elements.filter(
			(packageElement) => packageElement.element.executor === executor.type
		);
		return executor.consolidate
			? executor.consolidate(elementsOfExecutor.map((e) => e.element)).map(
					(e) =>
						({
							element: e,
							sourcePlugin: elementsOfExecutor[0]?.sourcePlugin,
							workspacePackage: elementsOfExecutor[0]?.workspacePackage,
						} as PackageResolvedElement)
			  )
			: elementsOfExecutor;
	});
};
