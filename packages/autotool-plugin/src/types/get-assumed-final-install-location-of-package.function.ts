import { NODE_MODULES_DIRECTORY_NAME } from '@alexaegis/workspace-tools';
import { join } from 'node:path';
import type { BaseAutotoolPluginOptions } from '../plugin/autotool-plugin.options.js';

export const getAssumedFinalInstallLocationOfPackage = (
	options: BaseAutotoolPluginOptions,
	packageJson: { name: string }
): string => {
	return join(
		options.workspaceRootPackage.packagePath,
		NODE_MODULES_DIRECTORY_NAME,
		...packageJson.name.split('/')
	);
};
