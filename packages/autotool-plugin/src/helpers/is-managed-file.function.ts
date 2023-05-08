import { readFile } from 'node:fs/promises';

export const AUTOTOOL_MARK = 'managed-by-autotool';

export const isManagedFile = async (path: string, mark = AUTOTOOL_MARK): Promise<boolean> => {
	try {
		const content = await readFile(path, { encoding: 'utf8' });
		return content.includes(mark);
	} catch {
		return false;
	}
};
