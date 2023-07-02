import { describe, expect, it } from 'vitest';
import { getLargestVersion } from './get-largest-version.function.js';

describe('getLargestVersion', () => {
	it('should be able to find the largest version', () => {
		const a = '1.1.1';
		const b = '1.2.0';
		const c = '2.9.0';

		const result = getLargestVersion(a, b, c);
		expect(result).toEqual(c);
	});

	it('should be able to find the largest version with version ranges mixed in', () => {
		const a = '^1.1.1';
		const b = '~1.2.0';

		const result = getLargestVersion(b, a);
		expect(result).toEqual(b);
	});

	it('should prefer the invalid version if one is invalid', () => {
		const a = '^1.1.1';
		const b = 'workspace:^';

		const result = getLargestVersion(b, a);
		expect(result).toEqual(b);
	});

	it('should prefer the defined version over undefined', () => {
		const a = '^1.1.1';

		const result = getLargestVersion(undefined, a);
		expect(result).toEqual(a);
	});

	it('should prefer the invalid version over undefined', () => {
		const b = 'workspace:^';

		const result = getLargestVersion(undefined, b);
		expect(result).toEqual(b);
	});

	it('should prefer the invalid version over undefined', () => {
		const result = getLargestVersion();
		expect(result).toEqual('*');
	});
});
