/**
 * ControlledInput is a class that can extend the input or script element, that allows developers
 * to build 2-way data-binding for web-components.
 *
 * {@link https://tram-one.io/tram-lite/#tl-controlled}
 */
class ControlledInput {
	/**
	 * connect function for ControlledInput - when this is run on an input (or other similar control),
	 *   we set up a 2-way data binding from the input to the host element.
	 * @param {HTMLElement} newNode
	 */
	static connect(newNode) {
		// attributes that control the behavior of the controlled input
		const triggerEventString = newNode.getAttribute('tl-trigger') || 'change';
		const triggerEvents = triggerEventString.split(' ');
		const attributeMapString = newNode.getAttribute('tl-attrmap') || 'value:value';
		const attributeMaps = attributeMapString.split(' ');

		attributeMaps.forEach((attributeMap) => {
			const [hostAttrName, targetAttrName] = attributeMap.split(':');

			// note the type of the attribute we are tracking
			// (if it is a boolean, we'll just check if this has an attribute)
			const attributeType = typeof newNode[targetAttrName];
			const isBooleanAttr = attributeType === 'boolean';

			// set the value of this input based on the host element
			const hostElement = newNode.getRootNode().host;
			newNode[targetAttrName] = isBooleanAttr
				? hostElement.hasAttribute(hostAttrName)
				: hostElement.getAttribute(hostAttrName);

			// update this input whenever the host attribute updates
			TramLite.addAttributeListener(hostElement, [hostAttrName], () => {
				newNode[targetAttrName] = isBooleanAttr
					? hostElement.hasAttribute(hostAttrName)
					: hostElement.getAttribute(hostAttrName);
			});

			// update the root component attribute whenever the value changes for this node updates
			triggerEvents.forEach((triggerEvent) => {
				newNode.addEventListener(triggerEvent, (event) => {
					const rootNodeHost = event.target.getRootNode().host;
					const targetValue = event.target[targetAttrName];
					if (targetValue) {
						rootNodeHost.setAttribute(hostAttrName, isBooleanAttr ? '' : event.target[targetAttrName]);
					} else {
						rootNodeHost.removeAttribute(hostAttrName);
					}
				});
			});
		});
	}
}

// setup shadow root processor so that tl-controlled that are added are processed correctly
TramLite.appendShadowRootProcessor('[tl-controlled]', ControlledInput, TramLite.ComponentInterface);
