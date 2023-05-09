import type { NormalizedLoggerOption } from '@alexaegis/logging';
import type { PackageElementErrorWithSourceData } from './types.js';

export const reportElementError = (
	error: PackageElementErrorWithSourceData,
	options: NormalizedLoggerOption
): void => {
	const affectedPlugins = `Affected plugin${
		error.sourcePlugins.length > 1 ? 's' : ''
	}: ${error.sourcePlugins.map((plugin) => plugin.name).join(', ')}`;
	const affectedElements = `Affected element${
		error.sourceElements.length > 1 ? 's' : ''
	}: ${error.sourceElements
		.map(
			(element) =>
				element.executor + (element.description ? ' "' + element.description + '"' : '')
		)
		.join(', ')}`;

	options.logger.error(`Error: ${error.code}
	Reason: ${error.message}
	Target: ${error.targetFile}
	${affectedPlugins}
	${affectedElements}
	Workspace: ${error.workspacePackage.packagePath}`);
};
