import {
	normalizeDryOption,
	normalizeForceOption,
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

interface BaseAutotoolOptions {
	dryish?: boolean;
	listPlugins?: boolean;
	filter?: string[] | undefined;
	filterPlugins?: string[] | undefined;
}

export type AutotoolOptions = BaseAutotoolOptions &
	CwdOption &
	LoggerOption &
	DryOption &
	ForceOption;
export type NormalizedAutotoolOptions = Omit<
	Required<BaseAutotoolOptions>,
	'filter' | 'filterPlugins'
> & {
	filter: string[]; // TODO: Explore opt-in RegExp's with the /string/ convention
	filterPlugins: string[]; // TODO: Explore opt-in RegExp's with the /string/ convention
} & NormalizedCwdOption &
	NormalizedLoggerOption &
	NormalizedDryOption &
	NormalizedForceOption;

/**
 * Same as NormalizedAutotoolOptions but without 'dryish'
 */
export type AutotoolElementApplyOptions = Omit<
	Required<BaseAutotoolOptions>,
	'dryish' | 'listPlugins' | 'filter' | 'filterPlugins'
> &
	NormalizedCwdOption &
	NormalizedLoggerOption &
	NormalizedDryOption;

export const normalizeAutotoolOptions = (options?: AutotoolOptions): NormalizedAutotoolOptions => {
	return {
		...normalizeCwdOption(options),
		...normalizeLoggerOption(options),
		...normalizeDryOption(options),
		...normalizeForceOption(options),
		filter: options?.filter ?? [],
		filterPlugins: options?.filterPlugins ?? [],
		dryish: options?.dryish ?? false,
		listPlugins: options?.listPlugins ?? false,
	};
};
