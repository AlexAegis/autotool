import {
	yargsForCwdOption,
	yargsForDryOption,
	yargsForForceOption,
	yargsForLogLevelOption,
} from '@alexaegis/cli-tools';
import type { NormalizedDryOption, NormalizedForceOption } from '@alexaegis/common';
import type { NormalizedCwdOption } from '@alexaegis/fs';
import type { LoggerOption, NormalizedLogLevelOption } from '@alexaegis/logging';
import type { AutotoolOptions } from 'autotool-plugin';
import type { Argv } from 'yargs';

export const yargsForAutotool = <T>(
	yargs: Argv<T>
): Argv<
	T &
		NormalizedCwdOption &
		NormalizedDryOption &
		NormalizedForceOption &
		NormalizedLogLevelOption &
		Omit<AutotoolOptions, keyof LoggerOption>
> => {
	return yargsForLogLevelOption(yargsForDryOption(yargsForForceOption(yargsForCwdOption(yargs))))
		.option('dryish', {
			boolean: true,
			default: false,
			description:
				"Execute excutors, and trust them that they don't actually write anything to the disk",
		})
		.option('listPlugins', {
			boolean: true,
			default: false,
			description: 'Lists all installed plugins',
		});
};
