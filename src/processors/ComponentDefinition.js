/**
 * ComponentDefinition is a custom element that extends the template element, that allows developers
 * to build new web-components, using Tram-Lite, all in their HTML templates!
 *
 * {@link https://tram-one.io/tram-lite/#tl-definition}
 */
class ComponentDefinition {
	// regex for finding attributes that have been templated in
	static templateVariableRegex = /tl:(.+?):/;

	/**
	 * function to test if node has an attribute value with a template variable
	 * e.g. <custom-element style="color: ${'color'}">
	 */
	static nodeHasTramLiteAttr = (node) =>
		[...node.attributes].some((attr) => attr.value.match(ComponentDefinition.templateVariableRegex))
			? NodeFilter.FILTER_ACCEPT
			: NodeFilter.FILTER_SKIP;

	/**
	 * function to test if node has an TEXT node with a template variable
	 * e.g. <custom-element>Hello ${'name'}</custom-element>
	 */
	static nodeHasTextElementWithTramLiteAttr = (node) =>
		node.textContent.match(ComponentDefinition.templateVariableRegex)
			? NodeFilter.FILTER_ACCEPT
			: NodeFilter.FILTER_REJECT;

	/**
	 * generic function to build a tree walker, and use the filter + tram-lite matcher.
	 * this should return all elements that match the criteria
	 */
	static buildTreeWalkerTramLiteMatcher(root, nodeFilter, nodeMatcher) {
		const result = [];
		// build a tree walker that goes through each element, and each attribute
		const treeWalker = document.createTreeWalker(root, nodeFilter, {
			acceptNode: nodeMatcher,
		});

		let currentNode;
		while ((currentNode = treeWalker.nextNode())) {
			result.push(currentNode);
		}

		return result;
	}

	// Returns elements with attributes containing tram-lite template variables.
	static getElementsWithTramLiteValuesInAttributes(root) {
		return ComponentDefinition.buildTreeWalkerTramLiteMatcher(
			root,
			NodeFilter.SHOW_ELEMENT,
			ComponentDefinition.nodeHasTramLiteAttr,
		);
	}

	// Returns text nodes containing tram-lite template variables.
	static getTextNodesWithTramLiteValues(root) {
		return ComponentDefinition.buildTreeWalkerTramLiteMatcher(
			root,
			NodeFilter.SHOW_TEXT,
			ComponentDefinition.nodeHasTextElementWithTramLiteAttr,
		);
	}

	/**
	 * static function to process template tags and define components
	 * @param {HTMLTemplateElement} templateTag
	 */
	static processTemplateDefinition(templateTag) {
		// get all child elements (in case more than one was defined in this tag)
		const allChildElements = templateTag.content.children;
		[...allChildElements].forEach((elementToDefine) => {
			const definitionString = elementToDefine.outerHTML;

			// we expect template variables to be in the following pattern, matching "${'...'}"
			const variablePattern = /\$\{\'(.*?)\'\}/;
			// Split the string by the above pattern, which lets us get an alternating list of strings and variables
			const parts = definitionString.split(variablePattern);

			// Extract the strings and the variables
			const rawStrings = parts.filter((_, index) => index % 2 === 0);
			const templateVaraibles = parts.filter((_, index) => index % 2 !== 0);

			TramLite.define(rawStrings, ...templateVaraibles);
		});
	}

	/**
	 * utility function to extract js template strings, so that they can be passed into a template tag function
	 */
	static extractTemplateVariables(templateString) {
		// we expect template variables to be in the following pattern, matching "${'...'}"
		const variablePattern = /\$\{\'(.*?)\'\}/;
		// Split the string by the above pattern, which lets us get an alternating list of strings and variables
		const parts = templateString.split(variablePattern);

		// Extract the strings and the variables
		const rawStrings = parts.filter((_, index) => index % 2 === 0);
		const templateVaraibles = parts.filter((_, index) => index % 2 !== 0);

		return [rawStrings, templateVaraibles];
	}

	/**
	 * function to set up an observer to watch for when new templates are added,
	 *   and process all the definitions in them
	 * @param {Document} [targetRoot=document]
	 */
	static setupMutationObserverForTemplates(targetRoot = document) {
		/**
		 * @param {MutationRecord[]} mutationRecords
		 */
		const upgradeNewNodes = (mutationRecords) => {
			mutationRecords.forEach((mutationRecord) => {
				mutationRecord.addedNodes.forEach((newNode) => {
					// check if the previous element is a definition template
					// we wait until we are in the next element (most likely a #text node)
					// because that will confirm that the element has been completely parsed
					if (newNode.previousSibling?.matches?.('[tl-definition]')) {
						ComponentDefinition.processTemplateDefinition(newNode.previousSibling);
					}
				});
			});
		};

		const observer = new MutationObserver(upgradeNewNodes);
		observer.observe(document, { subtree: true, childList: true });
	}
}

if (MODULE === true) {
	// if module is available, export this class
	if (typeof module !== 'undefined') {
		module.exports.ComponentDefinition = ComponentDefinition;
	}
}
if (INSTALL === true) {
	// setup mutation observer so that template elements created will automatically be defined
	ComponentDefinition.setupMutationObserverForTemplates();
}
