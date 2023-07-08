import { createMockLogger } from '@alexaegis/logging/mocks';
import type {
	AppliedElement,
	AutotoolElementApplyOptions,
	AutotoolElementCustom,
	ElementTarget,
} from 'autotool-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { autotoolElementCustomExecutor } from './custom-element-executor.js';

describe('autotoolElementCustomExecutor', () => {
	const fakeCustomElement: AppliedElement<AutotoolElementCustom> = {
		executor: 'custom',
		apply: vi.fn(),
	};

	const { mockLogger, logger } = createMockLogger(vi);

	const defaultOptions: AutotoolElementApplyOptions = {
		cwd: '/project',
		dry: false,
		logger,
		force: false,
	};

	const fakeTarget: ElementTarget = {
		targetFilePackageRelative: 'foo.txt',
		targetFilePath: 'projects/foo/foo.txt',
		targetFilePathAbsolute: '/project/projects/foo/foo.txt',
		targetPackage: {
			packageJson: {
				name: 'targetPackageName',
			},
			packageJsonPath: '/project/projects/foo/package.json',
			packageKind: 'regular',
			packagePath: '/project/projects/foo',
			packagePathFromRootPackage: 'projects/foo',
		},
		rootPackage: {
			workspacePackagePatterns: [],
			packageJson: {},
			packageJsonPath: '/project/package.json',
			packageKind: 'root',
			packagePath: '/project',
			packagePathFromRootPackage: '.',
		},
	};

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should just call the customFunction with the same arguments as the executors apply function', async () => {
		await autotoolElementCustomExecutor.execute(fakeCustomElement, fakeTarget, defaultOptions);

		expect(fakeCustomElement.apply).toHaveBeenCalledWith(
			fakeCustomElement,
			fakeTarget,
			defaultOptions,
		);
		expect(mockLogger.info).not.toHaveBeenCalled();
		expect(mockLogger.warn).not.toHaveBeenCalled();
		expect(mockLogger.error).not.toHaveBeenCalled();
	});
});
