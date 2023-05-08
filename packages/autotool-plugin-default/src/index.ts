import type { AutotoolPluginObject, DefaultAutotoolElements } from 'autotool-plugin';
import packageJson from '../package.json';
import {
	autotoolElementFileCopyExecutor,
	autotoolElementFileRemoveExecutor,
	autotoolElementFileSymlinkExecutor,
	autotoolElementJsonExecutor,
} from './executors/index.js';
import { validateRootElementNotModifyingPackages } from './validators/index.js';

export const defaultPlugin: AutotoolPluginObject<DefaultAutotoolElements> = {
	name: packageJson.name,
	executors: {
		fileCopy: autotoolElementFileCopyExecutor,
		fileRemove: autotoolElementFileRemoveExecutor,
		fileSymlink: autotoolElementFileSymlinkExecutor,
		packageJson: autotoolElementJsonExecutor,
	},
	validators: [validateRootElementNotModifyingPackages],
};

export default defaultPlugin;
