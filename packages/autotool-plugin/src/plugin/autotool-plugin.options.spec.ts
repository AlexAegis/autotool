import { noopLogger } from '@alexaegis/logging';
import { describe, expect, it } from 'vitest';
import {
	normalizeAutotoolPluginOptions,
	type AutotoolPluginOptions,
	type NormalizedAutotoolPluginOptions,
} from './autotool-plugin.options.js';

describe('normalizeAutotoolPluginOptions', () => {
	it('should have a default when not defined', () => {
		expect(normalizeAutotoolPluginOptions({ workspaceRoot: 'root' })).toEqual({
			cwd: process.cwd(),
			logger: noopLogger,
			workspaceRoot: 'root',
		} as NormalizedAutotoolPluginOptions);
	});

	it('should use the provided values when defined', () => {
		const manualOptions: AutotoolPluginOptions = {
			cwd: 'foo',
			logger: noopLogger,
			workspaceRoot: 'root',
		};
		expect(normalizeAutotoolPluginOptions(manualOptions)).toEqual(manualOptions);
	});
});
