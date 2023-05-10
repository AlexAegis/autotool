import type { InternalAutotoolElementExecutor } from './autotool-element-executor.interface.js';
import type { UntargetedAutotoolElement } from './autotool-element.interface.js';

export type ExecutorMap<Elements extends UntargetedAutotoolElement = UntargetedAutotoolElement> =
	Map<string, InternalAutotoolElementExecutor<Elements>>;
