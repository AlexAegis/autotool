import type { NormalizedLoggerOption } from '@alexaegis/logging';
import type { AutotoolPluginObject, ExecutorMap } from 'autotool-plugin';

export const checkIfTheresAnElementWithoutValidExecutor = (
	plugins: AutotoolPluginObject[],
	executorMap: ExecutorMap,
	options: NormalizedLoggerOption
): boolean => {
	let failed = false;
	for (const plugin of plugins) {
		for (const element of plugin.elements ?? []) {
			if (!executorMap.has(element.executor)) {
				failed = true;
				options.logger.error(
					`Plugin ${plugin.name} contains an element with no executor: ${element.executor}`
				);
			}
		}
	}
	return failed;
};
