class TramLite {
	static version = APP_VERSION;
	static installed = INSTALL;

	// extending HTMLElement so that we can attach shadow root processors
	//   without interfering with the global HTMLElement prototype
	//   (this is most important in the import/export case)
	static ComponentInterface = class extends HTMLElement {};

	/**
	 * utility function to build the component class from the template string
	 * (this is an underlying utility for the define function)
	 */
	static makeComponentClass(strings, ...templateVariables) {
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
		class CustomTramLiteElement extends TramLite.ComponentInterface {
			static tramLiteVersion = APP_VERSION;
			static tagName = rootElement.tagName.toLowerCase();

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
				const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
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

		return CustomTramLiteElement;
	}

	/**
	 * a template tag function used to create new web-components.
	 * {@link https://tram-one.io/tram-lite/#define Read the full docs here.}
	 */
	static define(strings, ...templateVariables) {
		// build the new component class from the template
		const NewComponentClass = TramLite.makeComponentClass(strings, ...templateVariables);

		// register this as a new element as a native web-component
		customElements.define(NewComponentClass.tagName, NewComponentClass);

		return NewComponentClass;
	}

	/**
	 * function to set up a callback for when an element's attribute changes
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
	 * function to dispatch events up or down from a host component.
	 * {@link https://tram-one.io/tram-lite/#broadcastEvent Read the full docs here.}
	 * @param {HTMLElement} element - element to associate with the event, and to dispatch from
	 * @param {string} eventName - event name, can be listened for from other elements
	 * @param {'up' | 'down'} eventDirection - dictates which elements should receive the event, parents ('up') or children ('down')
	 */
	static broadcastEvent(element, eventName, eventDirection) {
		const eventDetails = { originalElement: element };
		if (eventDirection === 'up') {
			const customEvent = new CustomEvent(eventName, {
				bubbles: true,
				composed: true,
				detail: eventDetails,
			});
			element.dispatchEvent(customEvent);
		}
		if (eventDirection === 'down') {
			// if we are dispatching an event to child elements, query all child elements,
			//   and dispatch on each one individually
			const customEvent = new CustomEvent(eventName, {
				bubbles: false,
				composed: false,
				detail: eventDetails,
			});
			const allChildElements = [...element.shadowRoot.querySelectorAll('*'), ...element.querySelectorAll('*')];
			allChildElements.forEach((child) => child.dispatchEvent(customEvent));
		}
	}

	/**
	 * function to append new behaviors to elements that are attached to the shadowDOM.
	 * Can be used for Tram-Lite component definitions, and generic Web-Component classes.
	 * {@link https://tram-one.io/tram-lite/#appendShadowRootProcessor Read the full docs here.}
	 * @param {string} matcher - css selectors to match on new elements that are appended to shadowDOM.
	 * @param {{ connect: function }} processorClass - class with a static connect function, which are associated with newly attached nodes.
	 * @param {typeof HTMLElement} [componentInterface=TramLite.ComponentInterface] - Web Component class that we should add this shadowRootProcessor on
	 */
	static appendShadowRootProcessor(matcher, processorClass, componentInterface = TramLite.ComponentInterface) {
		// override attachShadow so that we can add shadowRootProcessors
		const attachShadow = componentInterface.prototype.attachShadow;

		componentInterface.prototype.attachShadow = function (...options) {
			const shadowRoot = attachShadow.call(this, ...options);

			// save the original version of shadowRoot.append
			const shAppend = shadowRoot.append;

			shadowRoot.append = function (...nodes) {
				shAppend.call(this, ...nodes);
				// if any element in this shadowRoot matches our matcher,
				//   run the `connect` function from this class
				this.querySelectorAll(matcher).forEach((matchingElement) => {
					if (matchingElement.getRootNode().host) {
						processorClass.connect(matchingElement);
					}
				});
			};

			return shadowRoot;
		};
	}
}
