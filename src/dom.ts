import { Registry } from './types.d';
import { newRegistryObserver, processNewNodes } from './mutationObservers/registeryObserver';
import { processFunctionPlaceholders } from './processFunctionPlaceholders';
import { processVariablePlaceholders } from './processVariablePlaceholders';

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
		const variablePlaceholders: { [key: string]: Function } = {};

		// set function and variable placeholders, and then apply them after-the-fact
		const varsAndFuncs = variables.map((variable) => {
			if (typeof variable === 'function') {
				const newFnPlaceholder = `[fn${Object.keys(functionPlaceholders).length}]`;
				functionPlaceholders[newFnPlaceholder] = variable;
				return newFnPlaceholder;
			} else {
				const newVarPlaceholder = `[var${Object.keys(variablePlaceholders).length}]`;
				variablePlaceholders[newVarPlaceholder] = variable;
				return newVarPlaceholder;
			}
			// return variable;
		});

		// const functionObserver = newFunctionObserver(functionPlaceholders);
		// const variableObserver = newVariableObserver(variablePlaceholders);

		const newElement = String.raw({ raw: strings }, ...varsAndFuncs);
		const emptyContainer = document.createElement('div');
		emptyContainer.innerHTML = newElement;
		const result = emptyContainer.firstElementChild as HTMLElement;

		// set up the observer that will inject custom components
		registryObserver.observe(result, { childList: true, subtree: true });

		// set up the observer that will inject functions that we templated
		// functionObserver.observe(result, { childList: true, attributes: true, subtree: true });
		// variableObserver.observe(result, { childList: true, attributes: true, subtree: true });

		// do an initial process of the elements
		// JESSE - this wasn't originally required, but is now :thinking:
		processNewNodes(registry, [...emptyContainer.querySelectorAll('*')]);
		processFunctionPlaceholders(functionPlaceholders, [...emptyContainer.querySelectorAll('*')]);
		processVariablePlaceholders(variablePlaceholders, [...emptyContainer.querySelectorAll('*')]);
		return result;
	};
	return htmlTagFunction;
};
