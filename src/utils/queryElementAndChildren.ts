export const queryElementAndChildren = (rootElement: Element, selector: string) => {
	const elementHasAttribute = rootElement.matches(selector);
	const elementMatchingSelector = elementHasAttribute ? [rootElement] : [];
	const elementChildenWithAttribute = rootElement.querySelectorAll(selector);
	return [...elementMatchingSelector, ...elementChildenWithAttribute];
};
