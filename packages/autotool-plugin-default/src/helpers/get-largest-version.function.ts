import { sortVersions } from './sort-versions.function.js';

export const getLargestVersion = (...versions: (string | undefined)[]): string => {
	const sorted = sortVersions(versions);
	return sorted.pop() ?? '*';
};
