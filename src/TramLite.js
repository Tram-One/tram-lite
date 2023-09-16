class TramLite {
	/**
	 * helper function to set up a callback for when an element's attribute changes
	 * {@link https://tram-one.io/tram-lite/#addAttributeListener Read the full docs here.}
	 * @param {Element} targetElement - The DOM element to observe.
	 * @param {string[]} attributeNames - The name of the attribute (or list of attributes) to observe for changes.
	 * @param {function(MutationRecord):void} callback - The function to call when the observed attribute changes.
	 *    This function takes one argument: the MutationRecord representing the change.
	 */
	static addAttributeListener(targetElement, attributeNames, callback) {
		const callbackWrapper = (mutationList) => {
			mutationList.forEach((mutation) => {
				// only call the mutation if an attribute changed
				if (mutation.oldValue !== targetElement.getAttribute(mutation.attributeName)) {
					callback(mutation);
				}
			});
		};
		const observer = new MutationObserver(callbackWrapper);
		observer.observe(targetElement, { attributes: true, attributeFilter: attributeNames, attributeOldValue: true });
	}

	/**
	 * helper function to run functions on nodes added to a web-component
	 *   (when an instance of that component is mounted)
	 * @param {string} matcher
	 * @param {{ connect: function }} componentClass
	 */
	static appendShadowRootProcessor(matcher, componentClass) {
		// save the original version of shadowRoot.append
		const shAppend = ShadowRoot.prototype.append;

		ShadowRoot.prototype.append = function (...nodes) {
			shAppend.call(this, ...nodes);
			// if any element in this shadowRoot matches our matcher,
			//   run the `connect` function from this class
			this.querySelectorAll(matcher).forEach((matchingElement) => {
				componentClass.connect(matchingElement);
			});
		};
	}
}
