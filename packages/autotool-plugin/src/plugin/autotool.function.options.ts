import { normalizeDryOption, type DryOption, type NormalizedDryOption } from '@alexaegis/common';
import { normalizeCwdOption, type CwdOption, type NormalizedCwdOption } from '@alexaegis/fs';
import {
	normalizeLoggerOption,
	type LoggerOption,
	type NormalizedLoggerOption,
} from '@alexaegis/logging';

interface BaseAutotoolOptions {
	dryish?: boolean;
	listPlugins?: boolean;
}

export type AutotoolOptions = BaseAutotoolOptions & CwdOption & LoggerOption & DryOption;
export type NormalizedAutotoolOptions = Required<BaseAutotoolOptions> &
	NormalizedCwdOption &
	NormalizedLoggerOption &
	NormalizedDryOption;

/**
 * Same as NormalizedAutotoolOptions but without 'dryish'
 */
export type AutotoolElementApplyOptions = Omit<
	Required<BaseAutotoolOptions>,
	'dryish' | 'listPlugins'
> &
	NormalizedCwdOption &
	NormalizedLoggerOption &
	NormalizedDryOption;

export const normalizeAutotoolOptions = (options?: AutotoolOptions): NormalizedAutotoolOptions => {
	return {
		...normalizeCwdOption(options),
		...normalizeLoggerOption(options),
		...normalizeDryOption(options),
		dryish: options?.dryish ?? false,
		listPlugins: options?.listPlugins ?? false,
	};
};
