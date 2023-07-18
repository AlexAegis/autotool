import {
	normalizeDryOption,
	normalizeForceOption,
	normalizeRegExpLikeToRegExp,
	type Defined,
	type DryOption,
	type ForceOption,
	type NormalizedDryOption,
	type NormalizedForceOption,
} from '@alexaegis/common';
import { normalizeCwdOption, type CwdOption, type NormalizedCwdOption } from '@alexaegis/fs';
import {
	normalizeLoggerOption,
	type LoggerOption,
	type NormalizedLoggerOption,
} from '@alexaegis/logging';
import {
	normalizeCollectWorkspacePackagesOptions,
	type CollectWorkspacePackagesOptions,
	type NormalizedCollectWorkspacePackagesOptions,
} from '@alexaegis/workspace-tools';

export interface BaseAutotoolOptions {
	dryish?: boolean;
	listPlugins?: boolean;
	enabledPlugins?: (string | RegExp)[] | undefined;
	disabledPlugins?: (string | RegExp)[] | undefined;

	/**
	 * Autotool can re-run itself if a plugin adds more plugins. This allows
	 * the usage of meta-plugins that just add more plugins. The default value
	 * is 3 meaning a meta plugin can install more meta plugins but those can't
	 * install more meta plugins.
	 *
	 * To avoid infinite loops this option is lowered every time a new
	 * recursion happens. If it's less than 0, autotool exits immediately,
	 * breaking the loop.
	 *
	 * You usually don't want to change this value, but by changing it to 1
	 * you can effectively disable recursion. Or you can increase it if your
	 * setup needs it.
	 *
	 * @internal
	 * @defaultValue 3
	 */
	maxAllowedRecursion?: number | undefined;
}

export type AdditionalAutotoolOptions = CwdOption & LoggerOption & DryOption & ForceOption;
export type NormalizedAdditionalAutotoolOptions = NormalizedCwdOption &
	NormalizedLoggerOption &
	NormalizedDryOption &
	NormalizedForceOption;

export type AutotoolOptions = BaseAutotoolOptions &
	AdditionalAutotoolOptions &
	CollectWorkspacePackagesOptions;

export type NormalizedAutotoolOptions = Omit<
	Defined<BaseAutotoolOptions>,
	'enabledPlugins' | 'disabledPlugins'
> & {
	enabledPlugins: RegExp[];
	disabledPlugins: RegExp[];
} & NormalizedAdditionalAutotoolOptions &
	NormalizedCollectWorkspacePackagesOptions;

/**
 * Same as NormalizedAutotoolOptions but without options that are not relevant
 * or already normalized by the time an element is applied.
 */
export type AutotoolElementApplyOptions = Pick<BaseAutotoolOptions, 'maxAllowedRecursion'> &
	NormalizedAdditionalAutotoolOptions;

export const normalizeAutotoolOptions = (options?: AutotoolOptions): NormalizedAutotoolOptions => {
	return {
		...normalizeCwdOption(options),
		...normalizeLoggerOption(options),
		...normalizeDryOption(options),
		...normalizeForceOption(options),
		...normalizeCollectWorkspacePackagesOptions(options),
		enabledPlugins: options?.enabledPlugins?.map(normalizeRegExpLikeToRegExp) ?? [],
		disabledPlugins: options?.disabledPlugins?.map(normalizeRegExpLikeToRegExp) ?? [],
		dryish: options?.dryish ?? false,
		listPlugins: options?.listPlugins ?? false,
		maxAllowedRecursion: options?.maxAllowedRecursion ?? 3,
	};
};
