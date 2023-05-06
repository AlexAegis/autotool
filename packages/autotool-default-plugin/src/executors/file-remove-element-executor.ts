import { dry } from '@alexaegis/common';
import type { AutotoolElementExecutor, AutotoolElementFileRemove } from 'autotool-plugin';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { autotoolElementFileCopyExecutor } from './file-copy-element-executor.js';

export const autotoolElementFileRemoveExecutor: AutotoolElementExecutor<AutotoolElementFileRemove> =
	{
		type: 'file-remove',
		conflictsOnTargetLevel: [autotoolElementFileCopyExecutor.type],
		apply: async (element, options): Promise<void> => {
			const filePath = join(options.cwd, element.targetFile);
			const dryRm = dry(options.dry, rm);
			await dryRm(filePath);
			options.logger.info(`Removing ${filePath}`);
		},
	};
