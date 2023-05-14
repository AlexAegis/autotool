import { describe, expect, it } from 'vitest';
import { isAutotoolElementCustom } from './custom-element-executor.js';

describe('isAutotoolElementCustom', () => {
	it('should return true for elements with a custom executor', () => {
		expect(isAutotoolElementCustom({ executor: 'custom' })).toBeTruthy();
	});

	it('should return false for elements with a non-custom executor', () => {
		expect(isAutotoolElementCustom({ executor: 'somethingelse' })).toBeFalsy();
	});
});
