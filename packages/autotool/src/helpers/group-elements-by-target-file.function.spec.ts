import { noopLogger, type NormalizedLoggerOption } from '@alexaegis/logging';
import type {
	AutotoolElement,
	AutotoolPluginObject,
	ExecutorMap,
	PackageManager,
	WorkspacePackage,
} from 'autotool-plugin';
import { describe, expect, it, vi } from 'vitest';
import type { WorkspacePackageWithElements } from '../internal/types.js';
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
		packagePathFromRootPackage: '',
	};

	const packageManager: PackageManager = {
		name: 'pnpm',
		installCommand: 'pnpm i',
	};

	const mockOptions: NormalizedLoggerOption = {
		logger: noopLogger,
	};

	const fakeSourcePlugin: AutotoolPluginObject<AutotoolElement> = {
		name: 'fake',
		elements: [],
	};

	const testExecutorName = 'test';

	const executorMap: ExecutorMap = new Map();
	executorMap.set('testExecutorName', {
		execute: vi.fn(),
		type: testExecutorName,
		sourcePlugin: fakeSourcePlugin,
	});

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

		const grouped = await groupAndConsolidateElementsByTargetFile(
			packageElements,
			executorMap,
			[workspacePackage],
			packageManager,
			mockOptions,
		);

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

		const grouped = await groupAndConsolidateElementsByTargetFile(
			packageElements,
			executorMap,
			[workspacePackage],
			packageManager,
			mockOptions,
		);

		expect(Object.keys(grouped.targetedElementsByFile)).toHaveLength(2);
		expect(grouped.targetedElementsByFile['foo.js']).toHaveLength(2);
		expect(grouped.targetedElementsByFile['foo.ts']).toHaveLength(2);
	});
});
