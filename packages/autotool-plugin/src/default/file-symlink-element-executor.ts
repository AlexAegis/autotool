import type { AutotoolElement } from 'autotool-plugin';

export interface AutotoolElementFileSymlink extends AutotoolElement<'fileSymlink'> {
	sourceFile: string;
	sourcePluginPackageName: string;
}

export const isAutotoolElementFileSymlink = (
	element: AutotoolElement,
): element is AutotoolElementFileSymlink => {
	return element.executor === 'fileSymlink';
};
