import type { InternalSetupElement } from 'autotool-plugin';
import type { ExecutorMap } from '../executor-map.type.js';

/**
 * Returns a smaller list of elements if their executor can consolidate them
 *
 * Original ordering of the elements is not respected! It's not important and
 * easier to implement like this.
 */
export const consolidateSetupElementsAndFilterOutNonExecutable = (
	elements: InternalSetupElement[],
	executorMap: ExecutorMap
): InternalSetupElement[] => {
	return [...executorMap.values()].flatMap((executor) => {
		const elementsOfExecutor = elements.filter((element) => element.executor === executor.type);
		return executor.consolidate ? executor.consolidate(elementsOfExecutor) : elementsOfExecutor;
	});
};
