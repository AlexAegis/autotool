import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type { AutotoolPlugin, PackageResolvedElement } from 'autotool-plugin';
import type { WorkspacePackageWithElements } from '../types.js';
import { elementAndPluginFilter } from './element-and-plugin-filter.function.js';

/**
 * Filters down each element for a package
 */
export const filterElementsForPackage = (
	workspacePackage: WorkspacePackage,
	setupPlugins: AutotoolPlugin[]
): WorkspacePackageWithElements => {
	return {
		workspacePackage,
		elements: setupPlugins
			.filter((plugin) => elementAndPluginFilter(workspacePackage, plugin))
			.flatMap((sourcePlugin) =>
				sourcePlugin.elements
					.filter((element) => elementAndPluginFilter(workspacePackage, element))
					.map<PackageResolvedElement>((element) => ({
						element,
						sourcePlugin,
						workspacePackage,
					}))
			),
	};
};
