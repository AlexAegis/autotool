import type { InternalElement, WorkspacePackage } from 'autotool-plugin';
import { describe, expect, it, vi } from 'vitest';
import type { ExecutorMap } from '../types.js';
import { consolidateElementsAndFilterOutNonExecutable } from './consolidate-elements.function.js';

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
	};

	it('should be able to replace elements that can be consolodited', () => {
		const element: InternalElement = {
			executor: testElementTypeConsolidable,
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};
		const consolidated = consolidateElementsAndFilterOutNonExecutable([element], executorMap);
		expect(consolidated).toHaveLength(1);
		expect(consolidated[0]).toBe(element);
	});

	it('should not touch elements that are do not have a consolidator', () => {
		const element: InternalElement = {
			executor: testElementTypeNonConsolidable,
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};
		const consolidated = consolidateElementsAndFilterOutNonExecutable(
			[element, element],
			executorMap
		);
		expect(consolidated).toHaveLength(2);
		expect(consolidated[0]).toBe(element);
		expect(consolidated[1]).toBe(element);
	});

	it('should work with mixed elements, order does not matter', () => {
		const elementNonConsolidable: InternalElement = {
			executor: testElementTypeNonConsolidable,
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};
		const elementConsolidable: InternalElement = {
			executor: testElementTypeConsolidable,
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};
		const consolidated = consolidateElementsAndFilterOutNonExecutable(
			[
				elementNonConsolidable,
				elementConsolidable,
				elementNonConsolidable,
				elementConsolidable,
			],
			executorMap
		);

		expect(consolidated).toHaveLength(3);
		expect(consolidated).toContain(elementNonConsolidable);
		expect(consolidated).toContain(elementConsolidable);
	});

	it('can drop off elements without an executor, they are not valid anyway', () => {
		const elementWithoutExecutor: InternalElement = {
			executor: 'nonexistent',
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};

		const consolidated = consolidateElementsAndFilterOutNonExecutable(
			[elementWithoutExecutor],
			executorMap
		);

		expect(consolidated).toHaveLength(0);
	});
});
