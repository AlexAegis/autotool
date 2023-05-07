import type { WorkspacePackage } from '@alexaegis/workspace-tools';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getAssumedFinalInstallLocationOfPackage } from './get-assumed-final-install-location-of-package.function.js';

describe('getAssumedFinalInstallLocationOfPackage', () => {
	const packagePath = 'root';
	const workspaceRootPackage: WorkspacePackage = {
		packageJson: {},
		packageJsonPath: '',
		packageKind: 'regular',
		packagePath,
	};

	it('should assume it will end up in node_modules', () => {
		const result = getAssumedFinalInstallLocationOfPackage(
			{ workspaceRootPackage },
			{ name: '@org/name' }
		);

		expect(result).toEqual(join(packagePath, 'node_modules', '@org', 'name'));
	});
});
