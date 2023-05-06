import type { AutotoolElement } from '../autotool-element.interface.js';
import type { WorkspacePackageElementsByTarget } from '../workspace-package-elements-by-target.interface.js';
import type { ElementError } from './element-error.interface.js';

/**
 * When returns a non-empty array, the validator will halt execution.
 */
export type AutotoolElementValidator<
	Element extends AutotoolElement<string> = AutotoolElement<string>
> = (workspacePackageElementsByTarget: WorkspacePackageElementsByTarget<Element>) => ElementError[];
