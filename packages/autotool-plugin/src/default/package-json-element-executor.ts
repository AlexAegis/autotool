import type { PackageJson } from '@alexaegis/workspace-tools';
import type { AutotoolElement } from 'autotool-plugin';

export interface AutotoolElementPackageJson extends AutotoolElement<'packageJson'> {
	data: PackageJson;
}

export const isAutotoolElementPackageJson = (
	element: AutotoolElement
): element is AutotoolElementPackageJson => {
	return element.executor === 'packageJson';
};
