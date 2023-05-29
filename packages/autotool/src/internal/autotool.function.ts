import { asyncMap } from '@alexaegis/common';
import { collectWorkspacePackages } from '@alexaegis/workspace-tools';
import {
	normalizeAutotoolOptions,
	type AutotoolOptions,
	type NormalizedAutotoolPluginOptions,
} from 'autotool-plugin';
import { execSync } from 'node:child_process';
import { checkIfTheresAnElementWithoutValidExecutor } from '../helpers/check-if-theres-an-element-without-valid-executor.function.js';
import { discoverPackageManager } from '../helpers/discover-package-manager.function.js';
import { isRootWorkspacePackage } from '../helpers/is-root-workspace-package.function.js';
import { assignElementsToTargets } from './assign-elements-to-targets.function.js';
import { executeElementsOnPackage } from './execute-elements-on-package.function.js';
import { loadContext } from './load-plugin-context.function.js';
import { validate } from './validate.function.js';

export const autotool = async (rawOptions: AutotoolOptions): Promise<void> => {
	const options = normalizeAutotoolOptions(rawOptions);
	const workspacePackages = await collectWorkspacePackages(options);
	const rootWorkspacePackage = workspacePackages.find(isRootWorkspacePackage);

	if (!rootWorkspacePackage) {
		options.logger.warn('cannot do setup, not in a workspace!');
		return;
	}

	const packageManager = await discoverPackageManager(rootWorkspacePackage, {
		...options,
		logger: options.logger.getSubLogger({ name: 'discoverPackageManager' }),
	});

	const context = await loadContext(rootWorkspacePackage, options);

	if (checkIfTheresAnElementWithoutValidExecutor(context, options)) {
		return;
	}

	const workspacePackagesWithElementsByTarget = await assignElementsToTargets(
		workspacePackages,
		context
	);

	options.logger.trace(workspacePackagesWithElementsByTarget);
	const elementOptions: NormalizedAutotoolPluginOptions = {
		logger: options.logger,
		cwd: options.cwd,
		dry: options.dryish,
		force: options.force,
		filter: options.filter,
		filterPlugins: options.filterPlugins,
		rootWorkspacePackage,
	};

	const isValid = await validate(
		workspacePackagesWithElementsByTarget,
		context,
		elementOptions,
		options
	);

	if (isValid) {
		const results = await asyncMap(
			workspacePackagesWithElementsByTarget,
			async (workspacePackageElementsByTarget) => {
				const targetPackageLogger = options.logger.getSubLogger({
					name: workspacePackageElementsByTarget.workspacePackage
						.packagePathFromRootPackage,
				});
				return await executeElementsOnPackage(
					workspacePackageElementsByTarget,
					rootWorkspacePackage,
					context.executorMap,
					{ ...elementOptions, logger: targetPackageLogger },
					{
						...options,
						logger: targetPackageLogger,
					}
				);
			}
		);

		if (results.some((result) => result.someDependencyChanged)) {
			options.logger.info(
				'Some dependencies have changed! Installing packages using',
				packageManager.name
			);
			execSync(packageManager.installCommand, {
				stdio: 'inherit',
			});
		}
	}
};
