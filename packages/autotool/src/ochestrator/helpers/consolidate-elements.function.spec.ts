import type { ExecutorMap, PackageResolvedElement, WorkspacePackage } from 'autotool-plugin';
import { describe, expect, it, vi } from 'vitest';
import { consolidateElementsAndFilterOutNonExecutables } from './consolidate-elements.function.js';

describe('consolidateElementsAndFilterOutNonExecutable', () => {
	const testElementTypeConsolidable = 'testConsolidable';
	const testElementTypeNonConsolidable = 'testNonConsolidable';

	const executorMap: ExecutorMap = new Map();

	executorMap.set(testElementTypeConsolidable, {
		type: testElementTypeConsolidable,
		apply: vi.fn(),
		consolidate: (e) => {
			const first = e[0];
			return first ? [first] : [];
		},
	});

	executorMap.set(testElementTypeNonConsolidable, {
		type: testElementTypeNonConsolidable,
		apply: vi.fn(),
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
			sourcePlugin: { name: 'test', elements: [] },
		};
		const consolidated = consolidateElementsAndFilterOutNonExecutables(
			[element],
			fakeWorkspacePackage,
			executorMap
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
			executorMap
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
			sourcePlugin: { name: 'test', elements: [] },
		};
		const consolidated = consolidateElementsAndFilterOutNonExecutables(
			[
				elementNonConsolidable,
				elementConsolidable,
				elementNonConsolidable,
				elementConsolidable,
			],
			fakeWorkspacePackage,
			executorMap
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
			executorMap
		);

		expect(consolidated).toHaveLength(0);
	});
});
