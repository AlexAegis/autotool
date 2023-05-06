import { sleep } from '@alexaegis/common';
import type { PackageJson } from '@alexaegis/workspace-tools';
import type { SetupElement, SetupElementExecutor } from 'autotool-plugin';

export interface SetupElementJson extends SetupElement<'package-json'> {
	data: PackageJson;
}

export const setupElementJsonExecutor: SetupElementExecutor<SetupElementJson> = {
	type: 'package-json',
	apply: async (element, options): Promise<void> => {
		// TODO: implement writing data to PackageJson, it's already consolidated at this point

		await sleep(0);

		options.logger.info(`Copy ${element.executor}`);
	},
};