import { dry } from '@alexaegis/common';
import type { AutotoolElementExecutor, AutotoolElementFileSymlink } from 'autotool-plugin';
import { symlink } from 'node:fs/promises';
import { join } from 'node:path';

export const autotoolElementFileSymlinkExecutor: AutotoolElementExecutor<AutotoolElementFileSymlink> =
	{
		type: 'file-symlink',
		apply: async (element, target, options): Promise<void> => {
			const filePath = join(options.cwd, target);
			const drySymlink = dry(options.dry, symlink);
			await drySymlink(element.sourceFile, filePath);
			options.logger.info(`Symlink ${filePath}`);
		},
	};
