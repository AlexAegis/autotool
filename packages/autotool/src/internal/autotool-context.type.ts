import type {
	AutotoolElement,
	AutotoolElementValidator,
	AutotoolPluginObject,
	ExecutorMap,
} from 'autotool-plugin';

export interface AutotoolContext<Elements extends AutotoolElement = AutotoolElement> {
	plugins: AutotoolPluginObject<Elements>[];
	executorMap: ExecutorMap<Elements>;
	validators: AutotoolElementValidator<Elements>[];
}
