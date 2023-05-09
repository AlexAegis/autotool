import type { AutotoolElement, ElementForPackage } from '../types/autotool-element.interface.js';
import type { AutotoolPluginObject } from '../types/autotool-plugin.interface.js';

export interface ElementError<Element extends AutotoolElement = AutotoolElement> {
	message: string;
	code: string;
	targetFile: string;
	sourcePlugins: AutotoolPluginObject<Element>[];
	sourceElements: ElementForPackage<Element>[];
}
