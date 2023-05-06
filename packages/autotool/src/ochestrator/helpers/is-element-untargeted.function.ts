import { isNullish } from '@alexaegis/common';
import { type InternalSetupElement } from 'autotool-plugin';

export const isElementUntargeted = (element: InternalSetupElement): boolean => {
	return isNullish(element.targetFile) && isNullish(element.targetFilePatterns);
};
