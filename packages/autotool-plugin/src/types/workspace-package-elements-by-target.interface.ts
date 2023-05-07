import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type { AutotoolElement, PackageResolvedElement } from './autotool-element.interface.js';

export interface WorkspacePackageElementsByTarget<
	Element extends AutotoolElement = AutotoolElement
> {
	workspacePackage: WorkspacePackage;
	targetedElementsByFile: Record<string, PackageResolvedElement<Element>[]>;
	untargetedElements: PackageResolvedElement<Element>[];
}
