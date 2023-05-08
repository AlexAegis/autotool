import { deepMerge, fillObjectWithTemplateVariables, sortObject } from '@alexaegis/common';
import { writeJson } from '@alexaegis/fs';
import {
	DEFAULT_PACKAGE_JSON_SORTING_PREFERENCE,
	getPackageJsonTemplateVariables,
	mergeDependencies,
	type PackageJsonTemplateVariableNames,
} from '@alexaegis/workspace-tools';
import type { Dependency } from '@schemastore/package';
import type { AutotoolElementExecutor, AutotoolElementPackageJson } from 'autotool-plugin';
import { relative } from 'node:path/posix';

export const PACKAGE_JSON_DEPENDENCY_FIELDS = [
	'dependencies',
	'devDependencies',
	'optionalDependencies',
	'peerDependencies',
] as const;

export const autotoolElementJsonExecutor: AutotoolElementExecutor<AutotoolElementPackageJson> = {
	type: 'packageJson',
	defaultTarget: 'package.json',
	apply: async (element, target, options): Promise<void> => {
		const workspaceRoot = target.rootPackage.packagePath;

		const templateVariables = getPackageJsonTemplateVariables(target.targetPackage.packageJson);
		templateVariables['relativePathFromPackageToRoot'] =
			relative(target.targetPackage.packagePath, workspaceRoot) || '.';

		const packageJsonUpdates =
			fillObjectWithTemplateVariables<PackageJsonTemplateVariableNames>(
				element.data,
				templateVariables
			);

		const targetPackageJson = PACKAGE_JSON_DEPENDENCY_FIELDS.reduce(
			(acc, dependencyFieldKey) => {
				if (packageJsonUpdates[dependencyFieldKey]) {
					acc[dependencyFieldKey] = mergeDependencies(
						target.targetPackage.packageJson[dependencyFieldKey],
						packageJsonUpdates[dependencyFieldKey] as Dependency
					);
				}

				return acc;
			},
			deepMerge(structuredClone(target.targetPackage.packageJson), packageJsonUpdates)
		);

		try {
			if (options.dry) {
				options.logger.info(`pretending to update ${target.targetPackage.packageJsonPath}`);
			} else {
				options.logger.info(`updating ${target.targetPackage.packageJsonPath}`);
			}

			await writeJson(
				sortObject(
					targetPackageJson,
					element.sortingPreference ?? DEFAULT_PACKAGE_JSON_SORTING_PREFERENCE
				),
				target.targetPackage.packageJsonPath,
				{
					dry: options.dry,
				}
			);
		} catch (error) {
			options.logger.error(
				`can't write updates to ${target.targetPackage.packageJsonPath}, error happened:`,
				error
			);
		}
	},
	consolidate: (elements) => {
		const first = elements[0];
		return first
			? elements.reduce((acc, element) => {
					acc.data = deepMerge(acc.data, element.data);
					return acc;
			  }, first)
			: undefined;
	},
};
