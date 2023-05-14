import { describe, expect, it } from 'vitest';
import { isAutotoolElementFileSymlink } from './file-symlink-element-executor.js';

describe('isAutotoolElementFileSymlink', () => {
	it('should return true for elements with a symlink executor', () => {
		expect(isAutotoolElementFileSymlink({ executor: 'fileSymlink' })).toBeTruthy();
	});

	it('should return false for elements with a non-symlink executor', () => {
		expect(isAutotoolElementFileSymlink({ executor: 'somethingelse' })).toBeFalsy();
	});
});
