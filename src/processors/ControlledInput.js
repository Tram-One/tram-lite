/**
 * ControlledInput is a class that can extend the input or script element, that allows developers
 * to build 2-way data-binding for web-components.
 *
 * {@link https://tram-one.io/tram-lite/#tl-effect}
 */
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

		// note the type of the attribute we are tracking
		// (if it is a boolean, we'll just check if this has an attribute)
		const attributeType = typeof newNode[targetAttribute];
		const isBooleanAttr = attributeType === 'boolean';

		// set the value of this input based on the host element
		const hostElement = newNode.getRootNode().host;
		newNode[targetAttribute] = isBooleanAttr
			? hostElement.hasAttribute(hostAttributeName)
			: hostElement.getAttribute(hostAttributeName);

		// update this input whenever the host attribute updates
		TramLite.addAttributeListener(hostElement, [hostAttributeName], () => {
			newNode[targetAttribute] = isBooleanAttr
				? hostElement.hasAttribute(hostAttributeName)
				: hostElement.getAttribute(hostAttributeName);
		});

		// update the root component attribute whenever the value changes for this node updates
		triggerEvents.forEach((triggerEvent) => {
			newNode.addEventListener(triggerEvent, (event) => {
				const rootNodeHost = event.target.getRootNode().host;
				const targetValue = event.target[targetAttribute];
				if (targetValue) {
					rootNodeHost.setAttribute(hostAttributeName, isBooleanAttr ? '' : event.target[targetAttribute]);
				} else {
					rootNodeHost.removeAttribute(hostAttributeName);
				}
			});
		});
	}
}

if (MODULE === true) {
	// if module is available, export this class
	if (typeof module !== 'undefined') {
		module.exports.ControlledInput = ControlledInput;
	}
}
if (INSTALL === true) {
	// setup shadow root processor so that tl-controlled that are added are processed correctly
	TramLite.appendShadowRootProcessor('[tl-controlled]', ControlledInput);
}
