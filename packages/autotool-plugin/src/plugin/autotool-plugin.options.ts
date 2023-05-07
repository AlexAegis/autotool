import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import {
	normalizeAutotoolOptions,
	type AutotoolOptions,
	type NormalizedAutotoolOptions,
} from './autotool.function.options.js';

export interface BaseAutotoolPluginOptions {
	workspaceRootPackage: WorkspacePackage;
}

export type AutotoolPluginOptions = AutotoolOptions & BaseAutotoolPluginOptions;
export type NormalizedAutotoolPluginOptions = NormalizedAutotoolOptions &
	Required<BaseAutotoolPluginOptions>;

export const normalizeAutotoolPluginOptions = (
	options: AutotoolPluginOptions
): NormalizedAutotoolPluginOptions => {
	return {
		...normalizeAutotoolOptions(options),
		workspaceRootPackage: options.workspaceRootPackage,
	};
};
