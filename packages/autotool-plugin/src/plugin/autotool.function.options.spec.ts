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
			listPlugins: false,
			logger: noopLogger,
		} as NormalizedAutotoolOptions);
	});

	it('should use the provided values when defined', () => {
		const manualOptions: AutotoolOptions = {
			cwd: 'foo',
			dry: true,
			dryish: false,
			listPlugins: true,
			logger: noopLogger,
		};
		expect(normalizeAutotoolOptions(manualOptions)).toEqual(manualOptions);
	});
});
