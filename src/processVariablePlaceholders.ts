export const processVariablePlaceholders = (variablePlaceholders: { [key: string]: any }, newNodes: Element[]) => {
	newNodes.forEach((addedNode) => {
		const attrsList = [...addedNode.attributes];
		const variableAttrs = attrsList.filter((attr) => attr.value.match(/^\[var\d+\]$/));
		variableAttrs.forEach((varAttr) => {
			// pull the value
			const realValue = variablePlaceholders[varAttr.value];
			// update the attribute
			addedNode.setAttribute(varAttr.name, realValue);

			// add an effect to the proxy to update this attr too
			console.log({ realValue });
			realValue['tram-effect'] = () => {
				console.log('updated attr thing to call');
			};
		});
	});
};
