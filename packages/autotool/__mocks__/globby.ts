import type { Options } from 'globby';

export const globby = (patterns: string[] | string, _options: Options): string[] => {
	if (typeof patterns === 'string') {
		return patterns.includes('*')
			? [patterns.replace('*', '.js'), patterns.replace('*', '.ts')]
			: [patterns];
	} else {
		return patterns.flatMap((pattern) => globby(pattern, _options));
	}
};
