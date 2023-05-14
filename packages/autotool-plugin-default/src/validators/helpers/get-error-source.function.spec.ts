import type { PackageResolvedElement, WorkspacePackage } from 'autotool-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getErrorSourcesFromPackageElement } from './get-error-source.function.js';

describe('getErrorSourcesFromPackageElement', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should collect elements and source plugins from resolved elements', () => {
		const workspacePackage: WorkspacePackage = {
			workspacePackagePatterns: [],
			packageJson: {},
			packageJsonPath: '/project/package.json',
			packageKind: 'root',
			packagePath: '/project',
			packagePathFromRootPackage: '.',
		};

		const elementA: PackageResolvedElement = {
			element: { executor: 'custom' },
			sourcePlugin: { name: 'a' },
			workspacePackage,
		};

		const elementB: PackageResolvedElement = {
			element: { executor: 'custom' },
			sourcePlugin: { name: 'b' },
			workspacePackage,
		};

		const result = getErrorSourcesFromPackageElement([elementA, elementB]);
		expect(result.sourceElements).toEqual([elementA.element, elementB.element]);
		expect(result.sourcePlugins).toEqual([elementA.sourcePlugin, elementB.sourcePlugin]);
	});
});
