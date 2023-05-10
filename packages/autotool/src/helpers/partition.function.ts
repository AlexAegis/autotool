/**
 * TODO: This was copied from the aoc repo, find a better place for it
 */
export const partition = <T, O extends T>(
	array: T[],
	partitioner: (a: T) => a is O
): [O[], T[]] => {
	const a: O[] = [];
	const b: T[] = [];
	for (const e of array) {
		if (partitioner(e)) {
			a.push(e);
		} else {
			b.push(e);
		}
	}
	return [a, b];
};
