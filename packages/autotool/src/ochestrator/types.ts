import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type {
	InternalSetupElement,
	SetupElement,
	SetupElementError,
	SetupElementExecutor,
	SetupPlugin,
} from 'autotool-plugin';

export type ExecutorMap = Map<string, SetupElementExecutor<SetupElement<string>>>;

export interface PackageSetupElementErrorWithSourceData extends SetupElementError {
	target: string;
	workspacePackage: WorkspacePackage;
	sourcePlugins: SetupPlugin[];
	sourceElements: InternalSetupElement[];
}

export type SetupElementWithSourcePlugin = SetupElement<string> & { sourcePlugin: SetupPlugin };
export interface WorkspacePackageWithElements {
	workspacePackage: WorkspacePackage;
	elements: InternalSetupElement[];
}

export interface InternalSetupElementsWithResolvedTargets {
	element: InternalSetupElement;
	resolvedTargetFiles: string[];
}

export interface WorkspacePackageWithTargetedElements {
	workspacePackage: WorkspacePackage;
	targetedElements: InternalSetupElementsWithResolvedTargets[];
	untargetedElements: InternalSetupElement[];
}

/**
 * TODO: remove this, use core
 */
export type ItemOf<T extends readonly unknown[]> = T extends readonly (infer R)[] ? R : never;
