import { PACKAGE_JSON_NAME, type WorkspacePackage } from '@alexaegis/workspace-tools';
import type { AutotoolElement, AutotoolPluginFilter, AutotoolPluginObject } from 'autotool-plugin';
import { describe, expect, it } from 'vitest';
import { elementAndPluginFilter } from './element-and-plugin-filter.function.js';

describe('elementAndPluginFilter', () => {
	const rootPackage: WorkspacePackage = {
		packageJson: {
			name: 'root',
		},
		packageJsonPath: 'foo/' + PACKAGE_JSON_NAME,
		packagePath: 'foo',
		packageKind: 'root',
		workspacePackagePatterns: ['packages/*'],
		packagePathFromRootPackage: '.',
	};

	const regularPackageZed: WorkspacePackage = {
		packageJson: {
			name: 'zed',
			private: false,
		},
		packageJsonPath: 'foo/packages/zed' + PACKAGE_JSON_NAME,
		packagePath: 'foo/packages/zed',
		packageKind: 'regular',
		packagePathFromRootPackage: 'packages/zed',
	};

	const regularPackageZod: WorkspacePackage = {
		packageJson: {
			name: 'zod',
			private: true,
		},
		packageJsonPath: 'foo/packages/zod' + PACKAGE_JSON_NAME,
		packagePath: 'foo/packages/zod',
		packageKind: 'regular',
		packagePathFromRootPackage: 'packages/zod',
	};

	const sourcePlugin: AutotoolPluginObject<AutotoolElement> = {
		name: 'testPlugin',
	};

	describe('packageKind filtering', () => {
		it('should be able filter out only regular packages', () => {
			const filter: AutotoolPluginFilter = {
				packageKind: 'regular',
			};
			expect(elementAndPluginFilter(rootPackage, filter, sourcePlugin)).toBeFalsy();
			expect(elementAndPluginFilter(regularPackageZed, filter, sourcePlugin)).toBeTruthy();
			expect(elementAndPluginFilter(regularPackageZod, filter, sourcePlugin)).toBeTruthy();
		});

		it('should be able filter out only root packages', () => {
			const filter: AutotoolPluginFilter = {
				packageKind: 'root',
			};
			expect(elementAndPluginFilter(rootPackage, filter, sourcePlugin)).toBeTruthy();
			expect(elementAndPluginFilter(regularPackageZed, filter, sourcePlugin)).toBeFalsy();
			expect(elementAndPluginFilter(regularPackageZod, filter, sourcePlugin)).toBeFalsy();
		});

		it('should be able keep both kinds when not defined', () => {
			const filter: AutotoolPluginFilter = {};
			expect(elementAndPluginFilter(rootPackage, filter, sourcePlugin)).toBeTruthy();
			expect(elementAndPluginFilter(regularPackageZed, filter, sourcePlugin)).toBeTruthy();
			expect(elementAndPluginFilter(regularPackageZod, filter, sourcePlugin)).toBeTruthy();
		});

		it('should be able keep both kinds when explicitly defined to keep both', () => {
			const filter: AutotoolPluginFilter = {
				packageKind: 'all',
			};
			expect(elementAndPluginFilter(rootPackage, filter, sourcePlugin)).toBeTruthy();
			expect(elementAndPluginFilter(regularPackageZed, filter, sourcePlugin)).toBeTruthy();
			expect(elementAndPluginFilter(regularPackageZod, filter, sourcePlugin)).toBeTruthy();
		});
	});

	describe('packageJson filtering', () => {
		it('should be able filter out only regular packages', () => {
			const filter: AutotoolPluginFilter = {
				packageJsonFilter: {
					name: (name) => name?.startsWith('z'),
				},
			};
			expect(elementAndPluginFilter(rootPackage, filter, sourcePlugin)).toBeFalsy();
			expect(elementAndPluginFilter(regularPackageZed, filter, sourcePlugin)).toBeTruthy();
			expect(elementAndPluginFilter(regularPackageZod, filter, sourcePlugin)).toBeTruthy();
		});
	});

	describe('disabled plugins', () => {
		it('should not match for anything even if it would if the plugin is disabled on that package', () => {
			const filter: AutotoolPluginFilter = {
				packageJsonFilter: {
					name: (name) => name?.startsWith('z'),
				},
			};
			expect(elementAndPluginFilter(regularPackageZed, filter, sourcePlugin)).toBeTruthy();
			expect(
				elementAndPluginFilter(
					{
						...regularPackageZod,
						packageJson: {
							...regularPackageZod.packageJson,
							archetype: { disabledPlugins: [sourcePlugin.name] },
						},
					},
					filter,
					sourcePlugin,
				),
			).toBeFalsy();
		});
	});

	describe('mixed filtering', () => {
		it('should be able filter using both', () => {
			const filter: AutotoolPluginFilter = {
				packageKind: 'regular',
				packageJsonFilter: {
					private: true,
				},
			};
			expect(elementAndPluginFilter(rootPackage, filter, sourcePlugin)).toBeFalsy();
			expect(elementAndPluginFilter(regularPackageZed, filter, sourcePlugin)).toBeFalsy();
			expect(elementAndPluginFilter(regularPackageZod, filter, sourcePlugin)).toBeTruthy();
		});
	});
});
