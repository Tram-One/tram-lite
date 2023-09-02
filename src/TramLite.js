/**
 * Tram-Lite is a frontend component library to help make native web-components!
 * The main utility function is `define`, which allows you to craft web-components
 * using simple template syntax.
 *
 * {@link https://tram-one.io/tram-lite/}
 */
class TramLite {
	// regex for finding attributes that have been templated in
	static templateVariableRegex = /tl:(.+?):/;

	/**
	 * function to test if node has an attribute value with a template variable
	 * e.g. <custom-element style="color: ${'color'}">
	 */
	static nodeHasTramLiteAttr = (node) =>
		[...node.attributes].some((attr) => attr.value.match(TramLite.templateVariableRegex))
			? NodeFilter.FILTER_ACCEPT
			: NodeFilter.FILTER_SKIP;

	/**
	 * function to test if node has an TEXT node with a template variable
	 * e.g. <custom-element>Hello ${'name'}</custom-element>
	 */
	static nodeHasTextElementWithTramLiteAttr = (node) =>
		node.textContent.match(TramLite.templateVariableRegex) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;

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
		return TramLite.buildTreeWalkerTramLiteMatcher(root, NodeFilter.SHOW_ELEMENT, TramLite.nodeHasTramLiteAttr);
	}

	// Returns text nodes containing tram-lite template variables.
	static getTextNodesWithTramLiteValues(root) {
		return TramLite.buildTreeWalkerTramLiteMatcher(
			root,
			NodeFilter.SHOW_TEXT,
			TramLite.nodeHasTextElementWithTramLiteAttr
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

		// Custom element class with tram-lite template support.
		class CustomTramLiteElement extends HTMLElement {
			static get observedAttributes() {
				// all of the template variables are attributes that we'll update on
				return templateVariables;
			}

			constructor() {
				super();

				// keep track if our component script tags should be executed
				this.shouldExecuteScripts = true;

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
				const templateTextNodes = TramLite.getTextNodesWithTramLiteValues(shadow);
				// save the original template in templateValuesTextNodes
				templateTextNodes.forEach((textNode) => {
					this.templateValuesTextNodes.push({ textNode, originalTemplate: textNode.textContent });
				});

				// scan for any elements with attributes that have a tram-lite variable
				// these are attributes that need to be updated on the attribute being changed
				const templateAttrElements = TramLite.getElementsWithTramLiteValuesInAttributes(shadow);
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

				// if we have scripts to run, execute them now
				if (this.shouldExecuteScripts) {
					// by default, we only do this once (otherwise it would re-trigger on appendChild or other moves)
					// you can technically retrigger these by setting this.shouldExecuteScripts back to true
					this.shouldExecuteScripts = false;

					// provide a scoped evaluation of the script tags in this element
					const scopedEval = (script) => {
						return Function('document', 'window', script).bind(this)(this.shadowRoot, window);
					};
					const scripts = this.shadowRoot.querySelectorAll('script');
					scripts.forEach((script) => {
						// if we have a src attribute, we should just clone and replace the node
						// otherwise, we call the inline javascript with `this` set to the current node
						if (script.hasAttribute('src')) {
							// Clone the script node
							const clonedScript = document.createElement('script');
							[...script.attributes].forEach((attr) => clonedScript.setAttribute(attr.name, attr.value));
							clonedScript.textContent = script.textContent;

							// replace the original script tag with this new one (which will cause it to trigger)
							script.parentNode.replaceChild(clonedScript, script);
						} else {
							scopedEval(script.innerHTML);
						}
					});
				}
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
	 * a helper function to quickly create html dom with all their attributes and content.
	 * {@link https://tram-one.io/tram-lite/#html Read the full docs here.}
	 * @returns {Element}
	 */
	static html(strings, ...values) {
		const template = document.createElement('template');
		template.innerHTML = String.raw({ raw: strings }, ...values);
		const element = template.content.firstElementChild;
		return element;
	}

	/**
	 * a helper function to quickly create svg dom with all their attributes and content.
	 * {@link https://tram-one.io/tram-lite/#svg Read the full docs here.}
	 * @returns {Element}
	 */
	static svg(strings, ...values) {
		const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'template');
		svgContainer.innerHTML = String.raw({ raw: strings }, ...values);
		const element = svgContainer.firstElementChild;
		return element;
	}

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
	 * a helper function to update the root web-component when an input updates
	 * {@link https://tram-one.io/tram-lite/#updateRootAttr Read the full docs here.}
	 * @param {string} attributeName
	 * @param {Event} event
	 * @param {string} [targetAttribute="value"]
	 */
	static updateRootAttr(attributeName, event, targetAttribute = 'value') {
		const rootNodeHost = event.target.getRootNode().host;
		const targetValue = event.target[targetAttribute];
		if (targetValue) {
			rootNodeHost.setAttribute(attributeName, event.target[targetAttribute]);
		} else {
			rootNodeHost.removeAttribute(attributeName);
		}
	}
}

// expose functions for external usage
const { define, html, svg, addAttributeListener, updateRootAttr } = TramLite;
