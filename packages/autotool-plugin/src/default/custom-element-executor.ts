import type { AutotoolElementExecutor } from '../types/autotool-element-executor.interface.js';
import type {
	AutotoolElement,
	UntargetedAutotoolElement,
} from '../types/autotool-element.interface.js';

export interface AutotoolElementCustom extends UntargetedAutotoolElement<'custom'> {
	apply: AutotoolElementExecutor<this>['apply'];
}

export const isAutotoolElementCustom = (
	element: AutotoolElement,
): element is AutotoolElementCustom => {
	return element.executor === 'custom';
};
