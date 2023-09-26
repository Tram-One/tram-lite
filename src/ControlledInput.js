class ControlledInput {
	/**
	 * connect function for ControlledInput - when this is run on an input (or other similar control),
	 *   we set up a 2-way data binding from the input to the host element.
	 * @param {HTMLInputElement} newNode
	 */
	static connect(newNode) {
		// attributes that control the behavior of the controlled input
		const triggerEventString = newNode.getAttribute('tl-trigger') || 'change';
		const triggerEvents = triggerEventString.split(' ');
		const hostAttributeName = newNode.getAttribute('tl-hostattr') || 'value';
		const targetAttribute = newNode.getAttribute('tl-targetattr') || 'value';

		// set the value of this input based on the host element
		const hostElement = newNode.getRootNode().host;
		newNode[targetAttribute] = hostElement.getAttribute(hostAttributeName);

		// update this input whenever the host attribute updates
		TramLite.addAttributeListener(hostElement, [hostAttributeName], () => {
			newNode[targetAttribute] = hostElement.getAttribute(hostAttributeName);
		});

		// update the root component attribute whenever the value changes for this node updates
		triggerEvents.forEach((triggerEvent) => {
			newNode.addEventListener(triggerEvent, (event) => {
				TramLite.updateRootAttr(hostAttributeName, event, targetAttribute);
			});
		});
	}
}

TramLite.appendShadowRootProcessor('[tl-controlled]', ControlledInput);
