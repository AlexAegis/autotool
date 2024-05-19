import { noopLogger } from '@alexaegis/logging';
import type { RootWorkspacePackage } from '@alexaegis/workspace-tools';
import { describe, expect, it } from 'vitest';
import type { PackageManager } from '../helpers/discover-package-manager.function.js';
import {
	normalizeAutotoolPluginOptions,
	type AutotoolPluginOptions,
	type NormalizedAutotoolPluginOptions,
} from './autotool-plugin.options.js';

describe('normalizeAutotoolPluginOptions', () => {
	const rootWorkspacePackage: RootWorkspacePackage = {
		workspacePackagePatterns: [],
		packageJson: {},
		packageJsonPath: '',
		packageKind: 'root',
		packagePath: '',
		packagePathFromRootPackage: '.',
	};

	const packageManager: PackageManager = {
		name: 'pnpm',
		installCommand: 'pnpm i',
	};

	it('should have a default when not defined', () => {
		expect(
			normalizeAutotoolPluginOptions({
				rootWorkspacePackage,
				allWorkspacePackages: [rootWorkspacePackage],
				packageManager,
			}),
		).toEqual({
			cwd: process.cwd(),
			dry: false,
			force: false,
			logger: noopLogger,
			rootWorkspacePackage,
			allWorkspacePackages: [rootWorkspacePackage],
			packageManager,
		} as NormalizedAutotoolPluginOptions);
	});

	it('should use the provided values when defined', () => {
		const manualOptions: AutotoolPluginOptions = {
			cwd: 'foo',
			force: true,
			dry: true,
			logger: noopLogger,
			rootWorkspacePackage,
			allWorkspacePackages: [rootWorkspacePackage],
			packageManager,
		};
		expect(normalizeAutotoolPluginOptions(manualOptions)).toEqual(manualOptions);
	});
});
