import type { AutotoolElement } from 'autotool-plugin';

export interface AutotoolElementFileCopy extends AutotoolElement<'fileCopy'> {
	/**
	 * Should be a relative path from the packages directory.
	 */
	sourceFile: string;
}
