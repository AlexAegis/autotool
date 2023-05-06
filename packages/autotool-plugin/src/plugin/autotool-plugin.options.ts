import { normalizeCwdOption, type CwdOption, type NormalizedCwdOption } from '@alexaegis/fs';
import {
	normalizeLoggerOption,
	type LoggerOption,
	type NormalizedLoggerOption,
} from '@alexaegis/logging';

export interface BaseAutotoolPluginOptions {
	workspaceRoot: string;
}

export type AutotoolPluginOptions = CwdOption & LoggerOption & BaseAutotoolPluginOptions;
export type NormalizedSetupPluginOptions = NormalizedCwdOption &
	NormalizedLoggerOption &
	Required<BaseAutotoolPluginOptions>;

export const normalizeAutotoolPluginOptions = (
	options: AutotoolPluginOptions
): NormalizedSetupPluginOptions => {
	return {
		...normalizeCwdOption(options),
		...normalizeLoggerOption(options),
		workspaceRoot: options.workspaceRoot,
	};
};
