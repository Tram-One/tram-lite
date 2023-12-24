/**
 * TBA
 *
 * {@link https://tram-one.io/tram-lite/#tl-context}
 */
class ContextConsumer {
	/**
	 * TBA
	 * @param {HTMLElement} newNode
	 */
	static connect(newNode) {
		// attributes that control the behavior of the context consumer
		// tl-name determines the provider we should look up
		const contextName = newNode.getAttribute('tl-name');
		// tl-attrmap is a mapping of the provider's attributes to this one
		// (by default, this will be a mapping of all the attributes in the provider as the same name)
		const attributeMapString = newNode.getAttribute('tl-attrmap');

		const hostElement = newNode.getRootNode().host;

		// search up the tree for a context provider
		// we do this by attaching an event listener to the top-level html element,
		//   emitting an event from our host element, and then checking the composed path
		//   for the first provider that matches our tl-name
		function handleContextSearch(event) {
			// composedPath will be a list of elements, starting with this one, and going up to the window
			const composedPath = event.composedPath();
			const providerElement = composedPath.find(
				(element) => element.matches && element.matches(`tl-provider[tl-name="${contextName}"]`),
			);

			// if we can't find a provider, bail
			if (providerElement === undefined) {
				return;
			}

			// build a default attribute map based on all the attributes on the provider
			const defaultAttributeMap = [...providerElement.attributes]
				.filter((attr) => !attr.name.match(/tl-/)) // filter out tl- attributes
				.map((attr) => `${attr.name}:${attr.name}`)
				.join(' ');

			const attributeMaps = (attributeMapString || defaultAttributeMap).split(' ');

			attributeMaps.forEach((attributeMap) => {
				const [providerAttrName, hostAttrName] = attributeMap.split(':');

				// note the type of the attribute we are tracking
				// (if it is a boolean, we'll just check if this has an attribute)
				const attributeType = typeof providerElement[providerAttrName];
				const isBooleanAttr = attributeType === 'boolean';

				// set the value of the host based on the provider
				hostElement.setAttribute(
					hostAttrName,
					isBooleanAttr
						? providerElement.hasAttribute(providerAttrName)
						: providerElement.getAttribute(providerAttrName),
				);

				// update the host whenever the provider attribute updates
				TramLite.addAttributeListener(providerElement, [providerAttrName], () => {
					hostElement.setAttribute(
						hostAttrName,
						isBooleanAttr
							? providerElement.hasAttribute(providerAttrName)
							: providerElement.getAttribute(providerAttrName),
					);
				});

				// update the provider whenever the host attribute updates
				TramLite.addAttributeListener(hostElement, [hostAttrName], () => {
					providerElement.setAttribute(
						providerAttrName,
						isBooleanAttr ? hostElement.hasAttribute(hostAttrName) : hostElement.getAttribute(hostAttrName),
					);
				});
			});
		}

		// set up the event listener on the top-most context - set it to only trigger once
		window.addEventListener('context-search', handleContextSearch, { once: true });

		// dispatch the event from this host all the way up
		const searchEvent = new CustomEvent('context-search', {
			bubbles: true,
			composed: true,
		});
		hostElement.dispatchEvent(searchEvent);
	}
}

// setup shadow root processor so that tl-context that are added are processed correctly
TramLite.appendShadowRootProcessor('tl-context', ContextConsumer);
