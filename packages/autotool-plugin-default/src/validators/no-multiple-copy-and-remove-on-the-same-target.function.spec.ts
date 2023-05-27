import type { Logger } from '@alexaegis/logging';
import { MockLogger } from '@alexaegis/logging/mocks';
import type {
	AutotoolElementFileCopy,
	AutotoolElementFileRemove,
	AutotoolElementFileSymlink,
	AutotoolElementPackageJson,
	ExecutorMap,
	NormalizedAutotoolPluginOptions,
	PackageResolvedElement,
	WorkspacePackage,
} from 'autotool-plugin';
import { describe, expect, it } from 'vitest';
import { validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget } from './no-multiple-copy-and-remove-on-the-same-target.function.js';

describe('validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget', () => {
	const rootWorkspacePackage: WorkspacePackage = {
		workspacePackagePatterns: [],
		packageJson: {},
		packageJsonPath: '/project/package.json',
		packageKind: 'root',
		packagePath: '/project',
		packagePathFromRootPackage: '.',
	};

	const elementCopy: PackageResolvedElement = {
		element: {
			executor: 'fileCopy',
			sourceFile: 'foo',
			sourcePluginPackageName: 'foo',
		} as AutotoolElementFileCopy,
		sourcePlugin: { name: 'a' },
		workspacePackage: rootWorkspacePackage,
	};

	const elementRemove: PackageResolvedElement = {
		element: { executor: 'fileRemove' } as AutotoolElementFileRemove,
		sourcePlugin: { name: 'a' },
		workspacePackage: rootWorkspacePackage,
	};

	const elementSymlink: PackageResolvedElement = {
		element: { executor: 'fileSymlink' } as AutotoolElementFileSymlink,
		sourcePlugin: { name: 'a' },
		workspacePackage: rootWorkspacePackage,
	};

	const elementPackageJson: PackageResolvedElement = {
		element: { executor: 'packageJson', data: {} } as AutotoolElementPackageJson,
		sourcePlugin: { name: 'a' },
		workspacePackage: rootWorkspacePackage,
	};

	const executorMap: ExecutorMap = new Map();
	const mockLogger = new MockLogger();
	const logger = mockLogger as unknown as Logger<unknown>;

	const options: NormalizedAutotoolPluginOptions = {
		cwd: '/projects',
		dry: false,
		force: false,
		rootWorkspacePackage,
		logger,
		filter: [],
		filterPlugins: [],
	};

	it('should pass if theres only one copy element', async () => {
		const result = await validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget(
			{
				targetedElementsByFile: {
					foo: [elementCopy],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
			},
			executorMap,
			options
		);

		expect(result).toHaveLength(0);
	});

	it('should fail if theres multiple copy elements', async () => {
		const result = await validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget(
			{
				targetedElementsByFile: {
					foo: [elementCopy, elementCopy],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
			},
			executorMap,
			options
		);

		expect(result).toHaveLength(1);
	});

	it("should fail if there's a remove, symlink and a copy together", async () => {
		const result = await validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget(
			{
				targetedElementsByFile: {
					foo: [elementCopy, elementRemove, elementSymlink],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
			},
			executorMap,
			options
		);

		expect(result).toHaveLength(1);
	});

	it('should pass if there are multiple packageJson elements', async () => {
		const result = await validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget(
			{
				targetedElementsByFile: {
					foo: [elementPackageJson, elementPackageJson],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
			},
			executorMap,
			options
		);

		expect(result).toHaveLength(0);
	});

	it('should pass if there are multiple fileRemove elements', async () => {
		const result = await validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget(
			{
				targetedElementsByFile: {
					foo: [elementRemove, elementRemove],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
			},
			executorMap,
			options
		);

		expect(result).toHaveLength(0);
	});

	it('should fail if theres a packageJson element and a copy element', async () => {
		const result = await validateThereAreNoMultipleCopyAndRemoveElementsOnTheSameTarget(
			{
				targetedElementsByFile: {
					foo: [elementCopy, elementPackageJson],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
			},
			executorMap,
			options
		);

		expect(result).toHaveLength(1);
	});
});
