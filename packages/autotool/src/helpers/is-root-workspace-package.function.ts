import type { RootWorkspacePackage } from '@alexaegis/workspace-tools';
import type { WorkspacePackage } from 'autotool-plugin';

export const isRootWorkspacePackage = (
	workspacePackage: WorkspacePackage,
): workspacePackage is RootWorkspacePackage => {
	return workspacePackage.packageKind === 'root';
};
