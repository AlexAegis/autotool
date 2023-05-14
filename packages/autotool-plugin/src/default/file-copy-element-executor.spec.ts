import { describe, expect, it } from 'vitest';
import { isAutotoolElementFileCopy } from './file-copy-element-executor.js';

describe('isAutotoolElementFileCopy', () => {
	it('should return true for elements with a copy executor', () => {
		expect(isAutotoolElementFileCopy({ executor: 'fileCopy' })).toBeTruthy();
	});

	it('should return false for elements with a non-copy executor', () => {
		expect(isAutotoolElementFileCopy({ executor: 'somethingelse' })).toBeFalsy();
	});
});
