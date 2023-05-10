import type {
	AutotoolElement,
	ElementError,
	PackageResolvedElement,
	UntargetedAutotoolElement,
	WorkspacePackage,
} from 'autotool-plugin';

export interface PackageElementErrorWithSourceData extends ElementError {
	workspacePackage: WorkspacePackage;
}

export interface WorkspacePackageWithElements<
	Elements extends UntargetedAutotoolElement = AutotoolElement
> {
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
	untargetedElements: PackageResolvedElement<UntargetedAutotoolElement<Elements['executor']>>[];
}

/**
 * TODO: remove this, use core
 */
export type ItemOf<T extends readonly unknown[]> = T extends readonly (infer R)[] ? R : never;
