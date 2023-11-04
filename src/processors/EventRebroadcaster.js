/**
 * EventRebroadcaster is a class that extends other elements with the tl-rebroadcast attribute,
 *  which allows developers to emit events when another event happens
 *
 * {@link https://tram-one.io/tram-lite/#tl-rebroadcast}
 */
class EventRebroadcaster {
	/**
	 * connect function for EventRebroadcaster - when this is attached to an element, we
	 *   set up a listener to for events and rebroadcast them up or down the DOM
	 * @param {HTMLElement} newNode
	 */
	static connect(newNode) {
		// attributes that control the behavior of the event rebroadcaster
		const eventMapString = newNode.getAttribute('tl-eventmap') || 'change:change';
		const eventMaps = eventMapString.split(' ');
		const eventDirectionString = newNode.getAttribute('tl-direction') || 'up';
		const eventDirections = eventDirectionString.split(' ');

		const hostElement = newNode.getRootNode().host;

		eventMaps.forEach((eventMap) => {
			const [targetEventName, hostEventName] = eventMap.split(':');

			newNode.addEventListener(targetEventName, () => {
				eventDirections.forEach((eventDirection) => {
					TramLite.broadcastEvent(hostElement, hostEventName, eventDirection);
				});
			});
		});
	}
}

// setup shadow root processor so that tl-rebroadcast that are added are processed correctly
TramLite.appendShadowRootProcessor('[tl-rebroadcast]', EventRebroadcaster, TramLite.ComponentInterface);
