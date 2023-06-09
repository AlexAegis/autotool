import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type {
	AutotoolElement,
	AutotoolPluginObject,
	PackageResolvedElement,
} from 'autotool-plugin';
import type { WorkspacePackageWithElements } from '../internal/types.js';
import { elementAndPluginFilter } from './element-and-plugin-filter.function.js';

/**
 * Filters down each element for a package
 */
export const filterElementsForPackage = (
	workspacePackage: WorkspacePackage,
	setupPlugins: AutotoolPluginObject<AutotoolElement>[],
): WorkspacePackageWithElements => {
	return {
		workspacePackage,
		elements: setupPlugins
			.filter((plugin) => elementAndPluginFilter(workspacePackage, plugin, plugin))
			.flatMap(
				(sourcePlugin) =>
					sourcePlugin.elements
						?.filter((element) =>
							elementAndPluginFilter(workspacePackage, element, sourcePlugin),
						)
						.map<PackageResolvedElement>((element) => {
							// Dropping off keys that won't be used later and would cause problems
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const { packageJsonFilter, packageKind, ...elementWithoutFilters } =
								element;
							return {
								element: elementWithoutFilters,
								sourcePlugin,
								workspacePackage,
							};
						}) ?? [],
			),
	};
};
