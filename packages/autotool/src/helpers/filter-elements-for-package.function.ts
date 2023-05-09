import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type { AutotoolPluginObject, PackageResolvedElement } from 'autotool-plugin';
import type { WorkspacePackageWithElements } from '../internal/types.js';
import { elementAndPluginFilter } from './element-and-plugin-filter.function.js';

/**
 * Filters down each element for a package
 */
export const filterElementsForPackage = (
	workspacePackage: WorkspacePackage,
	setupPlugins: AutotoolPluginObject[]
): WorkspacePackageWithElements => {
	return {
		workspacePackage,
		elements: setupPlugins
			.filter((plugin) => elementAndPluginFilter(workspacePackage, plugin))
			.flatMap(
				(sourcePlugin) =>
					sourcePlugin.elements
						?.filter((element) => elementAndPluginFilter(workspacePackage, element))
						.map<PackageResolvedElement>((element) => ({
							element,
							sourcePlugin,
							workspacePackage,
						})) ?? []
			),
	};
};
