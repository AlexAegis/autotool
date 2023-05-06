import type { InternalSetupElement, WorkspacePackage } from 'autotool-plugin';
import { describe, expect, it, vi } from 'vitest';
import type { ExecutorMap } from '../types.js';
import { consolidateSetupElementsAndFilterOutNonExecutable } from './consolidate-elements.function.js';

describe('consolidateSetupElements', () => {
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
		const element: InternalSetupElement = {
			executor: testElementTypeConsolidable,
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};
		const consolidated = consolidateSetupElementsAndFilterOutNonExecutable(
			[element],
			executorMap
		);
		expect(consolidated).toHaveLength(1);
		expect(consolidated[0]).toBe(element);
	});

	it('should not touch elements that are do not have a consolidator', () => {
		const element: InternalSetupElement = {
			executor: testElementTypeNonConsolidable,
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};
		const consolidated = consolidateSetupElementsAndFilterOutNonExecutable(
			[element, element],
			executorMap
		);
		expect(consolidated).toHaveLength(2);
		expect(consolidated[0]).toBe(element);
		expect(consolidated[1]).toBe(element);
	});

	it('should work with mixed elements, order does not matter', () => {
		const elementNonConsolidable: InternalSetupElement = {
			executor: testElementTypeNonConsolidable,
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};
		const elementConsolidable: InternalSetupElement = {
			executor: testElementTypeConsolidable,
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};
		const consolidated = consolidateSetupElementsAndFilterOutNonExecutable(
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
		const elementWithoutExecutor: InternalSetupElement = {
			executor: 'nonexistent',
			workspacePackage: fakeWorkspacePackage,
			sourcePlugin: { name: 'test', elements: [] },
		};

		const consolidated = consolidateSetupElementsAndFilterOutNonExecutable(
			[elementWithoutExecutor],
			executorMap
		);

		expect(consolidated).toHaveLength(0);
	});
});
