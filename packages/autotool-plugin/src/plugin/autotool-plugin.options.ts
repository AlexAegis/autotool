import { normalizeDryOption, normalizeForceOption, type Defined } from '@alexaegis/common';
import { normalizeCwdOption } from '@alexaegis/fs';
import { normalizeLoggerOption } from '@alexaegis/logging';
import type { RootWorkspacePackage, WorkspacePackage } from '@alexaegis/workspace-tools';
import type { PackageManager } from '../helpers/discover-package-manager.function.js';
import type {
	AdditionalAutotoolOptions,
	NormalizedAdditionalAutotoolOptions,
} from './autotool.function.options.js';

export const AUTOTOOL_PLUGIN_NAME_PREFIX = 'autotool-plugin';

export interface BaseAutotoolPluginOptions {
	rootWorkspacePackage: RootWorkspacePackage;
	allWorkspacePackages: WorkspacePackage[];
	packageManager: PackageManager;
}

export type NormalizedBaseAutotoolPluginOptions = Defined<BaseAutotoolPluginOptions>;

export type AutotoolPluginOptions = AdditionalAutotoolOptions & BaseAutotoolPluginOptions;
export type NormalizedAutotoolPluginOptions = NormalizedAdditionalAutotoolOptions &
	NormalizedBaseAutotoolPluginOptions;

export const normalizeAutotoolPluginOptions = (
	options: AutotoolPluginOptions,
): NormalizedAutotoolPluginOptions => {
	return {
		...normalizeCwdOption(options),
		...normalizeLoggerOption(options),
		...normalizeDryOption(options),
		...normalizeForceOption(options),
		rootWorkspacePackage: options.rootWorkspacePackage,
		allWorkspacePackages: options.allWorkspacePackages,
		packageManager: options.packageManager,
	};
};
