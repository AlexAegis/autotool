import { asyncMap } from '@alexaegis/common';
import type { RootWorkspacePackage } from '@alexaegis/workspace-tools';
import type { NormalizedAutotoolOptions } from 'autotool-plugin';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Awaitable } from 'vitest';

export type PackageManagerName = 'npm' | 'pnpm' | 'yarn';

export const installCommands: {
	[K in PackageManagerName]: `${K}${string}`;
} = {
	npm: 'npm install',
	pnpm: 'pnpm install',
	yarn: 'yarn install',
};

type Evidence = (
	rootWorkspacePackage: RootWorkspacePackage,
	options: NormalizedAutotoolOptions,
) => Awaitable<boolean>;

const evidenceMap: Record<PackageManagerName, Evidence[]> = {
	pnpm: [
		(rootWorkspacePackage) =>
			existsSync(join(rootWorkspacePackage.packagePath, 'pnpm-lock.yaml')),
		(rootWorkspacePackage) =>
			rootWorkspacePackage.packageJson.packageManager?.startsWith('pnpm') ?? false,
	],
	npm: [
		(rootWorkspacePackage) =>
			existsSync(join(rootWorkspacePackage.packagePath, 'package-lock.json')),
		(rootWorkspacePackage) =>
			rootWorkspacePackage.packageJson.packageManager?.startsWith('npm') ?? false,
	],
	yarn: [
		(rootWorkspacePackage) => existsSync(join(rootWorkspacePackage.packagePath, 'yarn.lock')),
		(rootWorkspacePackage) =>
			rootWorkspacePackage.packageJson.packageManager?.startsWith('yarn') ?? false,
	],
};

export interface PackageManager<T extends PackageManagerName = PackageManagerName> {
	name: T;
	installCommand: (typeof installCommands)[T];
}

/**
 * Returns the most likely packageManager being used, or errors out if none
 * found.
 *
 * @throws if no package manager is found
 */
export const discoverPackageManager = async (
	rootWorkspacePackage: RootWorkspacePackage,
	options: NormalizedAutotoolOptions,
): Promise<PackageManager> => {
	options.logger.trace('gathering evidence...');
	const results = await asyncMap(
		Object.entries(evidenceMap),
		async ([packageManagerName, evidences]) => {
			const evidenceFound = await asyncMap(
				evidences,
				async (evidence) => await evidence(rootWorkspacePackage, options),
			);

			return {
				packageManagerName: packageManagerName as PackageManagerName,
				evidenceFound: evidenceFound.filter((result) => !!result).length,
			};
		},
	);

	results.sort((a, b) => b.evidenceFound - a.evidenceFound);

	options.logger.trace('evidence found', results);

	const packageManagerWithMostEvidence = results[0]?.packageManagerName;

	if (!packageManagerWithMostEvidence) {
		throw new Error('No package manager can be determined!');
	}

	options.logger.trace('packageManagerWithMostEvidence', packageManagerWithMostEvidence);

	return {
		name: packageManagerWithMostEvidence,
		installCommand: installCommands[packageManagerWithMostEvidence],
	};
};
