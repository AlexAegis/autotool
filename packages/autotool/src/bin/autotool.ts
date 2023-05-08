import { YargsBuilder } from '@alexaegis/cli-tools';
import type { PackageJson } from '@alexaegis/workspace-tools';
import packageJson from '../../package.json';
import { autotool, findInstalledPlugins } from '../index.js';
import { yargsForAutotool } from '../ochestrator/autotool.function.yargs.js';

const yarguments = YargsBuilder.withDefaults(packageJson as PackageJson)
	.add(yargsForAutotool)
	.build();

void (async () => {
	const options = await yarguments.parseAsync();

	if (options.listPlugins) {
		const installedPlugins = await findInstalledPlugins(options);
		console.info(installedPlugins.join('\n'));
	} else {
		await autotool(options);
	}
})();
