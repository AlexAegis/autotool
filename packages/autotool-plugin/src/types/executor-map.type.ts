import type { InternalAutotoolElementExecutor } from './autotool-element-executor.interface.js';
import type { AutotoolElement } from './autotool-element.interface.js';

export type ExecutorMap<Elements extends AutotoolElement = AutotoolElement> = Map<
	string,
	InternalAutotoolElementExecutor<Elements>
>;
