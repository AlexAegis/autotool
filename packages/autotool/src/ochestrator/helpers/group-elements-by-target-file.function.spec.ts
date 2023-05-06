import type { AutotoolPlugin, WorkspacePackage } from 'autotool-plugin';
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

	const fakeSourcePlugin: AutotoolPlugin = {
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
					executor: testExecutorName,
					sourcePlugin: fakeSourcePlugin,
					workspacePackage,
					targetFile: fooTarget,
				},
				{
					executor: testExecutorName,
					sourcePlugin: fakeSourcePlugin,
					workspacePackage,
					targetFile: fooTarget,
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
					executor: testExecutorName,
					sourcePlugin: fakeSourcePlugin,
					workspacePackage,
					targetFilePatterns: 'foo*',
				},
				{
					executor: testExecutorName,
					sourcePlugin: fakeSourcePlugin,
					workspacePackage,
					targetFilePatterns: 'foo*',
				},
			],
		};

		const grouped = await groupAndConsolidateElementsByTargetFile(packageElements, executorMap);

		expect(Object.keys(grouped.targetedElementsByFile)).toHaveLength(2);
		expect(grouped.targetedElementsByFile['foo.js']).toHaveLength(2);
		expect(grouped.targetedElementsByFile['foo.ts']).toHaveLength(2);
	});
});
