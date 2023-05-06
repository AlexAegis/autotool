import { describe, expect, it } from 'vitest';
import { keepOnlyFirst } from './keep-only-first.function.js';

describe('keepOnlyFirst', () => {
	it('should return an empty array for an empty array', () => {
		expect(keepOnlyFirst([])).toEqual([]);
	});

	it('should return only the first element for an array that has more than one elements', () => {
		const first = {};
		const result = keepOnlyFirst([first, 2, 3]);
		expect(result).toEqual([first]);
		expect(result[0]).toBe(first);
	});
});
