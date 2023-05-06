import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type {
	AutotoolElement,
	AutotoolElementExecutor,
	AutotoolPlugin,
	ElementError,
	InternalElement,
} from 'autotool-plugin';

export type ExecutorMap = Map<string, AutotoolElementExecutor<AutotoolElement<string>>>;

export interface PackageElementErrorWithSourceData extends ElementError {
	target: string;
	workspacePackage: WorkspacePackage;
	sourcePlugins: AutotoolPlugin[];
	sourceElements: InternalElement[];
}

export type SetupElementWithSourcePlugin = AutotoolElement<string> & {
	sourcePlugin: AutotoolPlugin;
};
export interface WorkspacePackageWithElements {
	workspacePackage: WorkspacePackage;
	elements: InternalElement[];
}

export interface InternalElementsWithResolvedTargets {
	element: InternalElement;
	resolvedTargetFiles: string[];
}

export interface WorkspacePackageWithTargetedElements {
	workspacePackage: WorkspacePackage;
	targetedElements: InternalElementsWithResolvedTargets[];
	untargetedElements: InternalElement[];
}

/**
 * TODO: remove this, use core
 */
export type ItemOf<T extends readonly unknown[]> = T extends readonly (infer R)[] ? R : never;
