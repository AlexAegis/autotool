import { normalizeDryOption, normalizeForceOption } from '@alexaegis/common';
import { normalizeCwdOption } from '@alexaegis/fs';
import { normalizeLoggerOption } from '@alexaegis/logging';
import type { RootWorkspacePackage } from '@alexaegis/workspace-tools';
import {
	type AutotoolOptions,
	type NormalizedAutotoolOptions,
} from './autotool.function.options.js';

export interface BaseAutotoolPluginOptions {
	rootWorkspacePackage: RootWorkspacePackage;
}

export type AutotoolPluginOptions = Omit<AutotoolOptions, 'dryish' | 'listPlugins'> &
	BaseAutotoolPluginOptions;
export type NormalizedAutotoolPluginOptions = Omit<
	NormalizedAutotoolOptions,
	'dryish' | 'listPlugins'
> &
	Required<BaseAutotoolPluginOptions>;

export const normalizeAutotoolPluginOptions = (
	options: AutotoolPluginOptions
): NormalizedAutotoolPluginOptions => {
	return {
		...normalizeCwdOption(options),
		...normalizeLoggerOption(options),
		...normalizeDryOption(options),
		...normalizeForceOption(options),
		rootWorkspacePackage: options.rootWorkspacePackage,
	};
};
