import type { RootWorkspacePackage } from '@alexaegis/workspace-tools';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getAssumedFinalInstallLocationOfPackage } from './get-assumed-final-install-location-of-package.function.js';

describe('getAssumedFinalInstallLocationOfPackage', () => {
	const packagePath = 'root';
	const rootWorkspacePackage: RootWorkspacePackage = {
		packageKind: 'root',
		workspacePackagePatterns: [],
		packageJson: {},
		packageJsonPath: '',
		packagePath,
		packagePathFromRootPackage: '.',
	};

	it('should assume it will end up in node_modules', () => {
		const result = getAssumedFinalInstallLocationOfPackage(rootWorkspacePackage, '@org/name');

		expect(result).toEqual(join(packagePath, 'node_modules', '@org', 'name'));
	});
});
