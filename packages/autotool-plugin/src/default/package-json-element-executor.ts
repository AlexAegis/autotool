import type { ObjectKeyOrder } from '@alexaegis/common';
import type { PackageJson } from '@alexaegis/workspace-tools';
import type { AutotoolElement } from 'autotool-plugin';

export interface AutotoolElementPackageJson extends AutotoolElement<'packageJson'> {
	data: PackageJson;
	sortingPreference?: ObjectKeyOrder;
}

export const isAutotoolElementPackageJson = (
	element: AutotoolElement
): element is AutotoolElementPackageJson => {
	return element.executor === 'packageJson';
};
