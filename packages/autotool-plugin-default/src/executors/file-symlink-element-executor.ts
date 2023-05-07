import { dry } from '@alexaegis/common';
import type { AutotoolElementExecutor, AutotoolElementFileSymlink } from 'autotool-plugin';
import { symlink } from 'node:fs/promises';

export const autotoolElementFileSymlinkExecutor: AutotoolElementExecutor<AutotoolElementFileSymlink> =
	{
		type: 'fileSymlink',
		apply: async (element, target, options): Promise<void> => {
			const drySymlink = dry(options.dry, symlink);
			await drySymlink(element.sourceFile, target.targetFilePath);
			options.logger.info(`Symlink ${target.targetFilePath}`);
		},
	};
