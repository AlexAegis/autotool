import type { AutotoolElementFileCopy } from './file-copy-element-executor.js';
import type { AutotoolElementFileRemove } from './file-remove-element-executor.js';
import type { AutotoolElementFileSymlink } from './file-symlink-element-executor.js';
import type { AutotoolElementPackageJson } from './package-json-element-executor.js';

export type DefaultAutotoolElements =
	| AutotoolElementFileCopy
	| AutotoolElementFileSymlink
	| AutotoolElementFileRemove
	| AutotoolElementPackageJson;
