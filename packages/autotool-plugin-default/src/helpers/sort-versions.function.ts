import { coerce, compareBuild } from 'semver';

export const sortVersions = (versions: (string | undefined)[]): string[] => {
	return versions
		.map((version) => ({ version, coercedVersion: coerce(version) }))
		.sort((a, b) => {
			if (a.coercedVersion && b.coercedVersion) {
				return compareBuild(a.coercedVersion, b.coercedVersion);
			} else if (a.version && b.version) {
				return a.coercedVersion ? -1 : 1;
			} else {
				return a.version ? 1 : -1;
			}
		})
		.map((v) => v.version ?? '*');
};
