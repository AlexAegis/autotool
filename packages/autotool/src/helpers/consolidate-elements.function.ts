import { isNullish } from '@alexaegis/common';
import type {
	AutotoolElement,
	ExecutorMap,
	PackageResolvedElement,
	WorkspacePackage,
} from 'autotool-plugin';

/**
 * Returns a smaller list of elements if their executor can consolidate them
 *
 * Original ordering of the elements is not respected! It's not important and
 * easier to implement like this.
 *
 * I also drops all elements that do not have an executor. This is checkd for
 * in an earlier step anyway, which would result in an error.
 */
export const consolidateElementsAndFilterOutNonExecutables = <
	Elements extends AutotoolElement = AutotoolElement
>(
	elements: PackageResolvedElement<Elements>[],
	workspacePackage: WorkspacePackage,
	executorMap: ExecutorMap<Elements>
): PackageResolvedElement<Elements>[] => {
	return [...executorMap.values()].flatMap((executor) => {
		const elementsOfExecutor = elements.filter(
			(packageElement) => packageElement.element.executor === executor.type
		);
		if (executor.consolidate) {
			const consolidated = executor.consolidate(elementsOfExecutor.map((e) => e.element));

			if (isNullish(consolidated)) {
				return [];
			} else if (Array.isArray(consolidated)) {
				return consolidated.map<PackageResolvedElement<Elements>>((element) => ({
					element: element as Elements,
					sourcePlugin: executor.sourcePlugin,
					workspacePackage,
				}));
			} else {
				return {
					element: consolidated,
					sourcePlugin: executor.sourcePlugin,
					workspacePackage,
				} as PackageResolvedElement<Elements>;
			}
		} else {
			return elementsOfExecutor;
		}
	});
};