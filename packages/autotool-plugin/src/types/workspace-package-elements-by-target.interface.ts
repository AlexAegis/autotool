import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type { AutotoolElement, InternalElement } from './autotool-element.interface.js';

export interface WorkspacePackageElementsByTarget<
	Element extends AutotoolElement<string> = AutotoolElement<string>
> {
	workspacePackage: WorkspacePackage;
	targetedElementsByFile: Record<string, InternalElement<Element>[]>;
	untargetedElements: InternalElement<Element>[];
}
