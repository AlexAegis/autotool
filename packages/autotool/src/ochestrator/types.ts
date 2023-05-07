import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type {
	AutotoolElement,
	AutotoolElementExecutor,
	AutotoolPluginObject,
	ElementError,
	PackageResolvedElement,
} from 'autotool-plugin';

export type ExecutorMap = Map<string, AutotoolElementExecutor<AutotoolElement<string>>>;

export interface PackageElementErrorWithSourceData extends ElementError {
	target: string;
	workspacePackage: WorkspacePackage;
	sourcePlugins: AutotoolPluginObject[];
	sourceElements: PackageResolvedElement[];
}

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
