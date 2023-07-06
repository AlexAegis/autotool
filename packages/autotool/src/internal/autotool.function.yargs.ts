import {
	yargsForCollectWorkspacePackagesOptions,
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
	yargs: Argv<T>,
): Argv<
	T &
		NormalizedCwdOption &
		NormalizedDryOption &
		NormalizedForceOption &
		NormalizedLogLevelOption &
		Omit<AutotoolOptions, keyof LoggerOption>
> => {
	return yargsForCollectWorkspacePackagesOptions(
		yargsForLogLevelOption(yargsForDryOption(yargsForForceOption(yargsForCwdOption(yargs)))),
	)
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
		})
		.option('enabledPlugins', {
			array: true,
			string: true,
			description:
				'Use only these plugins. Will use all discoverable plugins ' +
				'that are not also disabled when empty or not provided',
		})
		.option('disabledPlugins', {
			array: true,
			string: true,
			description:
				'Do not use these plugins. Regardless if they are explicity ' +
				'enabled or not. Does not have an effect when left empty',
		});
};
