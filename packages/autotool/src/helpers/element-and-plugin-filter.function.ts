import { isNotNullish } from '@alexaegis/common';
import { match, type JsonMatcher } from '@alexaegis/match';
import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import type { AutotoolPluginFilter } from 'autotool-plugin';

export const elementAndPluginFilter = (
	workspacePackage: WorkspacePackage,
	filter: AutotoolPluginFilter
): boolean => {
	const pluginPackageKind = filter.packageKind ?? 'all';

	let result = pluginPackageKind === 'all' || pluginPackageKind === workspacePackage.packageKind;

	if (isNotNullish(filter.packageJsonFilter)) {
		const packageJsonMatch = match(
			workspacePackage.packageJson,
			filter.packageJsonFilter as JsonMatcher
		);
		result = result && packageJsonMatch;
	}

	return result;
};
