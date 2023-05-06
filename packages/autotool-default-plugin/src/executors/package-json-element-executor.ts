import { sleep } from '@alexaegis/common';
import type { AutotoolElementExecutor, AutotoolElementPackageJson } from 'autotool-plugin';

export const autotoolElementJsonExecutor: AutotoolElementExecutor<AutotoolElementPackageJson> = {
	type: 'package-json',
	apply: async (element, target, options): Promise<void> => {
		// TODO: implement writing data to PackageJson, it's already consolidated at this point

		await sleep(0);

		options.logger.info(`Copy ${element.executor} ${target}`);
	},
};
