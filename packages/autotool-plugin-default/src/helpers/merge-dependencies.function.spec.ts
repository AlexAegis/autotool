import type { Dependency } from '@schemastore/package';
import { describe, expect, it } from 'vitest';
import { mergeDependencies } from './merge-dependencies.function.js';

describe('mergeDependencies', () => {
	it('should be able to retain keys from both dependencies object', () => {
		const a: Dependency = {
			foo: '1.0.0',
		};
		const b: Dependency = {
			bar: '1.0.0',
		};

		const expected: Dependency = {
			foo: '1.0.0',
			bar: '1.0.0',
		};

		const result = mergeDependencies(a, b);
		expect(result).toEqual(expected);
	});

	it('should drop keys that are explicitly undefined', () => {
		const a: Dependency = {
			foo: '1.0.0',
			bar: '1.0.0',
		};
		const b: Dependency = {
			bar: undefined,
		};

		const expected: Dependency = {
			foo: '1.0.0',
		};

		expect(mergeDependencies(a, b)).toEqual(expected);
		expect(mergeDependencies(b, a)).toEqual(expected);
	});

	it('should prefer workspace versions', () => {
		const a: Dependency = {
			foo: '1.0.0',
		};
		const b: Dependency = {
			foo: 'workspace:^',
		};

		const expected: Dependency = {
			foo: 'workspace:^',
		};

		const result = mergeDependencies(a, b);
		expect(result).toEqual(expected);
	});
});
