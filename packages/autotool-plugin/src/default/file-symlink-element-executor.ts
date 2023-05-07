import type { AutotoolElement } from 'autotool-plugin';

export interface AutotoolElementFileSymlink extends AutotoolElement<'fileSymlink'> {
	sourceFile: string;
}
