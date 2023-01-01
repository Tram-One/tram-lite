export const querySelectorAndMatch = (rootElement: Element, selector: string) => {
	const elementHasAttribute = rootElement.matches(selector);
	const elementChildWithAttribute = rootElement.querySelector(selector);
	const elementMatchingSelector = elementHasAttribute ? rootElement : elementChildWithAttribute;
	return elementMatchingSelector;
};
