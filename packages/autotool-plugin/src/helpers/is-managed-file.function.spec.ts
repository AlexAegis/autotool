import type { PathLike } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DISTRIBUTION_MARK, isManagedFile } from './is-managed-file.function.js';

vi.mock('node:fs/promises', () => {
	return {
		readFile: vi.fn((path: PathLike): string | undefined => {
			if (path.toString() === 'distributed') {
				return DISTRIBUTION_MARK;
			} else if (path.toString() === 'edited') {
				return 'edited';
			} else {
				throw new Error('File does not exist!');
			}
		}),
	};
});

describe('isManagedFile', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should return true if the file contains the mark', async () => {
		expect(await isManagedFile('distributed')).toBeTruthy();
	});

	it('should return false if the file does not contain the mark', async () => {
		expect(await isManagedFile('edited')).toBeFalsy();
	});

	it('should return false if the file does not exist', async () => {
		expect(await isManagedFile('nonexistent')).toBeFalsy();
	});
});
