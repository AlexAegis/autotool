import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type { InternalSetupElement, SetupPlugin } from 'autotool-plugin';
import type { WorkspacePackageWithElements } from '../types.interface.js';
import { elementAndPluginFilter } from './element-and-plugin-filter.function.js';

/**
 * Filters down each element for a package
 */
export const filterElementsForPackage = (
	workspacePackage: WorkspacePackage,
	setupPlugins: SetupPlugin[]
): WorkspacePackageWithElements => {
	return {
		workspacePackage,
		elements: setupPlugins
			.filter((plugin) => elementAndPluginFilter(workspacePackage, plugin))
			.flatMap((sourcePlugin) =>
				sourcePlugin.elements
					.filter((element) => elementAndPluginFilter(workspacePackage, element))
					.map<InternalSetupElement>((element) => ({
						...element,
						sourcePlugin,
						workspacePackage,
					}))
			),
	};
};
