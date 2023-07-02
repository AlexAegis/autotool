import { describe, expect, it } from 'vitest';
import { sortVersions } from './sort-versions.function.js';

describe('sortVersions', () => {
	it('should be able to find the largest version', () => {
		const a = '1.1.1';
		const b = '1.2.0';
		const c = '2.9.0';

		const result = sortVersions([c, b, a]);
		expect(result).toEqual([a, b, c]);
	});

	it('should be able to find the largest version with version ranges mixed in', () => {
		const a = '^1.1.1';
		const b = '~1.2.0';

		const result = sortVersions([b, a]);
		expect(result).toEqual([a, b]);
	});

	it('should prefer the invalid version if one is invalid', () => {
		const a = '^1.1.1';
		const b = 'workspace:^';

		const result = sortVersions([b, a]);
		expect(result).toEqual([a, b]);
	});

	it('should prefer the defined version over undefined', () => {
		const a = '^1.1.1';

		const result = sortVersions([undefined, a]);
		expect(result).toEqual(['*', a]);
	});

	it('should prefer the invalid version over undefined', () => {
		const b = 'workspace:^';

		const result = sortVersions([undefined, b]);
		expect(result).toEqual(['*', b]);
	});

	it('should return an empty array for an empty array', () => {
		const result = sortVersions([]);
		expect(result).toEqual([]);
	});
});
