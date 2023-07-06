import { isNotNullish } from '@alexaegis/common';
import { match, type JsonMatcher } from '@alexaegis/match';
import type { PackageArchetype, WorkspacePackage } from '@alexaegis/workspace-tools';
import type { AutotoolElement, AutotoolPluginFilter, AutotoolPluginObject } from 'autotool-plugin';

export const elementAndPluginFilter = (
	workspacePackage: WorkspacePackage,
	filter: AutotoolPluginFilter,
	plugin: AutotoolPluginObject<AutotoolElement>,
): boolean => {
	const pluginPackageKind = filter.packageKind ?? 'all';

	let result = pluginPackageKind === 'all' || pluginPackageKind === workspacePackage.packageKind;

	if (isNotNullish(filter.packageJsonFilter)) {
		const packageJsonMatch = match(
			workspacePackage.packageJson,
			filter.packageJsonFilter as JsonMatcher,
		);
		result = result && packageJsonMatch;
	}

	const disabledPlugins = (
		workspacePackage.packageJson['archetype'] as PackageArchetype | undefined
	)?.disabledPlugins;

	if (Array.isArray(disabledPlugins)) {
		result = result && !disabledPlugins.includes(plugin.name);
	}

	return result;
};
