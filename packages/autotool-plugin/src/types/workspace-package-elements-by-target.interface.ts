import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type { PackageManager } from '../helpers/discover-package-manager.function.js';
import type {
	AutotoolElement,
	PackageResolvedElement,
	UntargetedAutotoolElement,
} from './autotool-element.interface.js';

export interface WorkspacePackageElementsByTarget<
	Element extends AutotoolElement = AutotoolElement,
> {
	workspacePackage: WorkspacePackage;
	allWorkspacePackages: WorkspacePackage[];
	packageManager: PackageManager;
	targetedElementsByFile: Record<string, PackageResolvedElement<Element>[]>;
	untargetedElements: PackageResolvedElement<UntargetedAutotoolElement<Element['executor']>>[];
}
