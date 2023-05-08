import type { AutotoolElement } from 'autotool-plugin';

export interface AutotoolElementFileCopy extends AutotoolElement<'fileCopy'> {
	/**
	 * Should be a relative path from the packages directory.
	 */
	sourceFile: string;

	/**
	 * The name of the declaring package, this will be used when an element
	 * needs to read a file within the installed plugins node_module
	 */
	sourcePluginPackageName: string;
}

export const isAutotoolElementFileCopy = (
	element: AutotoolElement
): element is AutotoolElementFileCopy => {
	return element.executor === 'fileCopy';
};
