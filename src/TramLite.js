class TramLite {
	static version = 'APP_VERSION';
	static installed = false;

	/**
	 * a template tag function used to create new web-components.
	 * {@link https://tram-one.io/tram-lite/#define Read the full docs here.}
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
		rootElement.querySelectorAll('script[tl-effect]:not([tl-hold])').forEach((componentEffect) => {
			componentEffect.setAttribute('tl-hold', 'component-mount');
		});

		// Custom element class with tram-lite template support.
		class CustomTramLiteElement extends HTMLElement {
			static tramLiteVersion = 'APP_VERSION';
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
				this.shadowRoot.querySelectorAll('script[tl-hold="component-mount"]').forEach((componentEffect) => {
					componentEffect.removeAttribute('tl-hold');
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

	/**
	 * helper function to set up a callback for when an element's attribute changes
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
	 * function to append new behaviors to elements that are attached to the shadowDOM.
	 * {@link https://tram-one.io/tram-lite/#appendShadowRootProcessor Read the full docs here.}
	 * @param {string} matcher
	 * @param {{ connect: function }} componentClass
	 * @param {(node: Node) => boolean} [rootNodeTest=() => true]
	 */
	static appendShadowRootProcessor(matcher, componentClass, rootNodeTest = () => true) {
		// save the original version of shadowRoot.append
		const shAppend = ShadowRoot.prototype.append;

		ShadowRoot.prototype.append = function (...nodes) {
			shAppend.call(this, ...nodes);
			// if any element in this shadowRoot matches our matcher,
			//   run the `connect` function from this class
			this.querySelectorAll(matcher).forEach((matchingElement) => {
				if (rootNodeTest(matchingElement.getRootNode().host)) {
					componentClass.connect(matchingElement);
				}
			});
		};
	}
}
