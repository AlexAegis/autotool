import type { SetupPlugin, WorkspacePackage } from 'autotool-plugin';
import { describe, expect, it } from 'vitest';
import { filterElementsForPackage } from './filter-elements-for-package.function.js';

describe('filterElementsForPackage', () => {
	const pluginA: SetupPlugin = {
		name: 'a',
		elements: [
			{
				executor: 'package-json',
				data: {},
				packageJsonFilter: {
					private: false,
				},
			},
		],
	};

	const pluginB: SetupPlugin = {
		name: 'b',
		elements: [
			{
				executor: 'package-json',
				data: {},
				packageJsonFilter: {
					name: /bar.*/,
				},
			},
		],
	};

	const plugins = [pluginA, pluginB];

	it('should not return anything if no elements match for a package', () => {
		const fakeWorkspacePackageFoo: WorkspacePackage = {
			packageJson: {
				name: 'foo',
				private: true,
			},
			packageJsonPath: '',
			packageKind: 'regular',
			packagePath: '',
		};

		const filtered = filterElementsForPackage(fakeWorkspacePackageFoo, plugins);
		expect(filtered.elements).toHaveLength(0);
	});

	it('should return only the elements that are matching', () => {
		const fakeWorkspacePackageFoo: WorkspacePackage = {
			packageJson: {
				name: 'foo',
				private: false,
			},
			packageJsonPath: '',
			packageKind: 'regular',
			packagePath: '',
		};

		const filtered = filterElementsForPackage(fakeWorkspacePackageFoo, plugins);
		expect(filtered.elements).toHaveLength(1);
	});

	it('should filter out all the elements from plugins that are applicable for bar package', () => {
		const fakeWorkspacePackageBar: WorkspacePackage = {
			packageJson: { name: 'bar', private: false },
			packageJsonPath: '',
			packageKind: 'regular',
			packagePath: '',
		};

		const filtered = filterElementsForPackage(fakeWorkspacePackageBar, plugins);
		console.log('filter', filtered);
		expect(filtered.elements).toHaveLength(2);
	});
});