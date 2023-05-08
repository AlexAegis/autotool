import { YargsBuilder } from '@alexaegis/cli-tools';
import { createLogger } from '@alexaegis/logging';
import type { PackageJson } from '@alexaegis/workspace-tools';
import type { AutotoolOptions } from 'autotool-plugin';
import packageJson from '../../package.json';
import { autotool, findInstalledPlugins } from '../index.js';
import { yargsForAutotool } from '../ochestrator/autotool.function.yargs.js';

const yarguments = YargsBuilder.withDefaults(packageJson as PackageJson)
	.add(yargsForAutotool)
	.build();

void (async () => {
	const args = await yarguments.parseAsync();
	const options: AutotoolOptions = {
		...args,
		logger: createLogger({
			// TODO: try to make this automatic during parse using maybe 'coerce'
			name: packageJson.name,
			minLevel: args.logLevel,
		}),
	};

	if (options.listPlugins) {
		const installedPlugins = await findInstalledPlugins(options);
		console.info(installedPlugins.join('\n'));
	} else {
		await autotool(options);
	}
})();
