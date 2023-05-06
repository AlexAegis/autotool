import type { AutotoolPlugin } from 'autotool-plugin';

import {
	autotoolElementFileCopyExecutor,
	autotoolElementFileRemoveExecutor,
	autotoolElementFileSymlinkExecutor,
	autotoolElementJsonExecutor,
} from './executors/index.js';
import { validateRootElementNotModifyingPackages } from './validators/index.js';

export default {
	name: 'default',
	executors: [
		autotoolElementFileCopyExecutor,
		autotoolElementFileRemoveExecutor,
		autotoolElementFileSymlinkExecutor,
		autotoolElementJsonExecutor,
	],
	validators: [validateRootElementNotModifyingPackages],
} as AutotoolPlugin;
