import type {
	AutotoolElement,
	ElementError,
	PackageResolvedElement,
	WorkspacePackage,
} from 'autotool-plugin';

export interface PackageElementErrorWithSourceData extends ElementError {
	workspacePackage: WorkspacePackage;
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
