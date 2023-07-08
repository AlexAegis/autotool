import type { AutotoolElementCustom, AutotoolElementExecutor } from 'autotool-plugin';

export const autotoolElementCustomExecutor: AutotoolElementExecutor<AutotoolElementCustom> = {
	type: 'custom',
	execute: async (element, target, options): Promise<void> => {
		await element.apply(element, target, options);
	},
};
