import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type {
	AutotoolElement,
	AutotoolElementExecutor,
	AutotoolPluginObject,
	ElementError,
	PackageResolvedElement,
} from 'autotool-plugin';

export type ExecutorMap<Elements extends AutotoolElement = AutotoolElement> = Map<
	string,
	AutotoolElementExecutor<Elements>
>;

export interface PackageElementErrorWithSourceData extends ElementError {
	target: string;
	workspacePackage: WorkspacePackage;
	sourcePlugins: AutotoolPluginObject[];
	sourceElements: PackageResolvedElement[];
}

export interface WorkspacePackageWithElements<Elements extends AutotoolElement = AutotoolElement> {
	workspacePackage: WorkspacePackage;
	elements: PackageResolvedElement<Elements>[];
}

export interface InternalElementsWithResolvedTargets<
	Elements extends AutotoolElement = AutotoolElement
> {
	element: PackageResolvedElement<Elements>;
	resolvedTargetFiles: string[];
}

export interface WorkspacePackageWithTargetedElements<
	Elements extends AutotoolElement = AutotoolElement
> {
	workspacePackage: WorkspacePackage;
	targetedElements: InternalElementsWithResolvedTargets<Elements>[];
	untargetedElements: PackageResolvedElement<Elements>[];
}

/**
 * TODO: remove this, use core
 */
export type ItemOf<T extends readonly unknown[]> = T extends readonly (infer R)[] ? R : never;
