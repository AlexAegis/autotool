import { createMockLogger } from '@alexaegis/logging/mocks';
import type {
	AutotoolElementFileRemove,
	ExecutorMap,
	NormalizedAutotoolPluginOptions,
	PackageManager,
	PackageResolvedElement,
	WorkspacePackage,
} from 'autotool-plugin';
import { describe, expect, it, vi } from 'vitest';
import { validateRootElementNotModifyingPackages } from './root-element-should-not-target-inner-package.validator.js';

describe('validateRootElementNotModifyingPackages', () => {
	const rootWorkspacePackage: WorkspacePackage = {
		workspacePackagePatterns: ['packages/*', 'packages/**/'],
		packageJson: {},
		packageJsonPath: '/project/package.json',
		packageKind: 'root',
		packagePath: '/project',
		packagePathFromRootPackage: '.',
	};

	const dummyElement: PackageResolvedElement = {
		element: { executor: 'fileRemove' } as AutotoolElementFileRemove,
		sourcePlugin: { name: 'a' },
		workspacePackage: rootWorkspacePackage,
	};

	const dummyUnknownOrigin: PackageResolvedElement = {
		element: { executor: 'fileRemove' } as AutotoolElementFileRemove,
		sourcePlugin: undefined,
		workspacePackage: rootWorkspacePackage,
	};

	const executorMap: ExecutorMap = new Map();
	const { logger } = createMockLogger(vi);

	const options: NormalizedAutotoolPluginOptions = {
		cwd: '/projects',
		dry: false,
		force: false,
		rootWorkspacePackage,
		logger,
	};

	const packageManager: PackageManager = {
		name: 'pnpm',
		installCommand: 'pnpm i',
	};

	it('should not have a problem with paths pointing inwards', async () => {
		const result = await validateRootElementNotModifyingPackages(
			{
				targetedElementsByFile: {
					foo: [dummyElement],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
				allWorkspacePackages: [rootWorkspacePackage],
				packageManager,
			},
			executorMap,
			options,
		);

		expect(result).toHaveLength(0);
	});

	it('should report an error if the path points deep inside a package', async () => {
		const result = await validateRootElementNotModifyingPackages(
			{
				targetedElementsByFile: {
					'packages/foo/deep/target': [dummyElement, dummyUnknownOrigin],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
				allWorkspacePackages: [rootWorkspacePackage],
				packageManager,
			},
			executorMap,
			options,
		);

		expect(result).toHaveLength(2);
	});

	it('should not report an error if the path does not point inside a package', async () => {
		const result = await validateRootElementNotModifyingPackages(
			{
				targetedElementsByFile: {
					'somewhere/else/file': [dummyElement],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
				allWorkspacePackages: [rootWorkspacePackage],
				packageManager,
			},
			executorMap,
			options,
		);

		expect(result).toHaveLength(0);
	});
});
