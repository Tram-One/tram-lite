/**
 * ComponentEffect is a custom element that extends the script element, that allows developers
 * to build side-effects for web-components.
 *
 * {@link https://tram-one.io/tram-lite/#component-effect}
 */
class ComponentEffect extends HTMLScriptElement {
	/**
	 * function to trigger the javascript in a script tag.
	 * This does not handle the src attribute, only inline javascript.
	 * The `this` keyword will reference the host parent node of this script tag.
	 * @param {HTMLScriptElement} scriptTag
	 */
	static processScriptTag(scriptTag) {
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

	constructor() {
		super();

		// keep track if we've executed this task initially
		this.hasInitiallyExecuted = false;
	}

	connectedCallback() {
		const hostElement = this.getRootNode().host;

		// if we haven't done an initial execution of this script, do so now
		if (this.hasInitiallyExecuted === false) {
			ComponentEffect.processScriptTag(this);
			this.hasInitiallyExecuted = true;
		}

		// if we have any dependencies, add a listener to trigger them
		const dependencyString = this.getAttribute('dependencies') || '';
		const dependencies = dependencyString.split(' ');
		TramLite.addAttributeListener(hostElement, dependencies, () => {
			ComponentEffect.processScriptTag(this);
		});
	}

	disconnectedCallback() {}
}

// associate this class as a custom built-in for the template tag
// e.g. it can be created with a <script is="component-effect"> tag in HTML
customElements.define('component-effect', ComponentEffect, { extends: 'script' });

try {
	// try to generate an instance of the class, if this fails, that means that
	// custom built-ins are not supported, so we'll need to use a mutation observer
	// (most likely because we are on a WebKit browser)
	new ComponentEffect();
} catch (error) {
	const processNewNodes = (mutationRecords) => {
		mutationRecords.forEach((mutationRecord) => {
			mutationRecord.addedNodes.forEach((newNode) => {
				if (newNode.matches?.('script[is=component-effect]')) {
					ComponentEffect.processScriptTag(newNode);
				}
			});
		});
	};

	const observer = new MutationObserver(processNewNodes);
	observer.observe(document, { subtree: true, childList: true });
}
