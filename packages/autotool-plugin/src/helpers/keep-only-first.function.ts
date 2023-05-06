/**
 * A simple premade consolidator that keeps only the first element in an array
 * Useful for elements that wouldn't make a differents if multiple of them would
 * be applied to a single file like removing it
 */
export const keepOnlyFirst = <T>(elements: T[]): T[] => {
	const first = elements[0];
	return first ? [first] : [];
};
