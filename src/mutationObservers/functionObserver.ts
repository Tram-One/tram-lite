export const processFunctionPlaceholders = (functionPlaceholders: { [key: string]: Function }, newNodes: Element[]) => {
	newNodes.forEach((addedNode) => {
		const attrsList = [...addedNode.attributes];
		const functionAttrs = attrsList.filter((attr) => attr.value.match(/^fn\d+$/));
		functionAttrs.forEach((fnAttr) => {
			// remove the assigned attr
			addedNode.removeAttribute(fnAttr.name);
			// check if this is an event (it starts with `on`)
			const isEventAttr = fnAttr.name.match(/^on/);
			if (isEventAttr) {
				const eventName = fnAttr.name.substring(2);
				// TODO fix this any type
				addedNode.addEventListener(eventName, functionPlaceholders[fnAttr.value] as any);
			} else {
				// handle non-event case
			}
		});
	});
};

// mutation observer to attach real functions to elements
const observeFunctionAttributes =
	(functionPlaceholders: { [key: string]: Function }) => (mutationList: MutationRecord[]) => {
		mutationList.forEach((mutationRecord) => {
			const attrValue = (mutationRecord.target as HTMLElement).getAttribute(mutationRecord.attributeName as string);
			console.log(attrValue);
		});
	};

export const newFunctionObserver = (functionPlaceholders: { [key: string]: Function }) => {
	const observerForFunctionAttrs = observeFunctionAttributes(functionPlaceholders);
	return new MutationObserver(observerForFunctionAttrs);
};
