import { createMockLogger } from '@alexaegis/logging/mocks';
import type {
	AppliedElement,
	AutotoolElementFileRemove,
	ElementTarget,
	PackageManager,
	WorkspacePackage,
} from 'autotool-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { autotoolElementFileRemoveExecutor } from './file-remove-element-executor.js';

const rmMock = vi.hoisted(() => vi.fn());

vi.mock('fs/promises', () => {
	return {
		rm: rmMock,
	};
});

describe('autotoolElementFileRemoveExecutor', () => {
	const fakeResolvedElement: AppliedElement<AutotoolElementFileRemove> = {
		executor: 'fileRemove',
	};

	const { mockLogger, logger } = createMockLogger(vi);

	const packageManager: PackageManager = {
		name: 'pnpm',
		installCommand: 'pnpm i',
	};

	const rootPackage: WorkspacePackage = {
		workspacePackagePatterns: [],
		packageJson: {},
		packageJsonPath: '/project/projects/foo/package.json',
		packageKind: 'root',
		packagePath: '/project/projects/foo',
		packagePathFromRootPackage: '.',
	};

	const targetPackage: WorkspacePackage = {
		packageJson: {},
		packageJsonPath: '/project/projects/foo/package.json',
		packageKind: 'regular',
		packagePath: '/project/projects/foo',
		packagePathFromRootPackage: 'projects/foo',
	};

	const fakeTarget: ElementTarget = {
		targetFilePackageRelative: 'foo.txt',
		targetFilePath: 'projects/foo/foo.txt',
		targetFilePathAbsolute: '/project/projects/foo/foo.txt',
		targetPackage,
		rootPackage,
		packageManager,
		allWorkspacePackages: [rootPackage, targetPackage],
	};

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should remove the target file', async () => {
		await autotoolElementFileRemoveExecutor.execute(fakeResolvedElement, fakeTarget, {
			cwd: 'root',
			dry: false,
			logger,
			force: false,
		});

		expect(rmMock).toHaveBeenCalled();
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.warn).not.toHaveBeenCalled();
		expect(mockLogger.error).not.toHaveBeenCalled();
	});

	it("should not remove the target file if it's a dry run", async () => {
		await autotoolElementFileRemoveExecutor.execute(fakeResolvedElement, fakeTarget, {
			cwd: 'root',
			dry: true,
			logger,
			force: false,
		});

		expect(rmMock).not.toHaveBeenCalled();
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.warn).not.toHaveBeenCalled();
		expect(mockLogger.error).not.toHaveBeenCalled();
	});

	it('should not throw if the target file does not exist, but log a warning', async () => {
		rmMock.mockImplementationOnce(() => {
			// eslint-disable-next-line @typescript-eslint/no-throw-literal,@typescript-eslint/only-throw-error
			throw { code: 'ENOENT' };
		});

		await autotoolElementFileRemoveExecutor.execute(fakeResolvedElement, fakeTarget, {
			cwd: 'root',
			dry: false,
			logger,
			force: false,
		});

		expect(rmMock).toHaveBeenCalled();
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.warn).not.toHaveBeenCalled();
		expect(mockLogger.error).not.toHaveBeenCalled();
	});

	it('should not throw but log an error if removal failed for some other reason than the file not existing', async () => {
		rmMock.mockImplementationOnce(() => {
			// eslint-disable-next-line @typescript-eslint/no-throw-literal,@typescript-eslint/only-throw-error
			throw { code: 'SOMETHINGELSE' };
		});

		await autotoolElementFileRemoveExecutor.execute(fakeResolvedElement, fakeTarget, {
			cwd: 'root',
			dry: false,
			logger,
			force: false,
		});

		expect(rmMock).toHaveBeenCalled();
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.warn).not.toHaveBeenCalled();
		expect(mockLogger.error).toHaveBeenCalled();
	});

	describe('consolidate', () => {
		it('should just return the first one', () => {
			const result = autotoolElementFileRemoveExecutor.consolidate?.([
				fakeResolvedElement,
				{ ...fakeResolvedElement },
			]);
			expect(result).toBe(fakeResolvedElement);
		});
	});
});
