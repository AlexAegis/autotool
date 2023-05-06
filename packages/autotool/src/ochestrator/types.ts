import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type {
	AutotoolElement,
	AutotoolElementExecutor,
	AutotoolPlugin,
	ElementError,
	PackageResolvedElement,
} from 'autotool-plugin';

export type ExecutorMap = Map<string, AutotoolElementExecutor<AutotoolElement<string>>>;

export interface PackageElementErrorWithSourceData extends ElementError {
	target: string;
	workspacePackage: WorkspacePackage;
	sourcePlugins: AutotoolPlugin[];
	sourceElements: PackageResolvedElement[];
}

export type SetupElementWithSourcePlugin = AutotoolElement<string> & {
	sourcePlugin: AutotoolPlugin;
};
export interface WorkspacePackageWithElements {
	workspacePackage: WorkspacePackage;
	elements: PackageResolvedElement[];
}

export interface InternalElementsWithResolvedTargets {
	element: PackageResolvedElement;
	resolvedTargetFiles: string[];
}

export interface WorkspacePackageWithTargetedElements {
	workspacePackage: WorkspacePackage;
	targetedElements: InternalElementsWithResolvedTargets[];
	untargetedElements: PackageResolvedElement[];
}

/**
 * TODO: remove this, use core
 */
export type ItemOf<T extends readonly unknown[]> = T extends readonly (infer R)[] ? R : never;
