/**
 * TBA
 *
 * {@link https://tram-one.io/tram-lite/#tl-emitter}
 */
class AttrEmitter {
	/**
	 * connect function for AttrEmitter - when this is attached to an element, we
	 *   set up a listener to for its attributes and send them up or down the DOM
	 * @param {HTMLElement} newNode
	 */
	static connect(newNode) {
		// attributes that control the behavior of the attr emitter
		const attributeString = newNode.getAttribute('tl-dependencies');
		const attributes = attributeString.split(' ');
		const eventName = newNode.getAttribute('tl-eventname');
		const eventDirection = newNode.getAttribute('tl-eventdirection') || 'up';

		const hostElement = newNode.getRootNode().host;

		// emit an event whenever thes attributes change
		TramLite.addAttributeListener(hostElement, attributes, () => {
			const eventDetails = { originalElement: hostElement };
			if (eventDirection === 'up') {
				const customEvent = new CustomEvent(eventName, {
					bubbles: true,
					composed: true,
					detail: eventDetails,
				});
				hostElement.dispatchEvent(customEvent);
			}
			if (eventDirection === 'down') {
				// if we are dispatching an event to child elements, query all child elements,
				//   and dispatch on each one individually
				const customEvent = new CustomEvent(eventName, {
					bubbles: false,
					composed: false,
					detail: eventDetails,
				});
				const allChildElements = hostElement.shadowRoot.querySelectorAll('*');
				allChildElements.forEach((child) => child.dispatchEvent(customEvent));
			}
		});
	}
}

// setup shadow root processor so that tl-emitter that are added are processed correctly
TramLite.appendShadowRootProcessor('[tl-emitter]', AttrEmitter, TramLite.ComponentInterface);
