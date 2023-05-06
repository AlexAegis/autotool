import type { PackageJson } from '@alexaegis/workspace-tools';
import type { AutotoolElement } from 'autotool-plugin';

export interface AutotoolElementPackageJson extends AutotoolElement<'package-json'> {
	data: PackageJson;
}
