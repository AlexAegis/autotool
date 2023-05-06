import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type { AutotoolElementApplyOptions } from '../plugin/index.js';
import type { AppliedElement, AutotoolElement } from './autotool-element.interface.js';

export interface ElementTarget {
	workspacePackage: WorkspacePackage;
	/**
	 * The path to the target file from `cwd`
	 */
	targetFilePath: string;
	/**
	 * The absolute path to the target file
	 */
	targetFilePathAbsolute: string;
	/**
	 * The path to the file from the directory of the packageFile
	 */
	targetFilePackageRelative: string;
}

/**
 * Executors are not executed at all in `dry` mode, but for better debuggability
 * executor authors are encuraged to use the `dry` option and put actual write
 * actions behing a check. The CLI has an option called `dryish` which will
 * let executors to be executed, but their `dry` option will be on.
 */
export interface AutotoolElementExecutor<Element extends AutotoolElement<string>> {
	/**
	 * The name of the executor, it should be unique. Elements will be
	 * applied based on this field.
	 */
	type: Element['executor'];

	/**
	 * Halts execution if these elements are also present on the package
	 */
	conflictsOnPackageLevel?: string[];

	/**
	 * Halts execution if these elements are also present on a specific file
	 * target within a package
	 * @example ['file-copy'] -> is defined on SetupElementFileCopy meaning
	 * it will refuse to copy to the same location twice. It's also defined on
	 * SetupElementFileRemove meaning it will refuse to remove an element
	 * that's scheduled to be overwritten anyway.
	 */
	conflictsOnTargetLevel?: string[];

	apply: (
		element: Omit<Element, 'targetFile' | 'targetFilePatterns'>,
		target: ElementTarget,
		options: AutotoolElementApplyOptions
	) => Promise<void>;

	/**
	 * When defined, these elements can be un-applied. For elements that are
	 * meant to delete files there's no point in having an undo step. But
	 * elements that copy/create files, and undo step could remove them.
	 *
	 * One scenario where elements are undone is when one is marked as
	 * deprecated becuase you replaced it with a newer/different element.
	 *
	 * TODO: maybe instead of undo, call it 'clean' that can always be called, there are not many scenarios where undo is truly possible, or is it better to have dedicated cleaning elements in a plugin?
	 */
	undo?: (
		element: AppliedElement<Element>,
		options: AutotoolElementApplyOptions
	) => Promise<void>;

	/**
	 * When defined, elements of this type are consolidated to a single element per target
	 * Only called when more than one element of the same type is present on a filetarget.
	 *
	 * Even if you can consolidate elements into a single element, you still
	 * need to return it in an array. This is to not limit you into only
	 * one kind of consolidation where you must have to consolidate elements
	 * down to one element. Consolidation is optional anyway.
	 *
	 * It will be called once for every target!
	 *
	 * This is not called at all for elements that are not targeted!
	 *
	 * @example If multiple elements try to add something to 'package.json' first they are
	 * consolidated into one element, and only then written
	 */
	consolidate?: (
		elements: AppliedElement<Element>[]
	) => AppliedElement<Element>[] | AppliedElement<Element> | undefined;
}
