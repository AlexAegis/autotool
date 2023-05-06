import { dry } from '@alexaegis/common';
import {
	keepOnlyFirst,
	type AutotoolElementExecutor,
	type AutotoolElementFileRemove,
} from 'autotool-plugin';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { autotoolElementFileCopyExecutor } from './file-copy-element-executor.js';

export const autotoolElementFileRemoveExecutor: AutotoolElementExecutor<AutotoolElementFileRemove> =
	{
		type: 'file-remove',
		conflictsOnTargetLevel: [autotoolElementFileCopyExecutor.type],
		apply: async (_element, target, options): Promise<void> => {
			const filePath = join(options.cwd, target);

			options.logger.info(`Removing ${filePath}`);
			try {
				const dryRm = dry(options.dry, rm);
				await dryRm(filePath);
			} catch (error) {
				if ((error as { code: string }).code === 'ENOENT') {
					options.logger.warn('Failed does not exist');
				} else {
					options.logger.error('Failed to remove file!', error);
				}
			}
		},
		/**
		 * If multiple elements try to remove the same element, just delete it once
		 */
		consolidate: keepOnlyFirst,
	};
