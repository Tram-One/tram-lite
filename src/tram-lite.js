function TramLite() {
	// regex for finding attributes that have been templated in
	const templateVariableRegex = /tl:(.+?):/;

	/**
	 * function to test if node has an attribute value with a template variable
	 * e.g. <custom-element style="color: ${'color'}">
	 */
	const nodeHasTramLiteAttr = (node) =>
		[...node.attributes].some((attr) => attr.value.match(templateVariableRegex))
			? NodeFilter.FILTER_ACCEPT
			: NodeFilter.FILTER_SKIP;

	/**
	 * function to test if node has an TEXT node with a template variable
	 * e.g. <custom-element>Hello ${'name'}</custom-element>
	 */
	const nodeHasTextElementWithTramLiteAttr = (node) =>
		node.textContent.match(templateVariableRegex) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;

	/**
	 * generic function to build a tree walker, and use the filter + tram-lite matcher.
	 * this should return all elements that match the criteria
	 */
	function buildTreeWalkerTramLiteMatcher(root, nodeFilter, nodeMatcher) {
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
	function getElementsWithTramLiteValuesInAttributes(root) {
		return buildTreeWalkerTramLiteMatcher(root, NodeFilter.SHOW_ELEMENT, nodeHasTramLiteAttr);
	}

	// Returns text nodes containing tram-lite template variables.
	function getTextNodesWithTramLiteValues(root) {
		return buildTreeWalkerTramLiteMatcher(root, NodeFilter.SHOW_TEXT, nodeHasTextElementWithTramLiteAttr);
	}

	/**
	 * A template tag function that takes in an HTML template, and
	 * registers it as a new custom element,
	 */
	function define(strings, ...templateVariables) {
		const template = document.createElement('template');

		// tag our templateVariables, so we know how to look for them in the dom
		const taggedTemplateVariables = templateVariables.map((value) => `tl:${value}:`);

		template.innerHTML = String.raw({ raw: strings }, ...taggedTemplateVariables);
		const rootElement = template.content.firstElementChild;

		// any attributes on the root are considered default values
		const defaultAttributeValues = {};
		[...rootElement.attributes].forEach((attrNode) => {
			defaultAttributeValues[attrNode.name] = attrNode.value;
		});

		// traditionally onload is only available for window and document, but we surface
		// them as a special interface for when elements are loaded for the first time
		const onloadFunction = rootElement.getAttribute('onload');

		// Custom element class with tram-lite template support.
		class CustomTramLiteElement extends HTMLElement {
			static get observedAttributes() {
				// all of the template variables are attributes that we'll update on
				return templateVariables;
			}

			constructor() {
				super();

				// keep track if our component onload function has been called
				this.hasloaded = false;

				// list of attribute and text nodes that have a template value
				// these are scanned through when templated attributes are updated
				this.templateValuesAttrNodes = [];
				this.templateValuesTextNodes = [];

				// Create a shadow root
				// and append our HTML to it
				const shadow = this.attachShadow({ mode: 'open' });
				shadow.append(...rootElement.cloneNode(true).childNodes);

				// scan for any text nodes that have tram-lite wrapped variables (e.g. "tl:label:"),
				// these are nodes that need to be replaced on the attribute being changed
				const templateTextNodes = getTextNodesWithTramLiteValues(shadow);
				// save the original template in templateValuesTextNodes
				templateTextNodes.forEach((textNode) => {
					this.templateValuesTextNodes.push({ textNode, originalTemplate: textNode.textContent });
				});

				// scan for any elements with attributes that have a tram-lite variable
				// these are attributes that need to be updated on the attribute being changed
				const templateAttrElements = getElementsWithTramLiteValuesInAttributes(shadow);
				// save the original attribute in the templateValuesAttributes
				templateAttrElements.forEach((element) => {
					[...element.attributes].forEach((attrNode) => {
						if (attrNode.value.match(/tl:(.+?):/)) {
							this.templateValuesAttrNodes.push({ attrNode, element, originalTemplate: attrNode.value });
						}
					});
				});
			}

			connectedCallback() {
				// set all attribute values
				// - the first default value is whatever is set on DOM creation
				// - next, we check if there are default values that were part of the define
				// - lastly, we'll set it to an empty string.
				templateVariables.forEach((attributeName) => {
					if (this.getAttribute(attributeName) === null) {
						this.setAttribute(attributeName, defaultAttributeValues[attributeName] || '');
					}
				});

				// an initial call to set the default attributes
				this.attributeChangedCallback();

				// if we haven't called onload, call it now
				if (!this.hasloaded) {
					this.hasloaded = true;
					eval(onloadFunction);
				}
			}

			attributeChangedCallback(name, oldValue, newValue) {
				// scan through all text nodes and attributes with template values, and update them
				this.updateTextNodeTemplates();
				this.updateAttrNodeTemplates();
			}

			updateTextNodeTemplates() {
				// go through each text node that has a template variable, and update them
				this.templateValuesTextNodes.forEach(({ textNode, originalTemplate }) => {
					let updatedTemplate = originalTemplate;
					// we'll need to go through all the attributes, in case this template has other attributes
					[...this.attributes].forEach((attribute) => {
						updatedTemplate = updatedTemplate.replace(`tl:${attribute.name}:`, this.getAttribute(attribute.name));
					});
					textNode.textContent = updatedTemplate;
				});
			}

			updateAttrNodeTemplates() {
				// go through each element with an attribute that has a template variable, and update thos attribute values
				this.templateValuesAttrNodes.forEach(({ attrNode, element, originalTemplate }) => {
					let updatedTemplate = originalTemplate;
					// we'll need to go through all the attributes, in case this template has other attributes
					[...this.attributes].forEach((attribute) => {
						updatedTemplate = updatedTemplate.replace(`tl:${attribute.name}:`, this.getAttribute(attribute.name));
					});

					// set the attribute value to the new value (updated with all template variables)
					attrNode.value = updatedTemplate;

					// these attributes are special, in order to update the live value (after a user has interacted with them),
					// they need to be set on the element as well
					if (['value', 'checked', 'selected'].includes(attrNode.name)) {
						element[attrNode.name] = updatedTemplate;
					}
				});
			}
		}

		// register this as a new element as a native web-component
		customElements.define(rootElement.tagName.toLowerCase(), CustomTramLiteElement);
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

	// expose the html and define functions
	// all other functions are internal, and not meant to be exposed
	return { html, define };
}

const { html, define } = TramLite();
