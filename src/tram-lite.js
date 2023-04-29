function TramLite() {
	// regex for finding attributes that have been templated in
	const tramLiteAttrRegex = /tl:(.+?):/;

	/**
	 * function to test if node has an attribute value with a template variable
	 * e.g. <custom-element style="color: ${'color'}">
	 */
	const nodeHasTramLiteAttr = (node) => {
		for (const attr of node.attributes) {
			// if the attribute matches the tram-lite variable pattern, return it
			// - templated variables will look like "tl:color:"
			if (attr.value.match(tramLiteAttrRegex)) {
				return NodeFilter.FILTER_ACCEPT;
			}
		}
		return NodeFilter.FILTER_REJECT;
	};

	/**
	 * function to test if node has an TEXT node with a template variable
	 * e.g. <custom-element>Hello ${'name'}</custom-element>
	 */
	const nodeHasTextElementWithTramLiteAttr = (node) => {
		return node.textContent.match(tramLiteAttrRegex) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
	};

	/**
	 * generic function to build a tree walker, and use the filter + tram-lite matcher.
	 * this should return all elements that match the criteria
	 */
	function builtTreeWalkerTramLiteMatcher(root, nodeFilter, nodeMatcher) {
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

	/**
	 * Function to search through the dom and find attributes that
	 * have a tram-lite variable.
	 */
	function getElementsWithTramLiteValuesInAttributes(root) {
		return builtTreeWalkerTramLiteMatcher(root, NodeFilter.SHOW_ELEMENT, nodeHasTramLiteAttr);
	}

	/**
	 * Function to search through the dom and find text nodes that
	 * have a tram-lite variable.
	 */
	function getTextNodesWithTramLiteValues(root) {
		return builtTreeWalkerTramLiteMatcher(root, NodeFilter.SHOW_TEXT, nodeHasTextElementWithTramLiteAttr);
	}

	/**
	 * A template tag function that takes in an HTML template, and
	 * registers it as a new custom element,
	 */
	function define(strings, ...values) {
		const template = document.createElement('template');

		// tag our values, so we know how to look for them in the dom
		const taggedValues = values.map((value) => `tl:${value}:`);

		template.innerHTML = String.raw({ raw: strings }, ...taggedValues);
		const element = template.content.firstElementChild;

		class CustomTramLiteElement extends HTMLElement {
			static get observedAttributes() {
				// e.g. <foo-label>${'label'} ...
				return values;
			}

			attributeChangedCallback(name, oldValue, newValue) {
				// scan through all text nodes with tagged values
				this.updateTextNodeTemplates();
				this.updateAttrNodeTemplates();
			}

			updateTextNodeTemplates() {
				this.taggedValuesTextNodes.forEach(({ textNode, originalTemplate }) => {
					let updatedTemplate = originalTemplate;
					// we'll need to go through all the attributes, in case this template has other attributes
					[...this.attributes].forEach((attribute) => {
						updatedTemplate = updatedTemplate.replace(`tl:${attribute.name}:`, this.getAttribute(attribute.name));
					});
					textNode.textContent = updatedTemplate;
				});
			}

			updateAttrNodeTemplates() {
				this.taggedValuesAttrNodes.forEach(({ attrNode, originalTemplate }) => {
					let updatedTemplate = originalTemplate;
					// we'll need to go through all the attributes, in case this template has other attributes
					[...this.attributes].forEach((attribute) => {
						updatedTemplate = updatedTemplate.replace(`tl:${attribute.name}:`, this.getAttribute(attribute.name));
					});
					attrNode.value = updatedTemplate;
				});
			}

			constructor() {
				super();

				// default all values to be blank (if they are undefined)
				values.forEach((attributeName) => {
					if (this.getAttribute(attributeName) === null) {
						this.setAttribute(attributeName, '');
					}
				});

				// Create a shadow root
				// and append our HTML to it
				const shadow = this.attachShadow({ mode: 'open' });
				// TODO: it's not totally clear if this needs to be cloned
				shadow.append(...element.cloneNode(true).childNodes);

				// list of text nodes that have a tagged value
				// we go through all of these when an attribute is updated
				this.taggedValuesTextNodes = [];

				// scan for any text nodes that have tram-lite wrapped variables (e.g. "tl:label:"),
				// these are nodes that need to be replaced on the attribute being changed
				const taggedTextNodes = getTextNodesWithTramLiteValues(shadow);
				// save the original template in taggedValuesTextNodes
				taggedTextNodes.forEach((textNode) => {
					this.taggedValuesTextNodes.push({ textNode, originalTemplate: textNode.textContent });
				});

				// list of attribute nodes that have a tagged value
				this.taggedValuesAttrNodes = [];

				// scan for any elements with attributes that have a tram-lite variable
				// these are attributes that need to be updated on the attribute being changed
				const taggedAttrElements = getElementsWithTramLiteValuesInAttributes(shadow);
				// save the original attribute in the taggedValuesAttributes
				taggedAttrElements.forEach((element) => {
					[...element.attributes].forEach((attrNode) => {
						if (attrNode.value.match(/tl:(.+?):/)) {
							this.taggedValuesAttrNodes.push({ attrNode, originalTemplate: attrNode.value });
						}
					});
				});

				// an initial call to set the default attributes
				this.attributeChangedCallback();
			}
		}

		customElements.define(element.tagName.toLowerCase(), CustomTramLiteElement);
	}

	/**
	 * template tag function to create document elements using simple DOM
	 */
	function html(strings, ...values) {
		const template = document.createElement('template');
		template.innerHTML = String.raw({ raw: strings }, ...values);
		const element = template.content.firstElementChild;
		return element;
	}

	return { html, define };
}

const { html, define } = TramLite();
