import type { NormalizedLoggerOption } from '@alexaegis/logging';
import type {
	AutotoolElement,
	AutotoolElementExecutor,
	AutotoolPluginObject,
	ExecutorMap,
	InternalAutotoolElementExecutor,
} from 'autotool-plugin';

export const createExecutorMap = <Elements extends AutotoolElement = AutotoolElement>(
	plugins: AutotoolPluginObject<Elements>[],
	options: NormalizedLoggerOption,
): ExecutorMap<Elements> => {
	return plugins.reduce((executorMap, plugin) => {
		if (plugin.executors) {
			plugin.executors;
			for (const [key, executor] of Object.entries<AutotoolElementExecutor<Elements>>(
				plugin.executors,
			)) {
				if (key !== executor.type) {
					options.logger.warn(
						`Executor ${executor.type} was declared with the wrong key (${key}) in ${plugin.name}!`,
					);
				}
				if (executorMap.has(executor.type)) {
					options.logger.warn(
						`Executor ${executor.type} already loaded! Plugin: ${plugin.name} trying to load it again!`,
					);
				} else {
					executorMap.set(executor.type, {
						...executor,
						sourcePlugin: plugin,
					});
				}
			}
		}
		return executorMap;
	}, new Map<string, InternalAutotoolElementExecutor<Elements>>());
};
