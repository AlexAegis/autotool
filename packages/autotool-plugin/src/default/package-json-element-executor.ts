import type { ObjectKeyOrder } from '@alexaegis/common';
import type { PackageJson } from '@alexaegis/workspace-tools';
import type { UntargetedAutotoolElement } from 'autotool-plugin';

export interface AutotoolElementPackageJson extends UntargetedAutotoolElement<'packageJson'> {
	data: PackageJson;
	sortingPreference?: ObjectKeyOrder;
}

export const isAutotoolElementPackageJson = (
	element: UntargetedAutotoolElement
): element is AutotoolElementPackageJson => {
	return element.executor === 'packageJson';
};
