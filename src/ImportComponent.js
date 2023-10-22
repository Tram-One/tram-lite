class ImportComponent {
	/**
	 * utility function for processing a list of component definitions.
	 * @param {string} definitionTemplate
	 */
	static processDefinitionTemplate(definitionTemplate) {
		// container for all our component definitions
		const templateContainer = document.createElement('template');

		templateContainer.innerHTML = definitionTemplate;

		// for each child element, process the new definition (this is similar to processTemplateDefinition)
		const allChildElements = templateContainer.content.children;
		[...allChildElements].forEach((elementToDefine) => {
			ImportComponent.importNewComponent(elementToDefine.outerHTML);
		});
	}

	/**
	 * utility function for importing and defining new components (outside of Tram-Lite being installed)
	 * @param {string} componentTemplate
	 */
	static importNewComponent(componentTemplate) {
		const [componentRawStrings, componentTemplateVariables] =
			ComponentDefinition.extractTemplateVariables(componentTemplate);

		TramLite.define(componentRawStrings, ...componentTemplateVariables);
	}
}
