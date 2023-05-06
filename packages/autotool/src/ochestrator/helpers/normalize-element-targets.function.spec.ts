import type { InternalSetupElement, SetupPlugin, WorkspacePackage } from 'autotool-plugin';
import { describe, expect, it, vi } from 'vitest';
import type { InternalSetupElementsWithResolvedTargets } from '../types.interface.js';
import { normalizeElementTargets } from './normalize-element-targets.function.js';

vi.mock('globby');

describe('normalizeElementTargets', () => {
	const fakeSourcePlugin: SetupPlugin = {
		elements: [],
		name: 'foo',
	};

	const fakeWorkspacePackage: WorkspacePackage = {
		packageJson: {},
		packageJsonPath: '',
		packageKind: 'regular',
		packagePath: '',
	};

	const fooTargetingElement: InternalSetupElement = {
		executor: 'test',
		sourcePlugin: fakeSourcePlugin,
		workspacePackage: fakeWorkspacePackage,
		targetFile: 'foo',
	};

	const fooAndBarTargetingElement: InternalSetupElement = {
		executor: 'test',
		sourcePlugin: fakeSourcePlugin,
		workspacePackage: fakeWorkspacePackage,
		targetFile: ['foo', 'bar'],
	};

	const fooGlobTargetingElement: InternalSetupElement = {
		executor: 'test',
		sourcePlugin: fakeSourcePlugin,
		workspacePackage: fakeWorkspacePackage,
		targetFilePatterns: 'foo*',
	};

	const fooAndBarGlobTargetingElement: InternalSetupElement = {
		executor: 'test',
		sourcePlugin: fakeSourcePlugin,
		workspacePackage: fakeWorkspacePackage,
		targetFilePatterns: ['foo.js', 'foo*', 'bar*'],
	};

	const nonTargetingElement: InternalSetupElement = {
		executor: 'test',
		sourcePlugin: fakeSourcePlugin,
		workspacePackage: fakeWorkspacePackage,
	};

	it('should resolve the concrete files the elements target for each element', async () => {
		const normalized = await normalizeElementTargets({
			elements: [fooTargetingElement, fooTargetingElement],
			workspacePackage: fakeWorkspacePackage,
		});
		expect(normalized.targetedElements).toEqual<InternalSetupElementsWithResolvedTargets[]>([
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
		const normalized = await normalizeElementTargets({
			elements: [fooAndBarTargetingElement],
			workspacePackage: fakeWorkspacePackage,
		});
		expect(normalized.targetedElements).toEqual<InternalSetupElementsWithResolvedTargets[]>([
			{
				resolvedTargetFiles: ['foo', 'bar'],
				element: fooAndBarTargetingElement,
			},
		]);

		expect(normalized.untargetedElements).toHaveLength(0);
	});

	it('should resolve the concrete files the elements target for each element for multi and single globs too', async () => {
		const normalized = await normalizeElementTargets({
			elements: [fooGlobTargetingElement, fooAndBarGlobTargetingElement],
			workspacePackage: fakeWorkspacePackage,
		});

		expect(normalized.targetedElements).toEqual<InternalSetupElementsWithResolvedTargets[]>([
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
		const normalized = await normalizeElementTargets({
			elements: [nonTargetingElement],
			workspacePackage: fakeWorkspacePackage,
		});
		expect(normalized.targetedElements).toHaveLength(0);

		expect(normalized.untargetedElements).toEqual([nonTargetingElement]);
	});
});
