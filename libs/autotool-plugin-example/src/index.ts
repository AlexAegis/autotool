import {
	type AutotoolElementFileCopy,
	type AutotoolPlugin,
	type AutotoolPluginObject,
} from 'autotool-plugin';
import { join } from 'node:path';
import packageJson from '../package.json';

export const plugin: AutotoolPlugin = (_options): AutotoolPluginObject => {
	return {
		name: packageJson.name,
		elements: [
			{
				description: 'copy workspace root ts config',
				executor: 'fileCopy',
				packageKind: 'root',
				targetFile: 'tsconfig.json',
				sourcePluginPackageName: packageJson.name,
				sourceFile: join('static', 'workspace-tsconfig.json'),
			},
			{
				description: 'add workspace root ts scripts',
				executor: 'packageJson',
				packageKind: 'root',
				targetFile: 'package.json',
				packageJsonFilter: {
					keywords: (keywords) => keywords.includes(packageJson.name),
				},
				data: {
					scripts: {
						'lint:tsc': 'turbo run lint:tsc_ --concurrency 16 --cache-dir .cache/turbo',
					},
					devDependencies: {
						'@alexaegis/ts': `^${packageJson.version}`, // For the root tsConfig
						typescript: packageJson.dependencies.typescript,
						'ts-node': packageJson.peerDependencies['ts-node'],
					},
				},
			},
			{
				description: 'add package ts scripts',
				executor: 'packageJson',
				packageKind: 'regular',
				packageJsonFilter: {
					keywords: (keywords) => keywords.includes(packageJson.name),
				},
				data: {
					scripts: {
						'lint:tsc':
							'turbo run lint:tsc_ --concurrency 16 --cache-dir .cache/turbo --filter ${packageName}',
						'lint:tsc_': 'tsc --noEmit',
					},
					devDependencies: {
						'@alexaegis/ts': `^${packageJson.version}`,
					},
				},
			},
			{
				description: 'remove unnecessary tsconfig files',
				executor: 'fileRemove',
				targetFilePatterns: 'tsconfig.!(json)',
			},
			{
				description: 'add @types/node as a devDependency',
				executor: 'packageJson',
				packageKind: 'regular',
				packageJsonFilter: {
					keywords: (keywords) => keywords.includes(`${packageJson.name}-node`),
				},
				data: {
					devDependencies: {
						'@types/node': packageJson.devDependencies['@types/node'],
					},
				},
			},
			...['base', 'web', 'svelte', 'node'].map<AutotoolElementFileCopy>((flavour) => ({
				name: `copy tsconfig for ${flavour} packages`,
				sourcePluginPackageName: packageJson.name,
				executor: 'fileCopy',
				packageKind: 'regular',
				targetFile: 'tsconfig.json',
				packageJsonFilter: {
					keywords: (keywords) => keywords.includes(`${packageJson.name}-${flavour}`),
				},
				sourceFile: join('static', 'package-simple-tsconfig.json'),
				templateVariables: {
					flavour,
				},
			})),
		],
	};
};

export default plugin;
