import { normalizeDryOption, type DryOption, type NormalizedDryOption } from '@alexaegis/common';
import { normalizeCwdOption, type CwdOption, type NormalizedCwdOption } from '@alexaegis/fs';
import {
	normalizeLoggerOption,
	type LoggerOption,
	type NormalizedLoggerOption,
} from '@alexaegis/logging';

interface BaseAutotoolOptions {
	dryish?: boolean;
}

export type AutotoolOptions = BaseAutotoolOptions & CwdOption & LoggerOption & DryOption;
export type NormalizedAutotoolOptions = Required<BaseAutotoolOptions> &
	NormalizedCwdOption &
	NormalizedLoggerOption &
	NormalizedDryOption;

export const normalizeAutotoolOptions = (options?: AutotoolOptions): NormalizedAutotoolOptions => {
	return {
		...normalizeCwdOption(options),
		...normalizeLoggerOption(options),
		...normalizeDryOption(options),
		dryish: options?.dryish ?? false,
	};
};
