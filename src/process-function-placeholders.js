function processFunctionPlaceholders(functionPlaceholders, newNodes) {
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
