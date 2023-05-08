import type { AutotoolElementValidator, ElementError } from 'autotool-plugin';

/**
 * Checks if every element has an executor registered
 *
 * @deprecated executorless elements are dropped off at consolidation
 */
export const validateEveryElementShouldHaveAnExecutor: AutotoolElementValidator = (
	workspacePackageElementsByTarget,
	executorMap
) => {
	console.log(
		'workspacePackageElementsByTarget',
		workspacePackageElementsByTarget.targetedElementsByFile
	);
	console.log(
		'Object.values(workspacePackageElementsByTarget.targetedElementsByFile).flat(1)',
		Object.values(workspacePackageElementsByTarget.targetedElementsByFile).flat(1)
	);
	const elementExecutors = [
		...Object.values(workspacePackageElementsByTarget.targetedElementsByFile).flat(1),
		...workspacePackageElementsByTarget.untargetedElements,
	]
		.map((a) => {
			console.log('a', a);
			return a;
		})
		.map((packageElement) => packageElement.element.executor);

	console.log('elementExecutors', elementExecutors);
	return [
		...new Set(elementExecutors.filter((executorName) => !executorMap.has(executorName))),
	].map<ElementError>((executor) => ({
		message: `Element with executor: ${executor} doesn't have a registered executor.`,
	}));
};
