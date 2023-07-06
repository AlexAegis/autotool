import { type NormalizedAutotoolOptions } from 'autotool-plugin';

export const autotoolPluginFilterPredicate = (
	pluginName: string,
	options: Pick<NormalizedAutotoolOptions, 'enabledPlugins' | 'disabledPlugins'>,
) => {
	let isEnabled = true;
	if (options.enabledPlugins.length > 0) {
		isEnabled = options.enabledPlugins.some((enabledPlugin) => enabledPlugin.test(pluginName));
	}

	let isDisabled = false;
	if (options.disabledPlugins.length > 0) {
		isDisabled = options.disabledPlugins.some((disabledPlugin) =>
			disabledPlugin.test(pluginName),
		);
	}

	return (isEnabled && !isDisabled) || pluginName === 'autotool-plugin-default'; // Default is always enabled
};
