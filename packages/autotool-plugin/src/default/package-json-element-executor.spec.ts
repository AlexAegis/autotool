import { describe, expect, it } from 'vitest';
import { isAutotoolElementPackageJson } from './package-json-element-executor.js';

describe('isAutotoolElementPackageJson', () => {
	it('should return true for elements with a packageJson executor', () => {
		expect(isAutotoolElementPackageJson({ executor: 'packageJson' })).toBeTruthy();
	});

	it('should return false for elements with a non-packageJson executor', () => {
		expect(isAutotoolElementPackageJson({ executor: 'somethingelse' })).toBeFalsy();
	});
});
