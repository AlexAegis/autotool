import { noopLogger } from '@alexaegis/logging';
import type { RootWorkspacePackage } from '@alexaegis/workspace-tools';
import { describe, expect, it } from 'vitest';
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

	it('should have a default when not defined', () => {
		expect(normalizeAutotoolPluginOptions({ rootWorkspacePackage })).toEqual({
			cwd: process.cwd(),
			dry: false,
			force: false,
			logger: noopLogger,
			rootWorkspacePackage,
			filter: [],
			filterPlugins: [],
		} as NormalizedAutotoolPluginOptions);
	});

	it('should use the provided values when defined', () => {
		const manualOptions: AutotoolPluginOptions = {
			cwd: 'foo',
			force: true,
			dry: true,
			logger: noopLogger,
			rootWorkspacePackage,
			filter: [],
			filterPlugins: [],
		};
		expect(normalizeAutotoolPluginOptions(manualOptions)).toEqual(manualOptions);
	});
});
