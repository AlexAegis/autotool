import type { Awaitable } from '@alexaegis/common';
import type { NormalizedAutotoolPluginOptions } from '../index.js';
import type {
	AutotoolElement,
	ExecutorMap,
	WorkspacePackageElementsByTarget,
} from '../types/index.js';
import type { ElementError } from './element-error.interface.js';

/**
 * When returns a non-empty array, the validator will halt execution.
 */
export type AutotoolElementValidator<Element extends AutotoolElement = AutotoolElement> = (
	workspacePackageElementsByTarget: WorkspacePackageElementsByTarget<Element>,
	executorMap: ExecutorMap,
	options: NormalizedAutotoolPluginOptions,
) => Awaitable<ElementError[]>;
