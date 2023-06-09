import type {
	AutotoolElement,
	AutotoolPluginObject,
	ExecutorMap,
	PackageResolvedElement,
	WorkspacePackage,
} from 'autotool-plugin';
import { describe, expect, it, vi } from 'vitest';
import type { InternalElementsWithResolvedTargets } from '../internal/types.js';
import { normalizeElementTargets } from './normalize-element-targets.function.js';

vi.mock('globby');

describe('normalizeElementTargets', () => {
	const executorMap: ExecutorMap = new Map();
	const fakeSourcePlugin: AutotoolPluginObject<AutotoolElement> = {
		elements: [],
		name: 'foo',
	};

	const fakeWorkspacePackage: WorkspacePackage = {
		packageJson: {},
		packageJsonPath: '',
		packageKind: 'regular',
		packagePath: '',
		packagePathFromRootPackage: '',
	};

	const fooTargetingElement: PackageResolvedElement<AutotoolElement> = {
		element: {
			executor: 'test',
			targetFile: 'foo',
		},
		sourcePlugin: fakeSourcePlugin,
		workspacePackage: fakeWorkspacePackage,
	};

	const fooAndBarTargetingElement: PackageResolvedElement<AutotoolElement> = {
		element: {
			executor: 'test',
			targetFile: ['foo', 'bar'],
		},
		sourcePlugin: fakeSourcePlugin,
		workspacePackage: fakeWorkspacePackage,
	};

	const fooGlobTargetingElement: PackageResolvedElement<AutotoolElement> = {
		element: {
			executor: 'test',
			targetFilePatterns: 'foo*',
		},
		sourcePlugin: fakeSourcePlugin,
		workspacePackage: fakeWorkspacePackage,
	};

	const fooAndBarGlobTargetingElement: PackageResolvedElement<AutotoolElement> = {
		element: {
			executor: 'test',
			targetFilePatterns: ['foo.js', 'foo*', 'bar*'],
		},
		sourcePlugin: fakeSourcePlugin,
		workspacePackage: fakeWorkspacePackage,
	};

	const nonTargetingElement: PackageResolvedElement = {
		element: {
			executor: 'test',
		},
		sourcePlugin: fakeSourcePlugin,
		workspacePackage: fakeWorkspacePackage,
	};

	it('should resolve the concrete files the elements target for each element', async () => {
		const normalized = await normalizeElementTargets(
			{
				elements: [fooTargetingElement, fooTargetingElement],
				workspacePackage: fakeWorkspacePackage,
			},
			executorMap,
		);
		expect(normalized.targetedElements).toEqual<InternalElementsWithResolvedTargets[]>([
			{
				resolvedTargetFiles: ['foo'],
				element: fooTargetingElement,
			},
			{
				resolvedTargetFiles: ['foo'],
				element: fooTargetingElement,
			},
		]);

		expect(normalized.untargetedElements).toHaveLength(0);
	});

	it('should be able to use multiple direct targets for one element', async () => {
		const normalized = await normalizeElementTargets(
			{
				elements: [fooAndBarTargetingElement],
				workspacePackage: fakeWorkspacePackage,
			},
			executorMap,
		);
		expect(normalized.targetedElements).toEqual<InternalElementsWithResolvedTargets[]>([
			{
				resolvedTargetFiles: ['foo', 'bar'],
				element: fooAndBarTargetingElement,
			},
		]);

		expect(normalized.untargetedElements).toHaveLength(0);
	});

	it('should resolve the concrete files the elements target for each element for multi and single globs too', async () => {
		const normalized = await normalizeElementTargets(
			{
				elements: [fooGlobTargetingElement, fooAndBarGlobTargetingElement],
				workspacePackage: fakeWorkspacePackage,
			},
			executorMap,
		);

		expect(normalized.targetedElements).toEqual<InternalElementsWithResolvedTargets[]>([
			{
				resolvedTargetFiles: ['foo.js', 'foo.ts'],
				element: fooGlobTargetingElement,
			},
			{
				resolvedTargetFiles: ['foo.js', 'foo.ts', 'bar.js', 'bar.ts'],
				element: fooAndBarGlobTargetingElement,
			},
		]);

		expect(normalized.untargetedElements).toHaveLength(0);
	});

	it('should put elements without any targeting data into the untargeted elements array', async () => {
		const normalized = await normalizeElementTargets(
			{
				elements: [nonTargetingElement],
				workspacePackage: fakeWorkspacePackage,
			},
			executorMap,
		);

		expect(normalized.targetedElements).toHaveLength(0);

		expect(normalized.untargetedElements).toEqual([nonTargetingElement]);
	});
});
