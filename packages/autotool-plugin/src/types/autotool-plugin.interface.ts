import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type { DefaultAutotoolElements } from '../default/index.js';
import type { AutotoolPluginOptions } from '../plugin/index.js';
import type { AutotoolElementValidator } from '../validator/element-validator.interface.js';
import type { AutotoolElementExecutor } from './autotool-element-executor.interface.js';
import type { AutotoolElement } from './autotool-element.interface.js';
import type { PackageJsonFilter } from './package-json-filter.interface.js';

export type AutotoolPluginElementPackageTargetKind = WorkspacePackage['packageKind'] | 'all';

export interface AutotoolPluginFilter {
	/**
	 * Conditionally apply all elements based on the contents of the target
	 * package.
	 *
	 * You can also set this at the element level.
	 */
	packageJsonFilter?: PackageJsonFilter | undefined;

	/**
	 * 'workspace' means this will only be applied to the root package, the
	 * entire workspace. 'regular' means a normal package thats inside the
	 * workspace. The default 'both' setting will apply the plugin to both
	 * the entire workspace and all inner packages too.
	 *
	 * You can also set this at the element level.
	 *
	 * @default 'both'
	 */
	packageKind?: AutotoolPluginElementPackageTargetKind | undefined;
}

export interface AutotoolPlugin<Elements extends AutotoolElement<string> = DefaultAutotoolElements>
	extends AutotoolPluginFilter {
	/**
	 * Name of the plugin, used for logging.
	 */
	name: string;

	/**
	 * Some elements like JSON properties and files are treated as templates.
	 * Values defined as `${key}` will be replaced if a variable here is found
	 * with the same name.
	 *
	 * Can also be defined per element, will overwrite plugin level variables.
	 */
	templateVariables?: Record<string | number, string> | undefined;

	elements: Elements[];
	executors?: AutotoolElementExecutor<AutotoolElement<string>>[] | undefined;

	/**
	 * The plugin can provide validators. Validators are called after elements
	 * are distributed to their packages, but before they are executed.
	 * If any validator returns an error, execution will not procceed at all.
	 * If you enable `--partial` execution, only the package where the error
	 * originates from is skipped.
	 */
	validators?: AutotoolElementValidator[];
}

export interface SourcePluginInformation {
	sourcePlugin: AutotoolPlugin;
}

export type AutotoolPluginFactory<
	Elements extends AutotoolElement<string> = DefaultAutotoolElements
> = (options: AutotoolPluginOptions) => AutotoolPlugin<Elements> | AutotoolPlugin<Elements>[];
