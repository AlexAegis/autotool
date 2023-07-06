import { createMockLogger } from '@alexaegis/logging/mocks';
import type {
	AppliedElement,
	AutotoolElementApplyOptions,
	AutotoolElementFileSymlink,
	ElementTarget,
} from 'autotool-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { autotoolElementFileSymlinkExecutor } from './file-symlink-element-executor.js';

const cpMock = vi.hoisted(() => vi.fn());
const mkdirMock = vi.hoisted(() => vi.fn());
const readFileMock = vi.hoisted(() => vi.fn());
const symlinkMock = vi.hoisted(() => vi.fn());

vi.mock('fs/promises', () => {
	return {
		cp: cpMock,
		mkdir: mkdirMock,
		symlink: symlinkMock,
		readFile: readFileMock,
	};
});

const turnIntoExecutableMock = vi.hoisted(() => vi.fn());
vi.mock('@alexaegis/fs', async () => {
	const actual = await vi.importActual<typeof import('@alexaegis/fs')>('@alexaegis/fs');
	return {
		...actual,
		turnIntoExecutable: turnIntoExecutableMock,
	};
});

const isManagedFileMock = vi.hoisted(() => vi.fn(() => true));

vi.mock('autotool-plugin', async () => {
	const actual = await vi.importActual<typeof import('autotool-plugin')>('autotool-plugin');
	return {
		...actual,
		isManagedFile: isManagedFileMock,
	};
});

describe('autotoolElementFileSymlinkCopyExecutor', () => {
	const fakeSymlinkElementFromOrgPackage: AppliedElement<AutotoolElementFileSymlink> = {
		executor: 'fileSymlink',
		sourceFile: 'file',
		sourcePluginPackageName: '@org/foo',
	};

	const fakeSymlinkElement: AppliedElement<AutotoolElementFileSymlink> = {
		executor: 'fileSymlink',
		sourceFile: 'file',
		sourcePluginPackageName: 'foo',
	};

	const { mockLogger, logger } = createMockLogger(vi);

	const defaultOptions: AutotoolElementApplyOptions = {
		cwd: '/project',
		dry: false,
		logger,
		force: false,
	};

	const fakeTargetDirectlyOnPackage: ElementTarget = {
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

	describe('valid cases', () => {
		it('should symlink the target file', async () => {
			await autotoolElementFileSymlinkExecutor.apply(
				fakeSymlinkElement,
				fakeTargetDirectlyOnPackage,
				defaultOptions,
			);

			expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', { recursive: true });

			expect(symlinkMock).toHaveBeenCalledWith(
				'../../node_modules/foo/file',
				fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
			);

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
		});

		it('should copy the target file into a deeper directory and call mkdir to make sure it exists', async () => {
			const content = 'content';
			readFileMock.mockImplementationOnce(() => content);
			const deeperTarget = {
				targetFilePackageRelative: 'nested/foo.txt',
				targetFilePath: 'projects/foo/nested/foo.txt',
				targetFilePathAbsolute: '/project/projects/foo/nested/foo.txt',
				targetPackage: fakeTargetDirectlyOnPackage.targetPackage,
				rootPackage: fakeTargetDirectlyOnPackage.rootPackage,
			};
			await autotoolElementFileSymlinkExecutor.apply(
				fakeSymlinkElement,
				deeperTarget,
				defaultOptions,
			);

			expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo/nested', {
				recursive: true,
			});

			expect(symlinkMock).toHaveBeenCalledWith(
				'../../../node_modules/foo/file',
				deeperTarget.targetFilePathAbsolute,
			);

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
		});

		it('should read from a nested node_modules folder when the source package has an org', async () => {
			const content = 'content';
			readFileMock.mockImplementationOnce(() => content);
			await autotoolElementFileSymlinkExecutor.apply(
				fakeSymlinkElementFromOrgPackage,
				fakeTargetDirectlyOnPackage,
				defaultOptions,
			);

			expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', { recursive: true });

			expect(symlinkMock).toHaveBeenCalledWith(
				'../../node_modules/@org/foo/file',
				fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
			);

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
		});

		describe('dry mode', () => {
			it('should not actually execute symlink in dry(ish) mode', async () => {
				await autotoolElementFileSymlinkExecutor.apply(
					fakeSymlinkElement,
					fakeTargetDirectlyOnPackage,
					{ ...defaultOptions, dry: true },
				);

				expect(mkdirMock).not.toHaveBeenCalled();
				expect(symlinkMock).not.toHaveBeenCalled();
				expect(mockLogger.info).toHaveBeenCalled();
				expect(mockLogger.warn).not.toHaveBeenCalled();
				expect(mockLogger.error).not.toHaveBeenCalled();
			});
		});
	});

	describe('invalid cases', () => {
		it('should warn the user if the file being copied is not managed', async () => {
			isManagedFileMock.mockImplementationOnce(() => false);
			await autotoolElementFileSymlinkExecutor.apply(
				fakeSymlinkElement,
				fakeTargetDirectlyOnPackage,
				defaultOptions,
			);

			expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', {
				recursive: true,
			});

			expect(symlinkMock).toHaveBeenCalledWith(
				'../../node_modules/foo/file',
				fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
			);

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger.warn).toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
		});
	});
});
