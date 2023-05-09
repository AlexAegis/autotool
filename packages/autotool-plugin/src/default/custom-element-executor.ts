import type { AutotoolElementExecutor } from '../types/autotool-element-executor.interface.js';
import type { AutotoolElement } from '../types/autotool-element.interface.js';

export interface AutotoolElementCustom extends AutotoolElement<'custom'> {
	apply: AutotoolElementExecutor<this>['apply'];
}
