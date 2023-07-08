import { createMockLogger } from '@alexaegis/logging/mocks';
import type {
	AppliedElement,
	AutotoolElementApplyOptions,
	AutotoolElementFileCopy,
	ElementTarget,
} from 'autotool-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { autotoolElementFileCopyExecutor } from './file-copy-element-executor.js';

const cpMock = vi.hoisted(() => vi.fn());
const mkdirMock = vi.hoisted(() => vi.fn());
const writeFileMock = vi.hoisted(() => vi.fn());
const readFileMock = vi.hoisted(() => vi.fn());

vi.mock('fs/promises', () => {
	return {
		cp: cpMock,
		writeFile: writeFileMock,
		mkdir: mkdirMock,
		readFile: readFileMock,
	};
});

const turnIntoExecutableMock = vi.hoisted(() => vi.fn());
const tryPrettifyMock = vi.hoisted(() => vi.fn<[string], string>((s) => s));

vi.mock('@alexaegis/fs', () => {
	return {
		turnIntoExecutable: turnIntoExecutableMock,
		tryPrettify: tryPrettifyMock,
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

describe('autotoolElementFileCopyExecutor', () => {
	const fakeCopyElementFromOrgPackage: AppliedElement<AutotoolElementFileCopy> = {
		executor: 'fileCopy',
		sourceFile: 'file',
		sourcePluginPackageName: '@org/foo',
	};

	const fakeCopyElement: AppliedElement<AutotoolElementFileCopy> = {
		executor: 'fileCopy',
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
		it('should copy the target file, not using cp but readFile and writeFile', async () => {
			const content = 'content';
			readFileMock.mockImplementationOnce(() => content);
			await autotoolElementFileCopyExecutor.execute(
				fakeCopyElement,
				fakeTargetDirectlyOnPackage,
				defaultOptions,
			);

			expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', { recursive: true });
			expect(readFileMock).toHaveBeenCalledWith('/project/node_modules/foo/file', {
				encoding: 'utf8',
			});
			expect(writeFileMock).toHaveBeenCalledWith(
				fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
				content,
			);
			expect(cpMock).not.toHaveBeenCalled(); // Not actually using copy

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
			await autotoolElementFileCopyExecutor.execute(
				fakeCopyElement,
				deeperTarget,
				defaultOptions,
			);

			expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo/nested', {
				recursive: true,
			});
			expect(readFileMock).toHaveBeenCalledWith('/project/node_modules/foo/file', {
				encoding: 'utf8',
			});
			expect(writeFileMock).toHaveBeenCalledWith(
				deeperTarget.targetFilePathAbsolute,
				content,
			);
			expect(cpMock).not.toHaveBeenCalled(); // Not actually using copy

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
		});

		it('should read from a nested node_modules folder when the source package has an org', async () => {
			const content = 'content';
			readFileMock.mockImplementationOnce(() => content);
			await autotoolElementFileCopyExecutor.execute(
				fakeCopyElementFromOrgPackage,
				fakeTargetDirectlyOnPackage,
				{
					cwd: 'root',
					dry: false,
					logger,
					force: false,
				},
			);

			expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', { recursive: true });
			expect(readFileMock).toHaveBeenCalledWith('/project/node_modules/@org/foo/file', {
				encoding: 'utf8',
			});
			expect(writeFileMock).toHaveBeenCalledWith(
				fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
				content,
			);

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
		});

		it('should mark the result of the copy as executable if requested', async () => {
			await autotoolElementFileCopyExecutor.execute(
				{ ...fakeCopyElement, markAsExecutable: true },
				fakeTargetDirectlyOnPackage,
				defaultOptions,
			);

			expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', {
				recursive: true,
			});
			expect(readFileMock).toHaveBeenCalledWith('/project/node_modules/foo/file', {
				encoding: 'utf8',
			});
			expect(writeFileMock).toHaveBeenCalledWith(
				fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
				'',
			);

			expect(turnIntoExecutableMock).toHaveBeenCalledWith(
				fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
				defaultOptions,
			);

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
		});

		describe('templates', () => {
			it('should substitute default template variables', async () => {
				const content = '${relativePathFromPackageToRoot}${packageName}';
				readFileMock.mockImplementationOnce(() => content);
				await autotoolElementFileCopyExecutor.execute(
					fakeCopyElement,
					fakeTargetDirectlyOnPackage,
					defaultOptions,
				);

				expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', {
					recursive: true,
				});
				expect(readFileMock).toHaveBeenCalledWith('/project/node_modules/foo/file', {
					encoding: 'utf8',
				});
				expect(writeFileMock).toHaveBeenCalledWith(
					fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
					'../..' + (fakeTargetDirectlyOnPackage.targetPackage.packageJson.name ?? ''),
				);
				expect(cpMock).not.toHaveBeenCalled(); // Not actually using copy

				expect(mockLogger.info).toHaveBeenCalled();
				expect(mockLogger.warn).not.toHaveBeenCalled();
				expect(mockLogger.error).not.toHaveBeenCalled();
			});

			it('should substitute . for relativePathFromPackageToRoot in the case of the root package', async () => {
				const content = '${relativePathFromPackageToRoot}';
				readFileMock.mockImplementationOnce(() => content);
				await autotoolElementFileCopyExecutor.execute(
					fakeCopyElement,
					{
						...fakeTargetDirectlyOnPackage,
						targetPackage: fakeTargetDirectlyOnPackage.rootPackage,
					},
					defaultOptions,
				);

				expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', {
					recursive: true,
				});
				expect(readFileMock).toHaveBeenCalledWith('/project/node_modules/foo/file', {
					encoding: 'utf8',
				});
				expect(writeFileMock).toHaveBeenCalledWith(
					fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
					'.',
				);
				expect(cpMock).not.toHaveBeenCalled(); // Not actually using copy

				expect(mockLogger.info).toHaveBeenCalled();
				expect(mockLogger.warn).not.toHaveBeenCalled();
				expect(mockLogger.error).not.toHaveBeenCalled();
			});

			it('should apply transformers and substitute variables after so transformers can add variables', async () => {
				const content = '';
				readFileMock.mockImplementationOnce(() => content);
				await autotoolElementFileCopyExecutor.execute(
					{
						...fakeCopyElement,
						transformers: [(_content) => '${relativePathFromPackageToRoot}'],
					},
					{
						...fakeTargetDirectlyOnPackage,
						targetPackage: fakeTargetDirectlyOnPackage.rootPackage,
					},
					defaultOptions,
				);

				expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', {
					recursive: true,
				});
				expect(readFileMock).toHaveBeenCalledWith('/project/node_modules/foo/file', {
					encoding: 'utf8',
				});
				expect(writeFileMock).toHaveBeenCalledWith(
					fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
					'.',
				);
				expect(cpMock).not.toHaveBeenCalled(); // Not actually using copy

				expect(mockLogger.info).toHaveBeenCalled();
				expect(mockLogger.warn).not.toHaveBeenCalled();
				expect(mockLogger.error).not.toHaveBeenCalled();
			});

			it('should substitute even custom template variables', async () => {
				const customTemplateVariable = 'amogus';
				const content = '${relativePathFromPackageToRoot}${packageName}${custom}';
				readFileMock.mockImplementationOnce(() => content);
				await autotoolElementFileCopyExecutor.execute(
					{ ...fakeCopyElement, templateVariables: { custom: customTemplateVariable } },
					fakeTargetDirectlyOnPackage,
					defaultOptions,
				);

				expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', {
					recursive: true,
				});
				expect(readFileMock).toHaveBeenCalledWith('/project/node_modules/foo/file', {
					encoding: 'utf8',
				});
				expect(writeFileMock).toHaveBeenCalledWith(
					fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
					'../..' +
						(fakeTargetDirectlyOnPackage.targetPackage.packageJson.name ?? '') +
						customTemplateVariable,
				);
				expect(cpMock).not.toHaveBeenCalled(); // Not actually using copy

				expect(mockLogger.info).toHaveBeenCalled();
				expect(mockLogger.warn).not.toHaveBeenCalled();
				expect(mockLogger.error).not.toHaveBeenCalled();
			});
		});

		describe('dry mode', () => {
			it('should not actually execute copy in dry(ish) mode', async () => {
				const content = 'content';
				readFileMock.mockImplementationOnce(() => content);
				await autotoolElementFileCopyExecutor.execute(
					{ ...fakeCopyElement, markAsExecutable: true },
					fakeTargetDirectlyOnPackage,
					{ ...defaultOptions, dry: true },
				);

				expect(mkdirMock).not.toHaveBeenCalled();
				expect(readFileMock).toHaveBeenCalledWith('/project/node_modules/foo/file', {
					encoding: 'utf8',
				});
				expect(writeFileMock).not.toHaveBeenCalled();
				expect(cpMock).not.toHaveBeenCalled();

				expect(mockLogger.info).toHaveBeenCalled();
				expect(mockLogger.warn).not.toHaveBeenCalled();
				expect(mockLogger.error).not.toHaveBeenCalled();
			});
		});
	});

	describe('invalid cases', () => {
		afterEach(() => {
			vi.clearAllMocks();
		});
		it('should warn the user if the file being copied is not managed', async () => {
			isManagedFileMock.mockImplementationOnce(() => false);
			await autotoolElementFileCopyExecutor.execute(
				fakeCopyElement,
				fakeTargetDirectlyOnPackage,
				defaultOptions,
			);

			expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', {
				recursive: true,
			});
			expect(readFileMock).toHaveBeenCalledWith('/project/node_modules/foo/file', {
				encoding: 'utf8',
			});
			expect(writeFileMock).toHaveBeenCalledWith(
				fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
				'',
			);

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger.warn).toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
		});

		it('should report an error when write fails and not try to mark it as executable even if it should', async () => {
			const error = 'Something went wrong!';
			writeFileMock.mockRejectedValueOnce(error);
			await autotoolElementFileCopyExecutor.execute(
				{ ...fakeCopyElement, markAsExecutable: true },
				fakeTargetDirectlyOnPackage,
				defaultOptions,
			);

			expect(mkdirMock).toHaveBeenCalledWith('/project/projects/foo', {
				recursive: true,
			});
			expect(readFileMock).toHaveBeenCalledWith('/project/node_modules/foo/file', {
				encoding: 'utf8',
			});
			expect(writeFileMock).toHaveBeenCalledWith(
				fakeTargetDirectlyOnPackage.targetFilePathAbsolute,
				'',
			);

			expect(turnIntoExecutableMock).not.toHaveBeenCalled();

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).toHaveBeenCalled();
		});
	});
});
