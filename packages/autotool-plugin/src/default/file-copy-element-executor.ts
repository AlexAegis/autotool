import type { AutotoolElement } from 'autotool-plugin';
import type { BuiltInParserName } from 'prettier';

export type Transformer = (content: string) => string;

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

	/**
	 * Transform the file as it being distributed. It runs BEFORE subtituting
	 * variables so you can add additional ones. Including the ones defined in
	 * templateVariables.
	 *
	 * @defaultValue []
	 */
	transformers?: Transformer[];

	/**
	 * Should the copied file be marked as executable by the current user
	 *
	 * Use this when distributing scripts
	 *
	 * @defaultValue false
	 */
	markAsExecutable?: boolean;

	/**
	 * When defined, right before writing the file, it will try to format
	 * it using prettier and the users config. Use 'babel' for js/cjs files,
	 * 'json' for .json, and so on.
	 *
	 * You can also just set it to true to guess the parser from the target
	 * files extension
	 *
	 * @defaultValue undefined
	 */
	formatWithPrettier?: true | BuiltInParserName | string | undefined;
}

export const isAutotoolElementFileCopy = (
	element: AutotoolElement,
): element is AutotoolElementFileCopy => {
	return element.executor === 'fileCopy';
};
