import { dry } from '@alexaegis/common';
import type { AutotoolElementExecutor, AutotoolElementFileCopy } from 'autotool-plugin';
import { cp } from 'node:fs/promises';
import { join } from 'node:path';

export const autotoolElementFileCopyExecutor: AutotoolElementExecutor<AutotoolElementFileCopy> = {
	type: 'file-copy',
	apply: async (element, options): Promise<void> => {
		const filePath = join(options.cwd, element.targetFile);
		const dryCp = dry(options.dry, cp);
		await dryCp(element.sourceFile, filePath);
		options.logger.info(`Copy ${filePath}`);
	},
};
