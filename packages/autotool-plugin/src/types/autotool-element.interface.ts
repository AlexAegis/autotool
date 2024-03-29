import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type {
	AutotoolPluginElementPackageTargetKind,
	AutotoolPluginObject,
} from './autotool-plugin.interface.js';
import type { PackageJsonFilter } from './package-json-filter.interface.js';

export interface UntargetedAutotoolElement<Executor extends string = string> {
	/**
	 * Type of the element, used identify the executor for it.
	 */
	executor: Executor;

	/**
	 * A description used for logging of what the element is doing.
	 *
	 * @example 'adding eslint scripts into packageJson'
	 */
	description?: string | undefined;

	/**
	 * 'workspace' means this will only be applied to the root package, the
	 * entire workspace. 'regular' means a normal package thats inside the
	 * workspace. The default 'both' setting will apply the element to both
	 * the entire workspace and all inner packages too.
	 *
	 * You can also set this at the plugin level.
	 *
	 * @default 'both'
	 */
	packageKind?: AutotoolPluginElementPackageTargetKind | undefined;

	/**
	 * Conditionally apply the element based on the contents of the target
	 * package.
	 *
	 * You can also set this at the plugin level, both has to match in order
	 * for the element to be applied.
	 */
	packageJsonFilter?: PackageJsonFilter | undefined;

	/**
	 * Some elements like JSON properties and files are treated as templates.
	 * Values defined as `${key}` will be replaced if a variable here is found
	 * with the same name.
	 *
	 * Can also be defined on the plugin, but these  will take precedence over
	 * plugin level variables.
	 */
	templateVariables?: Record<string | number, string> | undefined;

	/**
	 * If an element is marked legacy it will always be removed, if you change
	 * an element where that change is not fully overlapping with the original
	 * element. For example if for a packageJson script element, you change its
	 * key, you have to remave the old one. In this case, don't just change the
	 * element, but create a new one and mark the old one as deprecated.
	 * With time, as a breaking change you can remove the deprecated elements
	 * once you know it's been applied everywhere, or just keep them around.
	 *
	 * @default false
	 */
	deprecated?: boolean | undefined;
}

export interface AutotoolElement<Executor extends string = string>
	extends UntargetedAutotoolElement<Executor> {
	/**
	 * You can define file(s) for an element to operate on.
	 *
	 * You can also use `targetFilePatterns` if you want to use globs
	 * to target multiple existing files, for example if you want to remove
	 * multiple at once.
	 *
	 */
	targetFile?: string[] | string | undefined;

	/**
	 * Files mentioned here will only be targeted if they already exist!
	 * When `undefined` the element is treated "untargeted"
	 * and is not checked for conflicts.
	 *
	 * Both targetFile and targetFilePatterns
	 */
	targetFilePatterns?: string[] | string | undefined;
}

export interface TargetedElementAdditionalMetadata {
	targetFile: string;
	workspacePackage: WorkspacePackage;
}

export type ElementForPackage<Element extends UntargetedAutotoolElement> = Omit<
	Element,
	'packageKind' | 'packageJsonFilter'
>;

export interface PackageResolvedElement<
	Element extends UntargetedAutotoolElement = UntargetedAutotoolElement,
> {
	element: ElementForPackage<Element>;
	workspacePackage: WorkspacePackage;
	sourcePlugin: AutotoolPluginObject<Element> | undefined;
}

export type AppliedElement<Element extends UntargetedAutotoolElement = UntargetedAutotoolElement> =
	Omit<ElementForPackage<Element>, 'targetFile' | 'targetFilePatterns' | 'type'>;
