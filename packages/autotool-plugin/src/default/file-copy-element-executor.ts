import type { AutotoolElement } from 'autotool-plugin';

export interface AutotoolElementFileCopy extends AutotoolElement<'fileCopy'> {
	sourceFile: string;
}
