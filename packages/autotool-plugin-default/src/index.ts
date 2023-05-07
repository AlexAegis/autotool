import type { AutotoolPluginObject, DefaultAutotoolElements } from 'autotool-plugin';
import {
	autotoolElementFileCopyExecutor,
	autotoolElementFileRemoveExecutor,
	autotoolElementFileSymlinkExecutor,
	autotoolElementJsonExecutor,
} from './executors/index.js';
import { validateRootElementNotModifyingPackages } from './validators/index.js';

export const defaultPlugin: AutotoolPluginObject<DefaultAutotoolElements> = {
	name: 'default',
	executors: {
		fileCopy: autotoolElementFileCopyExecutor,
		fileRemove: autotoolElementFileRemoveExecutor,
		fileSymlink: autotoolElementFileSymlinkExecutor,
		packageJson: autotoolElementJsonExecutor,
	},
	validators: [validateRootElementNotModifyingPackages],
};

export const customPlugin: AutotoolPluginObject<{ executor: 'asd' }> = {
	name: 'default',
	validators: [validateRootElementNotModifyingPackages],
};

export default defaultPlugin;
