import type {
	AutotoolElement,
	AutotoolElementValidator,
	AutotoolPluginObject,
	ExecutorMap,
} from 'autotool-plugin';
import type { PackageManager } from '../../../autotool-plugin/src/helpers/discover-package-manager.function.js';

export interface AutotoolContext<Elements extends AutotoolElement = AutotoolElement> {
	plugins: AutotoolPluginObject<Elements>[];
	executorMap: ExecutorMap<Elements>;
	validators: AutotoolElementValidator<Elements>[];
	packageManager: PackageManager;
}
