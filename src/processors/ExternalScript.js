/**
 * ExternalScript is a class that can extend the script element, that allows developers
 * to load external dependencies
 *
 * Special processing is required here, since all tags in Tram-Lite definitions are copied
 * using innerHTML (which disables script tags). We also do special processing to make sure
 * scripts are available for tl-effects.
 */
class ExternalScript {
	/**
	 * connect function for ExternalScript - this loads all the scripts (with src)
	 *   on the component, and saves the results to be used in other component effects
	 * @param {HTMLScriptElement} newNode
	 */
	static connect(newNode) {
		const hostElement = newNode.getRootNode().host;

		if (newNode.hasExecuted !== true) {
			// clone the script tag
			const clonedScript = document.createElement('script');
			[...newNode.attributes].forEach((attr) => clonedScript.setAttribute(attr.name, attr.value));

			// set up load event listener (which will remove the tl-hold for tl-effects)
			clonedScript.addEventListener(
				'load',
				() => {
					clonedScript.hasExecuted = true;

					// check if every other script has loaded
					const externalScripts = hostElement.shadowRoot.querySelectorAll('script[src]');
					const allHaveExecuted = [...externalScripts].every((script) => script.hasExecuted);
					if (allHaveExecuted) {
						// if all scripts have executed, remove any tl-hold waiting on these
						const effects = hostElement.shadowRoot.querySelectorAll('[tl-hold="external-script"]');
						effects.forEach((effect) => {
							effect.removeAttribute('tl-hold');
						});
					}
				},
				{ once: true },
			);

			// replace the original script tag with this new one (which will cause it to trigger)
			newNode.parentNode.replaceChild(clonedScript, newNode);
		}
	}
}

// setup shadow root processor so that tl-effects that are added are processed correctly
TramLite.appendShadowRootProcessor('script[src]', ExternalScript);
