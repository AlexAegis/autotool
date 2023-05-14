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
	const mockLogger = new MockLogger();
	const logger = mockLogger as unknown as Logger<unknown>;

	const options: NormalizedAutotoolPluginOptions = {
		cwd: '/projects',
		dry: false,
		force: false,
		rootWorkspacePackage,
		logger,
	};

	it('should not have a problem with paths pointing inwards', async () => {
		const result = await validateRootElementNotModifyingPackages(
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

	it('should report an error if the path points deep inside a package', async () => {
		const result = await validateRootElementNotModifyingPackages(
			{
				targetedElementsByFile: {
					'packages/foo/deep/target': [dummyElement, dummyUnknownOrigin],
				},
				untargetedElements: [],
				workspacePackage: rootWorkspacePackage,
			},
			executorMap,
			options
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
			},
			executorMap,
			options
		);

		expect(result).toHaveLength(0);
	});
});
