class TramLite {
	/**
	 * a helper function to set up a callback for when an element's attribute changes
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
	 *
	 * @param {string} matcher
	 * @param {{ connect: function }} componentClass
	 */
	static appendShadowRootProcessor(matcher, componentClass) {
		const shAppend = ShadowRoot.prototype.append;

		ShadowRoot.prototype.append = function (...nodes) {
			shAppend.call(this, ...nodes);
			this.querySelectorAll(matcher).forEach((matchingElement) => {
				componentClass.connect(matchingElement);
			});
		};
	}

	/**
	 * helper function to setup mutation observers that watch for tram-lite specific attributes, and
	 * upgrades those components to have the new behavior.
	 * @param {string} matcher
	 * @param {{ connect: function, disconnect?: function }} componentClass
	 */
	static setupMutationObserverForConnecting(matcher, componentClass) {
		/**
		 * @param {MutationRecord[]} mutationRecords
		 */
		const upgradeNewNodes = (mutationRecords) => {
			mutationRecords.forEach((mutationRecord) => {
				// check if any new nodes that were added match, and then call connect
				mutationRecord.addedNodes.forEach((newNode) => {
					if (newNode.matches?.(matcher)) {
						componentClass.connect(newNode);
					}
				});

				// check if any nodes that were removed match, and then call disconnect (if we have one)
				if (componentClass.disconnect) {
					mutationRecord.removedNodes.forEach((removedNode) => {
						if (removedNode.matches?.(matcher)) {
							console.log('disconnect', removedNode);
							componentClass.disconnect(removedNode);
						}
					});
				}
			});
		};

		const observer = new MutationObserver(upgradeNewNodes);
		observer.observe(document, { subtree: true, childList: true });
	}
}
