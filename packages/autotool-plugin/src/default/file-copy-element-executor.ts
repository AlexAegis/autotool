import type { AutotoolElement } from 'autotool-plugin';

export interface AutotoolElementFileCopy extends AutotoolElement<'file-copy'> {
	sourceFile: string;
}
