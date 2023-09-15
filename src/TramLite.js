/**
 * helper function to setup mutation observers that watch for tram-lite specific attributes, and
 * upgrades those components to have the new behavior.
 * @param {string} matcher
 * @param {{ connect: function, disconnect?: function }} componentClass
 */
function TLupgradeNewNodes(matcher, componentClass) {
	/**
	 * @param {MutationRecord[]} mutationRecords
	 */
	const upgradeNewNodes = (mutationRecords) => {
		mutationRecords.forEach((mutationRecord) => {
			// check if any new nodes that were added match, and then call connect
			mutationRecord.addedNodes.forEach((newNode) => {
				if (newNode.matches?.(matcher)) {
					console.log('connect', newNode);
					componentClass.connect(newNode);
				}

				if (newNode.shadowRoot) {
					newNode.shadowRoot.querySelectorAll(matcher).forEach((childNode) => {
						console.log('connect', childNode);
						componentClass.connect(childNode);
					});
				}
			});

			// check if any nodes that were removed match, and then call disconnect (if we have one)
			if (componentClass.disconnect) {
				mutationRecord.removedNodes.forEach((removedNode) => {
					if (removedNode.matches?.(matcher)) {
						console.log('disconnect', removedNode);
						componentClass.disconnect(removedNode);
					}

					if (removedNode.shadowRoot) {
						removedNode.shadowRoot.querySelectorAll(matcher).forEach((childNode) => {
							console.log('disconnect', childNode);
							componentClass.disconnect(childNode);
						});
					}
				});
			}
		});
	};

	const observer = new MutationObserver(upgradeNewNodes);
	observer.observe(document, { subtree: true, childList: true });
}

class TramLite {
	/**
	 *
	 * @param {string} matcher
	 * @param {{ connect: function, disconnect?: function }} componentClass
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
}
