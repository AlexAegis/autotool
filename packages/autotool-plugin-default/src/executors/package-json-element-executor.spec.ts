import { createMockLogger } from '@alexaegis/logging/mocks';
import type { PackageJson } from '@alexaegis/workspace-tools';
import type {
	AppliedElement,
	AutotoolElementApplyOptions,
	AutotoolElementPackageJson,
	ElementTarget,
} from 'autotool-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { autotoolElementJsonExecutor } from './package-json-element-executor.js';

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

const writeJsonMock = vi.hoisted(() => vi.fn());
const readJsonMock = vi.hoisted(() => vi.fn<[string], PackageJson>(() => ({ name: 'mock' })));

vi.mock('@alexaegis/fs', () => {
	return {
		writeJson: writeJsonMock,
		readJson: readJsonMock,
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

describe('autotoolElementJsonExecutor', () => {
	const fakePackageJsonElement: AppliedElement<AutotoolElementPackageJson> = {
		executor: 'packageJson',
		data: {
			dependencies: {
				foo: '1.0.0',
			},
		},
	};

	const { mockLogger, logger } = createMockLogger(vi);

	const defaultOptions: AutotoolElementApplyOptions = {
		cwd: '/project',
		dry: false,
		logger,
		force: false,
	};

	const fakeTargetPackage: ElementTarget = {
		targetFilePackageRelative: 'package.json',
		targetFilePath: 'projects/foo/package.json',
		targetFilePathAbsolute: '/project/projects/foo/package.json',
		targetPackage: {
			packageJson: {
				name: 'targetPackageName',
				dependencies: {
					existing: '^0.1.0',
				},
			},
			packageJsonPath: '/project/projects/foo/package.json',
			packageKind: 'regular',
			packagePath: '/project/projects/foo',
			packagePathFromRootPackage: 'projects/foo',
		},
		rootPackage: {
			workspacePackagePatterns: [],
			packageJson: {
				name: 'workspace',
			},
			packageJsonPath: '/project/package.json',
			packageKind: 'root',
			packagePath: '/project',
			packagePathFromRootPackage: '.',
		},
	};

	readJsonMock.mockResolvedValue(fakeTargetPackage.targetPackage.packageJson);

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('valid cases', () => {
		it('should fill the delivered packageJsonElements', async () => {
			await autotoolElementJsonExecutor.apply(
				fakePackageJsonElement,
				fakeTargetPackage,
				defaultOptions,
			);

			expect(writeJsonMock).toHaveBeenCalledWith(
				{
					dependencies: {
						foo: '1.0.0',
						existing: '^0.1.0',
					},
					name: 'targetPackageName',
				},
				fakeTargetPackage.targetPackage.packageJsonPath,
				{ dry: defaultOptions.dry },
			);

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).not.toHaveBeenCalled();
		});

		describe('consolidation', () => {
			it('should be able to combine multiple elements into one', () => {
				const elementA: AppliedElement<AutotoolElementPackageJson> = {
					executor: 'packageJson',
					data: {
						dependencies: {
							foo: '1.0.0',
						},
					},
				};

				const elementB: AppliedElement<AutotoolElementPackageJson> = {
					executor: 'packageJson',
					data: {
						dependencies: {
							bar: '1.0.0',
						},
					},
				};
				const result = autotoolElementJsonExecutor.consolidate?.([elementA, elementB]);

				expect(result).toBeDefined();
				expect(result).toEqual({
					executor: 'packageJson',
					data: {
						dependencies: {
							foo: '1.0.0',
							bar: '1.0.0',
						},
					},
				});
			});

			it.only('should be able to drop off elements using undefined by using a higher consolidationPass', () => {
				const elementA: AppliedElement<AutotoolElementPackageJson> = {
					executor: 'packageJson',
					consolidationPass: 2,
					data: {
						dependencies: {
							foo: undefined,
							bar: '1.0.0',
						},
					},
				};

				const elementB: AppliedElement<AutotoolElementPackageJson> = {
					executor: 'packageJson',
					consolidationPass: 1,
					data: {
						dependencies: {
							foo: '1.0.0',
						},
					},
				};
				const result = autotoolElementJsonExecutor.consolidate?.([elementA, elementB]);

				expect(result).toBeDefined();
				expect(result).toEqual({
					executor: 'packageJson',
					consolidationPass: expect.any(Number) as number,
					data: {
						dependencies: {
							bar: '1.0.0',
						},
					},
				});
			});

			it('should return undefined when theres nothing to consolidate', () => {
				const result = autotoolElementJsonExecutor.consolidate?.([]);
				expect(result).toBeUndefined();
			});
		});

		describe('templates', () => {
			it('should substitute default template variables', async () => {
				await autotoolElementJsonExecutor.apply(
					{
						...fakePackageJsonElement,
						data: {
							scripts: {
								packageName: '${packageName}',
								relativePathFromPackageToRoot: '${relativePathFromPackageToRoot}',
							},
						},
					},
					fakeTargetPackage,
					defaultOptions,
				);

				expect(writeJsonMock).toHaveBeenCalledWith(
					{
						dependencies: {
							existing: '^0.1.0',
						},
						scripts: {
							packageName: fakeTargetPackage.targetPackage.packageJson.name,
							relativePathFromPackageToRoot: '../..',
						},
						name: 'targetPackageName',
					},
					fakeTargetPackage.targetPackage.packageJsonPath,
					{ dry: defaultOptions.dry },
				);

				expect(mockLogger.info).toHaveBeenCalled();
				expect(mockLogger.warn).not.toHaveBeenCalled();
				expect(mockLogger.error).not.toHaveBeenCalled();
			});

			it('should substitute even custom template variables and use . when targeting the root package as relativePathFromPackageToRoot', async () => {
				readJsonMock.mockResolvedValueOnce(fakeTargetPackage.rootPackage.packageJson);

				await autotoolElementJsonExecutor.apply(
					{
						...fakePackageJsonElement,
						data: {
							scripts: {
								packageName: '${packageName}',
								relativePathFromPackageToRoot: '${relativePathFromPackageToRoot}',
							},
						},
					},
					{ ...fakeTargetPackage, targetPackage: fakeTargetPackage.rootPackage },
					defaultOptions,
				);

				expect(writeJsonMock).toHaveBeenCalledWith(
					{
						scripts: {
							packageName: fakeTargetPackage.rootPackage.packageJson.name,
							relativePathFromPackageToRoot: '.',
						},
						name: fakeTargetPackage.rootPackage.packageJson.name,
					},
					fakeTargetPackage.rootPackage.packageJsonPath,
					{ dry: defaultOptions.dry },
				);

				expect(mockLogger.info).toHaveBeenCalled();
				expect(mockLogger.warn).not.toHaveBeenCalled();
				expect(mockLogger.error).not.toHaveBeenCalled();
			});
		});

		describe('dry mode', () => {
			it('should pass dry to writeJson in dry(ish) mode', async () => {
				await autotoolElementJsonExecutor.apply(fakePackageJsonElement, fakeTargetPackage, {
					...defaultOptions,
					dry: true,
				});

				expect(writeJsonMock).toHaveBeenCalledWith(
					{
						dependencies: {
							foo: '1.0.0',
							existing: '^0.1.0',
						},
						name: 'targetPackageName',
					},
					fakeTargetPackage.targetPackage.packageJsonPath,
					{ dry: true },
				);

				expect(mockLogger.info).toHaveBeenCalled();
				expect(mockLogger.warn).not.toHaveBeenCalled();
				expect(mockLogger.error).not.toHaveBeenCalled();
			});
		});
	});

	describe('invalid cases', () => {
		it('should report an error when write fails', async () => {
			const error = 'error';
			writeJsonMock.mockRejectedValueOnce(error);
			await autotoolElementJsonExecutor.apply(
				fakePackageJsonElement,
				fakeTargetPackage,
				defaultOptions,
			);

			expect(writeJsonMock).toHaveBeenCalledWith(
				{
					dependencies: {
						foo: '1.0.0',
						existing: '^0.1.0',
					},
					name: 'targetPackageName',
				},
				fakeTargetPackage.targetPackage.packageJsonPath,
				{ dry: defaultOptions.dry },
			);

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger.warn).not.toHaveBeenCalled();
			expect(mockLogger.error).toHaveBeenCalledWith(expect.any(String), error);
		});
	});
});
