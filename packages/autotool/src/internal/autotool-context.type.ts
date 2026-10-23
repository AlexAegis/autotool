import type { RootWorkspacePackage, WorkspacePackage } from '@alexaegis/workspace-tools';
import type {
	AutotoolElement,
	AutotoolElementValidator,
	AutotoolPluginObject,
	ExecutorMap,
	PackageManager,
} from 'autotool-plugin';

export interface AutotoolContext<Elements extends AutotoolElement = AutotoolElement> {
	plugins: AutotoolPluginObject<Elements>[];
	executorMap: ExecutorMap<Elements>;
	validators: AutotoolElementValidator<Elements>[];
	packageManager: PackageManager;
	rootWorkspacePackage: RootWorkspacePackage;
	allWorkspacePackages: WorkspacePackage[];
}
