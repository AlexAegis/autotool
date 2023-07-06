import type { WorkspacePackage } from 'autotool-plugin';
import { relative } from 'node:path';

export const relativePathBetweenPackages = (
	from: WorkspacePackage,
	to: WorkspacePackage,
): string => {
	return relative(from.packagePath, to.packagePath) || './';
};
