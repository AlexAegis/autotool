import { dry } from '@alexaegis/common';
import type { AutotoolElementExecutor, AutotoolElementFileCopy } from 'autotool-plugin';
import { cp } from 'node:fs/promises';

export const autotoolElementFileCopyExecutor: AutotoolElementExecutor<AutotoolElementFileCopy> = {
	type: 'file-copy',
	apply: async (element, target, options): Promise<void> => {
		const dryCp = dry(options.dry, cp);
		await dryCp(element.sourceFile, target.targetFilePathAbsolute);
		options.logger.info(`Copy ${target.targetFilePackageRelative}`);
	},
};
