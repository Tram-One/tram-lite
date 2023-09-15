class ControlledInput {
	/**
	 * a helper function to update the root web-component when an input updates
	 * {@link https://tram-one.io/tram-lite/#updateRootAttr Read the full docs here.}
	 * @param {string} attributeName
	 * @param {Event} event
	 * @param {string} [targetAttribute="value"]
	 */
	static updateRootAttr(attributeName, event, targetAttribute = 'value') {
		const rootNodeHost = event.target.getRootNode().host;
		const targetValue = event.target[targetAttribute];
		if (targetValue) {
			rootNodeHost.setAttribute(attributeName, event.target[targetAttribute]);
		} else {
			rootNodeHost.removeAttribute(attributeName);
		}
	}

	/**
	 *
	 * @param {HTMLInputElement} newNode
	 */
	static connect(newNode) {
		// attributes that control the behavior of the controlled input
		const hostAttributeName = newNode.getAttribute('tl-hostattr') || 'value';
		const triggerEvent = newNode.getAttribute('tl-trigger') || 'change';
		const targetAttribute = newNode.getAttribute('tl-inputattr') || 'value';

		// set the value of this input based on the host element
		const hostElement = newNode.getRootNode().host;
		newNode[targetAttribute] = hostElement.getAttribute(hostAttributeName);

		// update this input whenever the host attribute updates
		TramLite.addAttributeListener(hostElement, [hostAttributeName], () => {
			newNode[targetAttribute] = hostElement.getAttribute(hostAttributeName);
		});

		// update the root component attribute whenever the value changes for this node updates
		newNode.addEventListener(triggerEvent, (event) => {
			ControlledInput.updateRootAttr(hostAttributeName, event, targetAttribute);
		});
	}
}

TramLite.appendShadowRootProcessor('[tl-controlled]', ControlledInput);
