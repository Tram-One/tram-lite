/**
 * AttrBroadcaster is a class that extends the tl-broadcast custom element, which allows developers
 * to emit events when a component's dependencies update.
 *
 * {@link https://tram-one.io/tram-lite/#tl-broadcast}
 */
class AttrBroadcaster {
	/**
	 * connect function for AttrBroadcaster - when this is attached to an element, we
	 *   set up a listener to for its attributes and send them up or down the DOM
	 * @param {HTMLElement} newNode
	 */
	static connect(newNode) {
		// attributes that control the behavior of the attr emitter
		const attributeString = newNode.getAttribute('tl-dependencies');
		const attributes = attributeString.split(' ');
		const eventName = newNode.getAttribute('tl-eventname');
		const eventDirectionString = newNode.getAttribute('tl-direction') || 'up';
		const eventDirections = eventDirectionString.split(' ');

		const hostElement = newNode.getRootNode().host;

		// emit an event whenever these attributes change
		TramLite.addAttributeListener(hostElement, attributes, () => {
			// add a new attribute listener for each event direction
			eventDirections.forEach((eventDirection) => {
				TramLite.broadcastEvent(hostElement, eventName, eventDirection);
			});
		});
	}
}

// setup shadow root processor so that tl-broadcast that are added are processed correctly
TramLite.appendShadowRootProcessor('tl-broadcast', AttrBroadcaster);
