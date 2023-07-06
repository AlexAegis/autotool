import type { RootWorkspacePackage } from '@alexaegis/workspace-tools';
import { join } from 'node:path';

export const getAssumedFinalInstallLocationOfPackage = (
	rootWorkspacePackage: RootWorkspacePackage,
	packageJsonName: string,
): string => {
	return join(rootWorkspacePackage.packagePath, 'node_modules', ...packageJsonName.split('/'));
};
