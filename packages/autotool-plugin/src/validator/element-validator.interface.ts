import type { AutotoolElement, WorkspacePackageElementsByTarget } from '../types/index.js';
import type { ElementError } from './element-error.interface.js';

/**
 * When returns a non-empty array, the validator will halt execution.
 */
export type AutotoolElementValidator<Element extends AutotoolElement = AutotoolElement> = (
	woackageElementsByTarget: WorkspacePackageElementsByTarget<Element>
) => ElementError[];
