import type { AutotoolElement } from 'autotool-plugin';

/**
 * Removes the target file(s). Will conflict with 'fileCopy' if you try to
 * write and remove the same file.
 */
export type AutotoolElementFileRemove = AutotoolElement<'fileRemove'>;
