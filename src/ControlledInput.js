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
		// const hostElement = newNode.getRootNode().host;

		const hostAttributeName = newNode.getAttribute('tl-hostattr');
		const triggerEvent = newNode.getAttribute('tl-trigger') || 'change';
		const targetAttribute = newNode.getAttribute('tl-inputattr') || 'value';

		ControlledInput.updateRootAttr(hostAttributeName, { target: newNode }, targetAttribute);

		newNode.addEventListener(triggerEvent, (event) => {
			ControlledInput.updateRootAttr(hostAttributeName, event, targetAttribute);
		});
	}
}

TramLite.appendShadowRootProcessor('[tl-controlled]', ControlledInput);
