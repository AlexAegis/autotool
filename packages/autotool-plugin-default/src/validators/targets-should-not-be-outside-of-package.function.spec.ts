import type { Logger } from '@alexaegis/logging';
import { MockLogger } from '@alexaegis/logging/mocks';
import type {
	AutotoolElementFileRemove,
	ExecutorMap,
	NormalizedAutotoolPluginOptions,
	PackageResolvedElement,
	WorkspacePackage,
} from 'autotool-plugin';
import { describe, expect, it } from 'vitest';
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

	it('should not have a problem with paths pointing inwards', async () => {
		const result = await validateTargetsAreNotOutsideOfPackage(
			{
				targetedElementsByFile: {
					foo: [dummyElement],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
			},
			executorMap,
			options
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
			},
			executorMap,
			options
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
			},
			executorMap,
			options
		);

		expect(result).toHaveLength(1);
	});
});
