import type { NormalizedLoggerOption } from '@alexaegis/logging';
import type { AutotoolContext } from '../internal/autotool-context.type.js';

export const checkIfTheresAnElementWithoutValidExecutor = (
	context: Pick<AutotoolContext, 'plugins' | 'executorMap'>,
	options: NormalizedLoggerOption
): boolean => {
	let failed = false;
	for (const plugin of context.plugins) {
		for (const element of plugin.elements ?? []) {
			if (!context.executorMap.has(element.executor)) {
				failed = true;
				options.logger.error(
					`Plugin ${plugin.name} contains an element with no executor: ${element.executor}`
				);
			}
		}
	}
	return failed;
};
