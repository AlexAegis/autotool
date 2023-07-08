import type {
	AutotoolElement,
	AutotoolPluginObject,
	ExecutorMap,
	WorkspacePackage,
} from 'autotool-plugin';
import { describe, expect, it, vi } from 'vitest';
import { isPackageElementUntargeted } from './is-element-untargeted.function.js';

describe('isElementUntargeted', () => {
	const fakeSourcePlugin: AutotoolPluginObject<AutotoolElement> = {
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

	const executorMap: ExecutorMap = new Map();
	const executorWithDefaultTarget = 'withDefaultTarget';
	executorMap.set(executorWithDefaultTarget, {
		type: executorWithDefaultTarget,
		execute: vi.fn(),
		defaultTarget: 'defaultTarget',
		sourcePlugin: fakeSourcePlugin,
	});

	it('should return true for elements that have no targeting information', () => {
		expect(
			isPackageElementUntargeted(
				{
					element: {
						executor: 'test',
					},
					sourcePlugin: fakeSourcePlugin,
					workspacePackage: fakeWorkspacePackage,
				},
				executorMap,
			),
		).toBeTruthy();
	});

	it('should return false if it has direct targeting information', () => {
		expect(
			isPackageElementUntargeted<AutotoolElement>(
				{
					element: {
						executor: 'test',
						targetFile: 'foo',
					},
					sourcePlugin: fakeSourcePlugin,
					workspacePackage: fakeWorkspacePackage,
				},
				executorMap,
			),
		).toBeFalsy();
	});

	it('should return false if it has no targeting information but the executor defines a default target', () => {
		expect(
			isPackageElementUntargeted(
				{
					element: {
						executor: executorWithDefaultTarget,
					},
					sourcePlugin: fakeSourcePlugin,
					workspacePackage: fakeWorkspacePackage,
				},
				executorMap,
			),
		).toBeFalsy();
	});

	it('should return false if it has glob targeting information', () => {
		expect(
			isPackageElementUntargeted<AutotoolElement>(
				{
					element: {
						executor: 'test',
						targetFilePatterns: 'foo/**',
					},
					sourcePlugin: fakeSourcePlugin,
					workspacePackage: fakeWorkspacePackage,
				},
				executorMap,
			),
		).toBeFalsy();

		expect(
			isPackageElementUntargeted<AutotoolElement>(
				{
					element: {
						executor: 'test',
						targetFilePatterns: ['foo/**', 'bar/**'],
					},
					sourcePlugin: fakeSourcePlugin,
					workspacePackage: fakeWorkspacePackage,
				},
				executorMap,
			),
		).toBeFalsy();
	});
});
