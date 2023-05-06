import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type { InternalSetupElement, SetupElementError, SetupPlugin } from 'autotool-plugin';

export interface PackageSetupElementErrorWithSourceData extends SetupElementError {
	target: string;
	workspacePackage: WorkspacePackage;
	sourcePlugins: SetupPlugin[];
	sourceElements: InternalSetupElement[];
}
