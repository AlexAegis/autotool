import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getAssumedFinalInstallLocationOfPackage } from './get-assumed-final-install-location-of-package.function.js';

describe('getAssumedFinalInstallLocationOfPackage', () => {
	it('should assume it will end up in node_modules', () => {
		const result = getAssumedFinalInstallLocationOfPackage(
			{ workspaceRoot: 'root' },
			{ name: '@org/name' }
		);

		expect(result).toEqual(join('root', 'node_modules', '@org', 'name'));
	});
});
