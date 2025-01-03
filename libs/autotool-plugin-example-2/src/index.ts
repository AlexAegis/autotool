import {
	type AutotoolPlugin,
	type AutotoolPluginObject,
	type DefaultAutotoolElements,
} from 'autotool-plugin';
import packageJson from '../package.json' assert { type: 'json' };

const plugin: AutotoolPlugin = (_options): AutotoolPluginObject<DefaultAutotoolElements> => {
	return {
		name: packageJson.name,
		elements: [
			{
				description: 'BAR TO BOTH',
				executor: 'packageJson',
				packageKind: 'regular',
				packageJsonFilter: {
					archetype: {
						language: /^(ts|typescript)$/,
					},
				},
				data: {
					bar: 'lol',
					dependencies: {
						'autotool-plugin': packageJson.dependencies['autotool-plugin'],
					},
				},
			},
			{
				description: 'FOO TO NOT AUTOTOOL',
				executor: 'packageJson',
				packageJsonFilter: {
					archetype: {
						language: /^(ts|typescript)$/,
					},
					name: (name) => name !== 'autotool',
				},
				packageKind: 'regular',
				data: {
					foo: 'lol',
				},
			},
		],
	};
};

export default plugin;
