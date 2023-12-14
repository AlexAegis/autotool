import {
	deepMerge,
	dropKeys,
	fillObjectWithTemplateVariables,
	groupBy,
	sortObject,
} from '@alexaegis/common';
import { readJson, writeJson } from '@alexaegis/fs';
import {
	PACKAGE_JSON_DEPENDENCY_FIELDS,
	getPackageJsonTemplateVariables,
	type PackageJson,
	type PackageJsonTemplateVariableNames,
} from '@alexaegis/workspace-tools';
import { createJsonSortingPreferenceNormalizer } from '@alexaegis/workspace-tools/sort';
import type { Dependency } from '@schemastore/package';
import type { AutotoolElementExecutor, AutotoolElementPackageJson } from 'autotool-plugin';
import { basename } from 'node:path';
import { relative } from 'node:path/posix';
import { mergeDependencies } from '../helpers/index.js';

export const autotoolElementJsonExecutor: AutotoolElementExecutor<AutotoolElementPackageJson> = {
	type: 'packageJson',
	defaultTarget: 'package.json',
	execute: async (element, target, options): Promise<void> => {
		const workspaceRoot = target.rootPackage.packagePath;

		const templateVariables = getPackageJsonTemplateVariables(target.targetPackage.packageJson);
		templateVariables['relativePathFromPackageToRoot'] =
			relative(target.targetPackage.packagePath, workspaceRoot) || '.';
		Object.assign(templateVariables, element.templateVariables);

		const packageJsonUpdates =
			fillObjectWithTemplateVariables<PackageJsonTemplateVariableNames>(
				element.data,
				templateVariables,
			);

		// Doing a fresh read in case something modified it in a previous element
		const packageJson = await readJson<PackageJson>(target.targetFilePathAbsolute);
		options.logger.trace('UPDATES', packageJsonUpdates);

		options.logger.trace('packageJson[dependencyFieldKey]', packageJson?.devDependencies);
		if (!packageJson) {
			throw new Error("Can't read packageJson!");
		}

		const naivelyMerged = deepMerge([packageJson, packageJsonUpdates], { dropKeys: false });

		const targetPackageJson = PACKAGE_JSON_DEPENDENCY_FIELDS.reduce(
			(acc, dependencyFieldKey) => {
				if (packageJsonUpdates[dependencyFieldKey]) {
					acc[dependencyFieldKey] = mergeDependencies(
						packageJson[dependencyFieldKey],
						packageJsonUpdates[dependencyFieldKey] as Dependency,
					);
				}

				return acc;
			},
			naivelyMerged,
		);

		const sortingPreferenceNormalizer = await createJsonSortingPreferenceNormalizer(
			basename(target.targetFilePath),
			{ cwd: workspaceRoot },
		);

		try {
			if (options.dry) {
				options.logger.info(`pretending to update ${target.targetPackage.packageJsonPath}`);
			} else {
				options.logger.info(`updating ${target.targetPackage.packageJsonPath}`);
			}

			await writeJson(
				sortObject(
					dropKeys(targetPackageJson),
					sortingPreferenceNormalizer(element.sortingPreference),
				),
				target.targetPackage.packageJsonPath,
				{
					dry: options.dry,
				},
			);
		} catch (error) {
			options.logger.error(
				`can't write updates to ${target.targetPackage.packageJsonPath}, error happened:`,
				error,
			);
		}
	},
	consolidate: (elements) => {
		const groupedByPass = groupBy(elements, (element) =>
			element.consolidationPass ? element.consolidationPass.toString() : '0',
		);

		// Lower numbers will come first
		const elementsOrderedByPass = Object.entries(groupedByPass)
			.map(([k, elements]) => ({
				pass: Number.parseInt(k, 10),
				elements,
			}))
			.sort((a, b) => a.pass - b.pass)
			.flatMap((e) => e.elements);

		const baseElement = elementsOrderedByPass[0];

		const mergedData = deepMerge(
			elementsOrderedByPass.map((element) => element.data),
			{
				dropKeys: false,
			},
		) as PackageJson;

		return baseElement
			? {
					...baseElement,
					data: mergedData,
				}
			: undefined;
	},
};
