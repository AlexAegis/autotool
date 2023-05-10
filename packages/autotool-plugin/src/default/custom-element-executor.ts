import type { AutotoolElementExecutor } from '../types/autotool-element-executor.interface.js';
import type { UntargetedAutotoolElement } from '../types/autotool-element.interface.js';

export interface AutotoolElementCustom extends UntargetedAutotoolElement<'custom'> {
	apply: AutotoolElementExecutor<this>['apply'];
}
