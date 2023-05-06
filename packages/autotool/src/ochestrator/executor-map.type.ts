import type { SetupElement, SetupElementExecutor } from 'autotool-plugin';

export type ExecutorMap = Map<string, SetupElementExecutor<SetupElement<string>>>;
