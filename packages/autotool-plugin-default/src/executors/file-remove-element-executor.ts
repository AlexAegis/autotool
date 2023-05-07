import { type AutotoolElementExecutor, type AutotoolElementFileRemove } from 'autotool-plugin';
import { rm } from 'node:fs/promises';

import { autotoolElementFileCopyExecutor } from './file-copy-element-executor.js';

export const autotoolElementFileRemoveExecutor: AutotoolElementExecutor<AutotoolElementFileRemove> =
	{
		type: 'file-remove',
		conflictsOnTargetLevel: [autotoolElementFileCopyExecutor.type],
		apply: async (_element, target, options): Promise<void> => {
			try {
				if (options.dry) {
					options.logger.info(`(DRY) Removing ${target.targetFilePackageRelative}`);
				} else {
					options.logger.info(`Removing ${target.targetFilePackageRelative}`);
					await rm(target.targetFilePathAbsolute);
				}
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
		consolidate: (elements) => elements[0],
	};
