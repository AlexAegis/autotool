import type { AutotoolPluginObject, WorkspacePackage } from 'autotool-plugin';
import { describe, expect, it } from 'vitest';
import { isElementUntargeted } from './is-element-untargeted.function.js';

describe('isElementUntargeted', () => {
	const fakeSourcePlugin: AutotoolPluginObject = {
		elements: [],
		name: 'foo',
	};

	const fakeWorkspacePackage: WorkspacePackage = {
		packageJson: {},
		packageJsonPath: '',
		packageKind: 'regular',
		packagePath: '',
		packagePathFromRootPackage: '',
	};

	it('should return true for elements that have no targeting information', () => {
		expect(
			isElementUntargeted({
				element: {
					executor: 'test',
				},
				sourcePlugin: fakeSourcePlugin,
				workspacePackage: fakeWorkspacePackage,
			})
		).toBeTruthy();
	});

	it('should return false if it has direct targeting information', () => {
		expect(
			isElementUntargeted({
				element: {
					executor: 'test',
					targetFile: 'foo',
				},
				sourcePlugin: fakeSourcePlugin,
				workspacePackage: fakeWorkspacePackage,
			})
		).toBeFalsy();
	});

	it('should return false if it has glob targeting information', () => {
		expect(
			isElementUntargeted({
				element: {
					executor: 'test',
					targetFilePatterns: 'foo/**',
				},
				sourcePlugin: fakeSourcePlugin,
				workspacePackage: fakeWorkspacePackage,
			})
		).toBeFalsy();

		expect(
			isElementUntargeted({
				element: {
					executor: 'test',
					targetFilePatterns: ['foo/**', 'bar/**'],
				},
				sourcePlugin: fakeSourcePlugin,
				workspacePackage: fakeWorkspacePackage,
			})
		).toBeFalsy();
	});
});
