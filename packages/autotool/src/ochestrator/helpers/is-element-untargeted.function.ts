import { isNullish } from '@alexaegis/common';
import { type InternalElement } from 'autotool-plugin';

export const isElementUntargeted = (element: InternalElement): boolean => {
	return isNullish(element.targetFile) && isNullish(element.targetFilePatterns);
};
