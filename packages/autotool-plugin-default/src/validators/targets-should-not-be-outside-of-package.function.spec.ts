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
import { validateTargetsAreNotOutsideOfPackage } from './targets-should-not-be-outside-of-package.function.js';

describe('validateTargetsAreNotOutsideOfPackage', () => {
	const rootWorkspacePackage: WorkspacePackage = {
		workspacePackagePatterns: [],
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

	const executorMap: ExecutorMap = new Map();
	const { logger } = createMockLogger(vi);

	const packageManager: PackageManager = {
		name: 'pnpm',
		installCommand: 'pnpm i',
	};

	const options: NormalizedAutotoolPluginOptions = {
		cwd: '/projects',
		dry: false,
		force: false,
		rootWorkspacePackage,
		logger,
		allWorkspacePackages: [rootWorkspacePackage],
		packageManager,
	};

	it('should not have a problem with paths pointing inwards', async () => {
		const result = await validateTargetsAreNotOutsideOfPackage(
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

	it('should report an error if the path points outside the target', async () => {
		const result = await validateTargetsAreNotOutsideOfPackage(
			{
				targetedElementsByFile: {
					'../foo': [dummyElement],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
				allWorkspacePackages: [rootWorkspacePackage],
				packageManager,
			},
			executorMap,
			options,
		);

		expect(result).toHaveLength(1);
	});

	it('should report an error if the path points outside the target but not immediately', async () => {
		const result = await validateTargetsAreNotOutsideOfPackage(
			{
				targetedElementsByFile: {
					'fool/../../foo': [dummyElement],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
				allWorkspacePackages: [rootWorkspacePackage],
				packageManager,
			},
			executorMap,
			options,
		);

		expect(result).toHaveLength(1);
	});
});
