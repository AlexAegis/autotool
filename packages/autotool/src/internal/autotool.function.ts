import { asyncMap, sleep } from '@alexaegis/common';
import { collectWorkspacePackages } from '@alexaegis/workspace-tools';
import {
	normalizeAutotoolOptions,
	normalizeAutotoolPluginOptions,
	type AutotoolOptions,
	type NormalizedAutotoolPluginOptions,
} from 'autotool-plugin';
import { execSync } from 'node:child_process';
import { checkIfTheresAnElementWithoutValidExecutor } from '../helpers/check-if-theres-an-element-without-valid-executor.function.js';
import { assignElementsToTargets } from './assign-elements-to-targets.function.js';
import { autotoolPluginFilterPredicate } from './autotool-plugin-filter-predicate.function.js';
import { executeElementsOnPackage } from './execute-elements-on-package.function.js';
import { loadContext } from './load-plugin-context.function.js';
import { validate } from './validate.function.js';

export const autotool = async (rawOptions: AutotoolOptions): Promise<void> => {
	const options = normalizeAutotoolOptions(rawOptions);

	if (options.maxAllowedRecursion <= 0) {
		options.logger.info('recursive limit reached!');
		return;
	}

	const workspacePackages = await collectWorkspacePackages(rawOptions);

	const context = await loadContext(workspacePackages, options);

	if (checkIfTheresAnElementWithoutValidExecutor(context, options)) {
		return;
	}

	const workspacePackagesWithElementsByTarget = await assignElementsToTargets(
		workspacePackages,
		context,
		options,
	);

	options.logger.trace(workspacePackagesWithElementsByTarget);
	const elementOptions: NormalizedAutotoolPluginOptions = normalizeAutotoolPluginOptions({
		logger: options.logger,
		cwd: options.cwd,
		dry: options.dryish,
		force: options.force,
		rootWorkspacePackage: context.rootWorkspacePackage,
		packageManager: context.packageManager,
		allWorkspacePackages: workspacePackages,
	});

	const isValid = await validate(
		workspacePackagesWithElementsByTarget,
		context,
		elementOptions,
		options,
	);

	if (isValid) {
		const results = await asyncMap(
			workspacePackagesWithElementsByTarget,
			async (workspacePackageElementsByTarget) => {
				const targetPackageLogger = options.logger.getSubLogger({
					name: workspacePackageElementsByTarget.workspacePackage.packagePathFromRootPackage.replace(
						/^\.$/,
						'workspace-root',
					),
				});
				return await executeElementsOnPackage(
					workspacePackageElementsByTarget,
					context.rootWorkspacePackage,
					context.executorMap,
					{ ...elementOptions, logger: targetPackageLogger },
					{
						...options,
						logger: targetPackageLogger,
					},
				);
			},
		);

		const addedAutotoolPlugins = results
			.flatMap((result) => result.addedAutotoolPlugins)
			.filter((pluginName) => autotoolPluginFilterPredicate(pluginName, options));

		if (results.some((result) => result.someDependencyChanged)) {
			options.logger.info(
				'Some dependencies have changed! Installing packages using',
				context.packageManager.name,
			);
			execSync(context.packageManager.installCommand, {
				stdio: 'inherit',
			});

			// If a plugin is present in the root-packageJson that wasn't loaded into the context
			// that means it was freshly added by another plugin. Recursively call autotool in this case.
			if (addedAutotoolPlugins.length > 0) {
				options.logger.info(
					'New autotool plugins have been added! Re-executing autotool!',
					addedAutotoolPlugins,
				);
				options.logger.info(
					'Remaining recursions available:',
					options.maxAllowedRecursion - 1,
				);

				await sleep(1000);

				await autotool({
					...options,
					maxAllowedRecursion: options.maxAllowedRecursion - 1,
				});
				return;
			}
		}
	} else {
		options.logger.error('setup was not valid. exit without doing anything.');
	}
};
