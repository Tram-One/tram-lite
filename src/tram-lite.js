/**
 * template tag function to build a component
 */
function html(strings, ...variables) {
	// hold all the functions, so we can apply them later
	const functionPlaceholders = {};

	const varsAndFuncs = variables.map((variable) => {
		if (typeof variable === 'function') {
			const newPlaceholder = `tram-fn${Object.keys(functionPlaceholders).length}`;
			functionPlaceholders[newPlaceholder] = variable;
			return newPlaceholder;
		}
		return variable;
	});

	const newElement = String.raw({ raw: strings }, ...varsAndFuncs);
	const emptyContainer = document.createElement('tram-container');
	emptyContainer.innerHTML = newElement;

	// get all the elements, and see if they have any function placeholders
	// we need to actually attach to the element
	const allElements = [...emptyContainer.querySelectorAll('*')];
	_processFunctionPlaceholders(functionPlaceholders, allElements);

	return emptyContainer.firstElementChild;
}

/* Utility Functions */
function _processFunctionPlaceholders(functionPlaceholders, newNodes) {
	newNodes.forEach((addedNode) => {
		const attrsList = [...addedNode.attributes];
		const functionAttrs = attrsList.filter((attr) => attr.value.match(/^tram-fn\d+$/));
		functionAttrs.forEach((fnAttr) => {
			// remove the assigned attr
			addedNode.removeAttribute(fnAttr.name);
			// check if this is an event (it starts with `on`)
			const isEventAttr = fnAttr.name.match(/^on/);
			if (isEventAttr) {
				const eventName = fnAttr.name.substring(2);
				addedNode.addEventListener(eventName, functionPlaceholders[fnAttr.value]);
			} else {
				// handle non-event case
			}
		});
	});
}
