/**
 * TBA
 *
 * {@link https://tram-one.io/tram-lite/#tl-emit}
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
		const eventDirection = newNode.getAttribute('tl-direction') || 'up';

		const hostElement = newNode.getRootNode().host;

		// emit an event whenever thes attributes change
		TramLite.addAttributeListener(hostElement, attributes, () => {
			TramLite.dispatchEvent(hostElement, hostElement, eventName, eventDirection);
		});
	}
}

// setup shadow root processor so that tl-emit that are added are processed correctly
TramLite.appendShadowRootProcessor('[tl-emit]', AttrEmitter, TramLite.ComponentInterface);
