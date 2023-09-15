/**
 * ComponentDefinition is a custom element that extends the template element, that allows developers
 * to build new web-components, using Tram-Lite, all in their HTML templates!
 *
 * {@link https://tram-one.io/tram-lite/#component-definition}
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
	 * a template tag function used to create new web-components.
	 * {@link https://tram-one.io/tram-lite/#html Read the full docs here.}
	 */
	static define(strings, ...templateVariables) {
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

		// if there are any component-effects that aren't already on hold, hold them now
		//   (we don't want them triggering before the component has been completely defined)
		// if there is already a hold, we won't touch these elements
		//   (the developer may want to defer processing until later)
		rootElement.querySelectorAll('script[is="component-effect"]:not([tl-hold])').forEach((componentEffect) => {
			console.log('should attach hold');
			componentEffect.setAttribute('tl-hold', 'component-mount');
		});

		// Custom element class with tram-lite template support.
		class CustomTramLiteElement extends HTMLElement {
			static get observedAttributes() {
				// all of the template variables are attributes that we'll update on
				return templateVariables;
			}

			constructor() {
				super();

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
				const templateTextNodes = ComponentDefinition.getTextNodesWithTramLiteValues(shadow);
				// save the original template in templateValuesTextNodes
				templateTextNodes.forEach((textNode) => {
					this.templateValuesTextNodes.push({ textNode, originalTemplate: textNode.textContent });
				});

				// scan for any elements with attributes that have a tram-lite variable
				// these are attributes that need to be updated on the attribute being changed
				const templateAttrElements = ComponentDefinition.getElementsWithTramLiteValuesInAttributes(shadow);
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
				const defaultAttributes = Object.keys(defaultAttributeValues);
				[...templateVariables, ...defaultAttributes].forEach((attributeName) => {
					if (this.getAttribute(attributeName) === null) {
						this.setAttribute(attributeName, defaultAttributeValues[attributeName] || '');
					}
				});

				// an initial call to set the default attributes
				this.attributeChangedCallback();

				// if there were any scripts that were waiting to be triggered on component mount, trigger them now
				this.shadowRoot
					.querySelectorAll('script[is="component-effect"][tl-hold="component-mount"]')
					.forEach((componentEffect) => {
						componentEffect.removeAttribute('tl-hold');
						console.log('should trigger');
					});
			}

			attributeChangedCallback(name, oldValue, newValue) {
				// scan through all text nodes and attributes with template values, and update them
				this.updateTextNodeTemplates();
				this.updateAttrNodeTemplates();
			}

			getUpdatedTemplate(originalTemplate) {
				let updatedTemplate = originalTemplate;

				templateVariables.forEach((attributeName) => {
					// fallback on the default values or an empty string if there is no value for this attribute yet
					const attributeValue = this.getAttribute(attributeName) || defaultAttributeValues[attributeName] || '';
					updatedTemplate = updatedTemplate.replaceAll(`tl:${attributeName}:`, attributeValue);
				});

				return updatedTemplate;
			}

			updateTextNodeTemplates() {
				// go through each text node that has a template variable, and update them
				this.templateValuesTextNodes.forEach(({ textNode, originalTemplate }) => {
					textNode.textContent = this.getUpdatedTemplate(originalTemplate);
				});
			}

			updateAttrNodeTemplates() {
				// go through each element with an attribute that has a template variable, and update those attribute values
				this.templateValuesAttrNodes.forEach(({ attrNode, element, originalTemplate }) => {
					// set the attribute value to the new value (updated with all template variables)
					attrNode.value = this.getUpdatedTemplate(originalTemplate);

					// these attributes are special, in order to update the live value (after a user has interacted with them),
					// they need to be set on the element as well
					if (['value', 'checked', 'selected'].includes(attrNode.name)) {
						element[attrNode.name] = this.getUpdatedTemplate(originalTemplate);
					}
				});
			}
		}

		// register this as a new element as a native web-component
		customElements.define(rootElement.tagName.toLowerCase(), CustomTramLiteElement);
	}

	/**
	 * static function to process template tags and define components
	 * @param {HTMLTemplateElement} templateTag
	 */
	static processTemplateDefinition(templateTag) {
		// get all child elements (in case more than one was defined in this tag)
		const allChildElements = templateTag.content.children;
		[...allChildElements].forEach((elementToDefine) => {
			// verify this element hasn't already been defined
			const elementHasBeenDefined = customElements.get(elementToDefine.tagName.toLowerCase()) !== undefined;
			if (elementHasBeenDefined) {
				// it has been defined already, skip this
				return;
			}

			const definitionString = elementToDefine.outerHTML;

			// we expect template variables to be in the following pattern, matching "${'...'}"
			const variablePattern = /\$\{\'(.*?)\'\}/;
			// Split the string by the above pattern, which lets us get an alternating list of strings and variables
			const parts = definitionString.split(variablePattern);

			// Extract the strings and the variables
			const rawStrings = parts.filter((_, index) => index % 2 === 0);
			const templateVaraibles = parts.filter((_, index) => index % 2 !== 0);

			ComponentDefinition.define(rawStrings, ...templateVaraibles);
		});
	}

	// processTemplateDefinition() {
	// 	ComponentDefinition.processTemplateDefinition(this);

	// 	// indicate that this component has been defined, and does not
	// 	// (and more importantly, should not) be processed again.
	// 	this.setAttribute('defined', '');
	// }

	/**
	 *
	 * @param {HTMLTemplateElement} newNode
	 */
	static connect(newNode) {
		// if we already have some content, process that now
		ComponentDefinition.processTemplateDefinition(newNode);

		// if we don't already have a mutation observer, set one up now.
		//   we need a mutation observer to catch new elements trying to be
		//   defined in this template after initial processing.
		if (newNode.observer === undefined) {
			newNode.observer = new MutationObserver(() => {
				newNode.processTemplateDefinition();
			});

			newNode.observer.observe(newNode.content, { childList: true });
		}
	}

	static disconnect(nodeToRemove) {
		nodeToRemove.observer.disconnect();
	}
}

TramLite.setupMutationObserverForConnecting('[tl-definition]', ComponentDefinition);
