/**
 * ComponentEffect is a custom element that extends the script element, that allows developers
 * to build side-effects for web-components.
 *
 * {@link https://tram-one.io/tram-lite/#component-effect}
 */
class ComponentEffect {
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
	 * function to trigger the javascript in a script tag.
	 * This does not handle the src attribute, only inline javascript.
	 * The `this` keyword will reference the host parent node of this script tag.
	 * @param {HTMLScriptElement} scriptTag
	 */
	static processScriptTag(scriptTag) {
		// don't do this if we have a hold on the script tag
		if (scriptTag.hasAttribute('tl-hold')) {
			return;
		}

		const hostElement = scriptTag.getRootNode().host;

		// provide a scoped evaluation of the script tags in this element
		const scopedEval = (script) => {
			return Function('document', 'window', script).bind(hostElement)(hostElement.shadowRoot, window);
		};

		scopedEval(scriptTag.innerHTML);
	}

	/**
	 *
	 * @param {HTMLElement} hostComponent
	 */
	static processAllScriptTags(hostComponent) {}

	/**
	 *
	 * @param {HTMLScriptElement} newNode
	 */
	static connect(newNode) {
		const hostElement = newNode.getRootNode().host;

		// run an initial run of the script
		// (this won't happen if there is a tl-hold on the script)
		ComponentEffect.processScriptTag(newNode);

		// if we have any dependencies, add a listener to trigger them
		if (newNode.hasAttribute('tl-dependencies') && newNode.hasSetupListener !== true) {
			const dependencyString = newNode.getAttribute('tl-dependencies');
			const dependencies = dependencyString.split(' ');

			ComponentEffect.addAttributeListener(hostElement, dependencies, () => {
				// check if the inline script is being held
				ComponentEffect.processScriptTag(newNode);
			});
			newNode.hasSetupListener = true;
		}

		// if we ever set (or remove) the hold on this, trigger the inline script
		// (this allows developers to delay triggering inline scripts)
		ComponentEffect.addAttributeListener(newNode, ['tl-hold'], () => {
			console.log('hold removed');
			ComponentEffect.processScriptTag(newNode);
		});
	}
}

TramLite.appendShadowRootProcessor('[tl-effect]', ComponentEffect);
