import { YargsBuilder } from '@alexaegis/cli-tools';
import type { PackageJson } from '@alexaegis/workspace-tools';
import packageJson from '../../package.json';
import { autotool } from '../index.js';
import { yargsForAutotool } from '../ochestrator/autotool.function.yargs.js';

const yarguments = YargsBuilder.withDefaults(packageJson as PackageJson)
	.add(yargsForAutotool)
	.build();

void (async () => {
	const options = await yarguments.parseAsync();
	await autotool(options);
})();
