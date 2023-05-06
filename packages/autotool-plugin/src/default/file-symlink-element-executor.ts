import type { AutotoolElement } from 'autotool-plugin';

export interface AutotoolElementFileSymlink extends AutotoolElement<'file-symlink'> {
	sourceFile: string;
}
