import { yargsForCwdOption, yargsForDryOption, yargsForForceOption } from '@alexaegis/cli-tools';
import type { LoggerOption } from '@alexaegis/logging';
import type { AutotoolOptions } from 'autotool-plugin';
import type { Argv } from 'yargs';

export const yargsForAutotool = <T>(
	yargs: Argv<T>
): Argv<T & Omit<AutotoolOptions, keyof LoggerOption>> => {
	return yargsForDryOption(yargsForForceOption(yargsForCwdOption(yargs))).option('dryish', {
		boolean: true,
		default: false,
		description:
			"Execute excutors, and trust them that they don't actually write anything to the disk",
	});
};
