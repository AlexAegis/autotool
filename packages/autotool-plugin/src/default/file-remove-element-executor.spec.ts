import { describe, expect, it } from 'vitest';
import { isAutotoolElementFileRemove } from './file-remove-element-executor.js';

describe('isAutotoolElementFileRemove', () => {
	it('should return true for elements with a remove executor', () => {
		expect(isAutotoolElementFileRemove({ executor: 'fileRemove' })).toBeTruthy();
	});

	it('should return false for elements with a non-remove executor', () => {
		expect(isAutotoolElementFileRemove({ executor: 'somethingelse' })).toBeFalsy();
	});
});
