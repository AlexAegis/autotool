import type { Logger } from '@alexaegis/logging';
import { MockLogger } from '@alexaegis/logging/mocks';
import type { AppliedElement, AutotoolElementFileRemove, ElementTarget } from 'autotool-plugin';
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
		executor: 'file-remove',
	};

	const mockLogger = new MockLogger();
	const logger = mockLogger as unknown as Logger<unknown>;

	const fakeTarget: ElementTarget = {
		targetFilePackageRelative: 'foo.txt',
		targetFilePath: 'projects/foo/foo.txt',
		targetFilePathAbsolute: '/project/projects/foo/foo.txt',
		workspacePackage: {
			packageJson: {},
			packageJsonPath: '/project/projects/foo/package.json',
			packageKind: 'regular',
			packagePath: '/project/projects/foo',
		},
	};

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should remove the target file', async () => {
		await autotoolElementFileRemoveExecutor.apply(fakeResolvedElement, fakeTarget, {
			cwd: 'root',
			dry: false,
			logger,
		});

		expect(rmMock).toHaveBeenCalled();
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.warn).not.toHaveBeenCalled();
		expect(mockLogger.error).not.toHaveBeenCalled();
	});

	it("should not remove the target file if it's a dry run", async () => {
		await autotoolElementFileRemoveExecutor.apply(fakeResolvedElement, fakeTarget, {
			cwd: 'root',
			dry: true,
			logger,
		});

		expect(rmMock).not.toHaveBeenCalled();
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.warn).not.toHaveBeenCalled();
		expect(mockLogger.error).not.toHaveBeenCalled();
	});

	it('should not throw if the target file does not exist, but log a warning', async () => {
		rmMock.mockImplementationOnce(() => {
			// eslint-disable-next-line @typescript-eslint/no-throw-literal
			throw { code: 'ENOENT' };
		});

		await autotoolElementFileRemoveExecutor.apply(fakeResolvedElement, fakeTarget, {
			cwd: 'root',
			dry: false,
			logger,
		});

		expect(rmMock).toHaveBeenCalled();
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.warn).toHaveBeenCalled();
		expect(mockLogger.error).not.toHaveBeenCalled();
	});

	it('should not throw but log an error if removal failed for some other reason than the file not existing', async () => {
		rmMock.mockImplementationOnce(() => {
			// eslint-disable-next-line @typescript-eslint/no-throw-literal
			throw { code: 'SOMETHINGELSE' };
		});

		await autotoolElementFileRemoveExecutor.apply(fakeResolvedElement, fakeTarget, {
			cwd: 'root',
			dry: false,
			logger,
		});

		expect(rmMock).toHaveBeenCalled();
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.warn).not.toHaveBeenCalled();
		expect(mockLogger.error).toHaveBeenCalled();
	});
});
