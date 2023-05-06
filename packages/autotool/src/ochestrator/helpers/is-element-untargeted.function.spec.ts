import type { SetupPlugin, WorkspacePackage } from 'autotool-plugin';
import { describe, expect, it } from 'vitest';
import { isElementUntargeted } from './is-element-untargeted.function.js';

describe('isElementUntargeted', () => {
	const fakeSourcePlugin: SetupPlugin = {
		elements: [],
		name: 'foo',
	};

	const fakeWorkspacePackage: WorkspacePackage = {
		packageJson: {},
		packageJsonPath: '',
		packageKind: 'regular',
		packagePath: '',
	};

	it('should return true for elements that have no targeting information', () => {
		expect(
			isElementUntargeted({
				executor: 'test',
				sourcePlugin: fakeSourcePlugin,
				workspacePackage: fakeWorkspacePackage,
			})
		).toBeTruthy();
	});

	it('should return false if it has direct targeting information', () => {
		expect(
			isElementUntargeted({
				executor: 'test',
				sourcePlugin: fakeSourcePlugin,
				workspacePackage: fakeWorkspacePackage,
				targetFile: 'foo',
			})
		).toBeFalsy();
	});

	it('should return false if it has glob targeting information', () => {
		expect(
			isElementUntargeted({
				executor: 'test',
				sourcePlugin: fakeSourcePlugin,
				workspacePackage: fakeWorkspacePackage,
				targetFilePatterns: 'foo/**',
			})
		).toBeFalsy();

		expect(
			isElementUntargeted({
				executor: 'test',
				sourcePlugin: fakeSourcePlugin,
				workspacePackage: fakeWorkspacePackage,
				targetFilePatterns: ['foo/**', 'bar/**'],
			})
		).toBeFalsy();
	});
});
