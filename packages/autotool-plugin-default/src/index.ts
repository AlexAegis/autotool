import type { AutotoolPluginObject, DefaultAutotoolElements } from 'autotool-plugin';
import packageJson from '../package.json' assert { type: 'json' };
import {
	autotoolElementCustomExecutor,
	autotoolElementFileCopyExecutor,
	autotoolElementFileRemoveExecutor,
	autotoolElementFileSymlinkExecutor,
	autotoolElementJsonExecutor,
} from './executors/index.js';
import {
	validateRootElementNotModifyingPackages,
	validateTargetsAreNotOutsideOfPackage,
	validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget,
} from './validators/index.js';

export const defaultPlugin: AutotoolPluginObject<DefaultAutotoolElements> = {
	name: packageJson.name,
	executors: {
		fileCopy: autotoolElementFileCopyExecutor,
		fileRemove: autotoolElementFileRemoveExecutor,
		fileSymlink: autotoolElementFileSymlinkExecutor,
		packageJson: autotoolElementJsonExecutor,
		custom: autotoolElementCustomExecutor,
	},
	validators: [
		validateTargetsAreNotOutsideOfPackage,
		validateRootElementNotModifyingPackages,
		validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget,
	],
};

export default defaultPlugin;
