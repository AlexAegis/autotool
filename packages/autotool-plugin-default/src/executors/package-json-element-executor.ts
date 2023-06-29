import { deepMerge, fillObjectWithTemplateVariables, groupBy, sortObject } from '@alexaegis/common';
import { readJson, writeJson } from '@alexaegis/fs';
import {
	DEFAULT_PACKAGE_JSON_SORTING_PREFERENCE,
	PACKAGE_JSON_DEPENDENCY_FIELDS,
	getPackageJsonTemplateVariables,
	mergeDependencies,
	type PackageJson,
	type PackageJsonTemplateVariableNames,
} from '@alexaegis/workspace-tools';
import type { Dependency } from '@schemastore/package';
import type { AutotoolElementExecutor, AutotoolElementPackageJson } from 'autotool-plugin';
import { relative } from 'node:path/posix';

export const autotoolElementJsonExecutor: AutotoolElementExecutor<AutotoolElementPackageJson> = {
	type: 'packageJson',
	defaultTarget: 'package.json',
	apply: async (element, target, options): Promise<void> => {
		const workspaceRoot = target.rootPackage.packagePath;

		const templateVariables = getPackageJsonTemplateVariables(target.targetPackage.packageJson);
		templateVariables['relativePathFromPackageToRoot'] =
			relative(target.targetPackage.packagePath, workspaceRoot) || '.';
		Object.assign(templateVariables, element.templateVariables);

		const packageJsonUpdates =
			fillObjectWithTemplateVariables<PackageJsonTemplateVariableNames>(
				element.data,
				templateVariables
			);

		// Doing a fresh read in case something modified it in a previous element
		const packageJson = await readJson<PackageJson>(target.targetFilePathAbsolute);

		if (!packageJson) {
			throw new Error("Can't read packageJson!");
		}

		const targetPackageJson = PACKAGE_JSON_DEPENDENCY_FIELDS.reduce(
			(acc, dependencyFieldKey) => {
				if (packageJsonUpdates[dependencyFieldKey]) {
					acc[dependencyFieldKey] = mergeDependencies(
						packageJson[dependencyFieldKey],
						packageJsonUpdates[dependencyFieldKey] as Dependency
					);
				}

				return acc;
			},
			deepMerge(structuredClone(packageJson), packageJsonUpdates)
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
		const groupedByPass = groupBy(elements, (element) =>
			element.consolidationPass ? element.consolidationPass.toString() : '0'
		);

		// Lower numbers will come first
		const elementGroupsByPass = Object.entries(groupedByPass)
			.map(([k, elements]) => ({
				pass: Number.parseInt(k, 10),
				elements,
			}))
			.sort((a, b) => a.pass - b.pass)
			.map((e) => e.elements);

		const baseElement = elementGroupsByPass[0]?.shift();

		return baseElement
			? elementGroupsByPass.reduce((acc, group) => {
					acc.data = deepMerge(acc.data, ...group.map((g) => g.data));
					return acc;
			  }, structuredClone(baseElement))
			: undefined;
	},
};
