import { Registry } from './types.d';
import { newRegistryObserver, processNewNodes } from './mutationObservers/registeryObserver';
import { newFunctionObserver, processFunctionPlaceholders } from './mutationObservers/functionObserver';

/**
 * This function takes in a registry of custom components,
 * and builds a `html` template tag function that can take in a template HTML string.
 *
 * @param registry mapping of tag names to component functions
 */
export const registerDom = (registry: Registry = {}) => {
	const registryObserver = newRegistryObserver(registry);

	const htmlTagFunction = (strings: TemplateStringsArray, ...variables: any[]) => {
		const functionPlaceholders: { [key: string]: Function } = {};

		// set function placeholders, and then apply them after-the-fact
		const varsAndFuncs = variables.map((variable) => {
			if (typeof variable === 'function') {
				const newPlaceholder = `fn${Object.keys(functionPlaceholders).length}`;
				functionPlaceholders[newPlaceholder] = variable;
				return newPlaceholder;
			}
			return variable;
		});
		const functionObserver = newFunctionObserver(functionPlaceholders);

		const newElement = String.raw({ raw: strings }, ...varsAndFuncs);
		const emptyContainer = document.createElement('div');
		emptyContainer.innerHTML = newElement;
		const result = emptyContainer.firstElementChild as HTMLElement;

		// set up the observer that will inject custom components
		registryObserver.observe(result, { childList: true, subtree: true });
		// set up the observer that will inject functions that we templated
		functionObserver.observe(result, { childList: true, attributes: true, subtree: true });

		// do an initial process of the elements
		// JESSE - this wasn't originally required, but is now :thinking:
		processNewNodes(registry, [...emptyContainer.querySelectorAll('*')]);
		processFunctionPlaceholders(functionPlaceholders, [...emptyContainer.querySelectorAll('*')]);

		return result;
	};
	return htmlTagFunction;
};
