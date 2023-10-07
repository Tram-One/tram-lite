class ImportComponent {
	/**
	 * utility function for importing and defining new components (outside of Tram-Lite being installed)
	 * @param {string} componentContent
	 */
	static importNewComponent(componentContent) {
		const [componentRawStrings, componentTemplateVariables] =
			ComponentDefinition.extractTemplateVariables(componentContent);

		// make a component class based on the template tag pieces
		// (this is done, over define, so we can attach shadow root processors)
		const componentClass = TramLite.makeComponentClass(componentRawStrings, ...componentTemplateVariables);

		// override attachShadow so that we can add shadowRootProcessors
		const attachShadow = componentClass.prototype.attachShadow;
		componentClass.prototype.attachShadow = function (...options) {
			const shadowRoot = attachShadow.call(this, ...options);
			TramLite.appendShadowRootProcessor('[tl-controlled]', ControlledInput, shadowRoot);
			TramLite.appendShadowRootProcessor('[tl-effect]', ComponentEffect, shadowRoot);

			return shadowRoot;
		};

		// define the component in the DOM
		customElements.define(componentClass.tagName, componentClass);
	}
}
