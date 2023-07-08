import { NormalizedLoggerOption, noopLogger } from '@alexaegis/logging';
import type {
	AutotoolElement,
	AutotoolPluginObject,
	ExecutorMap,
	PackageResolvedElement,
	WorkspacePackage,
} from 'autotool-plugin';
import { describe, expect, it, vi } from 'vitest';
import { consolidateElementsAndFilterOutNonExecutables } from './consolidate-elements.function.js';

describe('consolidateElementsAndFilterOutNonExecutable', () => {
	const testElementTypeConsolidable = 'testConsolidable';
	const testElementTypeNonConsolidable = 'testNonConsolidable';

	const executorMap: ExecutorMap = new Map();

	const sourcePlugin: AutotoolPluginObject<AutotoolElement> = { name: 'fake' };

	const mockOptions: NormalizedLoggerOption = {
		logger: noopLogger,
	};

	executorMap.set(testElementTypeConsolidable, {
		type: testElementTypeConsolidable,
		execute: vi.fn(),
		consolidate: (e) => {
			const first = e[0];
			return first ? [first] : [];
		},
		sourcePlugin,
	});

	executorMap.set(testElementTypeNonConsolidable, {
		type: testElementTypeNonConsolidable,
		execute: vi.fn(),
		sourcePlugin,
	});

	const fakeWorkspacePackage: WorkspacePackage = {
		packageJson: {},
		packageJsonPath: '',
		packageKind: 'regular',
		packagePath: '',
		packagePathFromRootPackage: '',
	};

	it('should be able to replace elements that can be consolodited', () => {
		const element: PackageResolvedElement = {
			element: {
				executor: testElementTypeConsolidable,
			},
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: executorMap.get(testElementTypeConsolidable)?.sourcePlugin,
		};
		const consolidated = consolidateElementsAndFilterOutNonExecutables(
			[element],
			fakeWorkspacePackage,
			executorMap,
			mockOptions,
		);
		expect(consolidated).toHaveLength(1);
		expect(consolidated[0]).toEqual(element);
	});

	it('should not touch elements that are do not have a consolidator', () => {
		const element: PackageResolvedElement = {
			element: {
				executor: testElementTypeNonConsolidable,
			},
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};
		const consolidated = consolidateElementsAndFilterOutNonExecutables(
			[element, element],
			fakeWorkspacePackage,
			executorMap,
			mockOptions,
		);
		expect(consolidated).toHaveLength(2);
		expect(consolidated[0]).toBe(element);
		expect(consolidated[1]).toBe(element);
	});

	it('should work with mixed elements, order does not matter', () => {
		const elementNonConsolidable: PackageResolvedElement = {
			element: {
				executor: testElementTypeNonConsolidable,
			},
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};
		const elementConsolidable: PackageResolvedElement = {
			element: {
				executor: testElementTypeConsolidable,
			},
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: executorMap.get(testElementTypeConsolidable)?.sourcePlugin,
		};
		const consolidated = consolidateElementsAndFilterOutNonExecutables(
			[
				elementNonConsolidable,
				elementConsolidable,
				elementNonConsolidable,
				elementConsolidable,
			],
			fakeWorkspacePackage,
			executorMap,
			mockOptions,
		);

		expect(consolidated).toHaveLength(3);
		expect(consolidated).toContainEqual(elementNonConsolidable);
		expect(consolidated).toContainEqual(elementConsolidable);
	});

	it('can drop off elements without an executor, they are not valid anyway', () => {
		const elementWithoutExecutor: PackageResolvedElement = {
			element: {
				executor: 'nonexistent',
			},
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};

		const consolidated = consolidateElementsAndFilterOutNonExecutables(
			[elementWithoutExecutor],
			fakeWorkspacePackage,
			executorMap,
			mockOptions,
		);

		expect(consolidated).toHaveLength(0);
	});
});
