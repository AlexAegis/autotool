import { noopLogger } from '@alexaegis/logging';
import { describe, expect, it } from 'vitest';
import {
	normalizeAutotoolOptions,
	type AutotoolOptions,
	type NormalizedAutotoolOptions,
} from './autotool.function.options.js';

describe('normalizeMemoizeOptions', () => {
	it('should have a default when not defined', () => {
		expect(normalizeAutotoolOptions()).toEqual({
			cwd: process.cwd(),
			dry: false,
			dryish: false,
			force: false,
			listPlugins: false,
			logger: noopLogger,
			dependencyCriteria: [],
			disabledPlugins: [],
			enabledPlugins: [],
			onlyWorkspaceRoot: false,
			skipWorkspaceRoot: false,
			packageJsonMatcher: undefined,
			maxAllowedRecursion: 3,
		} as NormalizedAutotoolOptions);
	});

	it('should use the provided values when defined', () => {
		const manualOptions: AutotoolOptions = {
			cwd: 'foo',
			dry: true,
			dryish: false,
			force: true,
			listPlugins: true,
			logger: noopLogger,
			maxAllowedRecursion: 2,
			packageJsonMatcher: undefined,
			skipWorkspaceRoot: false,
			onlyWorkspaceRoot: false,
			dependencyCriteria: [],
			disabledPlugins: [],
			enabledPlugins: [],
		};
		expect(normalizeAutotoolOptions(manualOptions)).toEqual(manualOptions);
	});
});
