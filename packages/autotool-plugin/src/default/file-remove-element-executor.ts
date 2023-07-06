import type { AutotoolElement } from 'autotool-plugin';

/**
 * Removes the target file(s). Will conflict with 'fileCopy' if you try to
 * write and remove the same file.
 */
export type AutotoolElementFileRemove = AutotoolElement<'fileRemove'>;

export const isAutotoolElementFileRemove = (
	element: AutotoolElement,
): element is AutotoolElementFileRemove => {
	return element.executor === 'fileRemove';
};
