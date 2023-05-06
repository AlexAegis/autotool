import type { AutotoolElement } from 'autotool-plugin';

/**
 * Removes the target file(s). Will conflict with 'file-copy' if you try to
 * write and remove the same file.
 */
export type AutotoolElementFileRemove = AutotoolElement<'file-remove'>;
