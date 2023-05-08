import { noopLogger } from '@alexaegis/logging';
import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import { describe, expect, it } from 'vitest';
import {
	normalizeAutotoolPluginOptions,
	type AutotoolPluginOptions,
	type NormalizedAutotoolPluginOptions,
} from './autotool-plugin.options.js';

describe('normalizeAutotoolPluginOptions', () => {
	const workspaceRootPackage: WorkspacePackage = {
		packageJson: {},
		packageJsonPath: '',
		packageKind: 'regular',
		packagePath: '',
	};

	it('should have a default when not defined', () => {
		expect(normalizeAutotoolPluginOptions({ workspaceRootPackage })).toEqual({
			cwd: process.cwd(),
			dry: false,
			force: false,
			logger: noopLogger,
			workspaceRootPackage,
		} as NormalizedAutotoolPluginOptions);
	});

	it('should use the provided values when defined', () => {
		const manualOptions: AutotoolPluginOptions = {
			cwd: 'foo',
			force: true,
			dry: true,
			logger: noopLogger,
			workspaceRootPackage,
		};
		expect(normalizeAutotoolPluginOptions(manualOptions)).toEqual(manualOptions);
	});
});
