import type { AutotoolPluginObject, WorkspacePackage } from 'autotool-plugin';
import { describe, expect, it, vi } from 'vitest';
import type { ExecutorMap, WorkspacePackageWithElements } from '../types.js';
import { groupAndConsolidateElementsByTargetFile } from './group-elements-by-target-file.function.js';

vi.mock('globby');

describe('groupAndConsolidateElementsByTargetFile', () => {
	const workspacePackage: WorkspacePackage = {
		packageJson: {
			name: 'foo',
			private: true,
		},
		packageJsonPath: '',
		packageKind: 'regular',
		packagePath: '',
	};

	const fakeSourcePlugin: AutotoolPluginObject = {
		name: '',
		elements: [],
	};

	const testExecutorName = 'test';

	const executorMap: ExecutorMap = new Map();
	executorMap.set('testExecutorName', { apply: vi.fn(), type: testExecutorName });

	it('should group elements with the same targetFile into one', async () => {
		const fooTarget = 'foo';
		const packageElements: WorkspacePackageWithElements = {
			workspacePackage,
			elements: [
				{
					element: {
						executor: testExecutorName,
						targetFile: fooTarget,
					},
					sourcePlugin: fakeSourcePlugin,
					workspacePackage,
				},
				{
					element: {
						executor: testExecutorName,
						targetFile: fooTarget,
					},
					sourcePlugin: fakeSourcePlugin,
					workspacePackage,
				},
			],
		};

		const grouped = await groupAndConsolidateElementsByTargetFile(packageElements, executorMap);

		expect(Object.keys(grouped.targetedElementsByFile)).toHaveLength(1);
		expect(grouped.targetedElementsByFile[fooTarget]).toHaveLength(2);
	});

	it('should group elements with the same resolved targetFile from the globs into one', async () => {
		const packageElements: WorkspacePackageWithElements = {
			workspacePackage,
			elements: [
				{
					element: {
						executor: testExecutorName,
						targetFilePatterns: 'foo*',
					},
					sourcePlugin: fakeSourcePlugin,
					workspacePackage,
				},
				{
					element: {
						executor: testExecutorName,
						targetFilePatterns: 'foo*',
					},
					sourcePlugin: fakeSourcePlugin,
					workspacePackage,
				},
			],
		};

		const grouped = await groupAndConsolidateElementsByTargetFile(packageElements, executorMap);

		expect(Object.keys(grouped.targetedElementsByFile)).toHaveLength(2);
		expect(grouped.targetedElementsByFile['foo.js']).toHaveLength(2);
		expect(grouped.targetedElementsByFile['foo.ts']).toHaveLength(2);
	});
});
