import type { ObjectKeyOrder } from '@alexaegis/common';
import type { PackageJson } from '@alexaegis/workspace-tools';
import type { UntargetedAutotoolElement } from 'autotool-plugin';

export interface AutotoolElementPackageJson extends UntargetedAutotoolElement<'packageJson'> {
	data: PackageJson;
	/**
	 * You can think of this as the power of this element. Higher passes
	 * always overwrite lower ones. Can be used to forcefully remove/overwrite
	 * things other plugins would define.
	 *
	 * @default 0
	 */
	consolidationPass?: number;
	sortingPreference?: ObjectKeyOrder;
}

export const isAutotoolElementPackageJson = (
	element: UntargetedAutotoolElement
): element is AutotoolElementPackageJson => {
	return element.executor === 'packageJson';
};
