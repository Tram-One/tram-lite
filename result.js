class CustomTramLiteElement extends HTMLElement {
            static tramLiteVersion = "4.1.1";
            static tagName = rootElement.tagName.toLowerCase();
            static get observedAttributes() {
                // all of the template variables are attributes that we'll update on
                return templateVariables;
            }
            constructor() {
                super(), 
                // list of attribute and text nodes that have a template value
                // these are scanned through when templated attributes are updated
                this.templateValuesAttrNodes = [], this.templateValuesTextNodes = [];
                // Create a shadow root
                // and append our HTML to it
                var shadow = this.attachShadow({
                    mode: "open"
                });
                shadow.append(...rootElement.cloneNode(!0).childNodes), 
                // save the original template in templateValuesTextNodes
                ComponentDefinition.getTextNodesWithTramLiteValues(shadow).forEach(textNode => {
                    this.templateValuesTextNodes.push({
                        textNode: textNode,
                        originalTemplate: textNode.textContent
                    });
                }), 
                // save the original attribute in the templateValuesAttributes
                ComponentDefinition.getElementsWithTramLiteValuesInAttributes(shadow).forEach(element => {
                    [ ...element.attributes ].forEach(attrNode => {
                        attrNode.value.match(/tl:(.+?):/) && this.templateValuesAttrNodes.push({
                            attrNode: attrNode,
                            element: element,
                            originalTemplate: attrNode.value
                        });
                    });
                });
            }
            connectedCallback() {
                // set all attribute values
                // - the first default value is whatever is set on DOM creation
                // - next, we check if there are default values that were part of the define
                // - lastly, we'll set it to an empty string.
                var defaultAttributes = Object.keys(defaultAttributeValues);
                [ ...templateVariables, ...defaultAttributes ].forEach(attributeName => {
                    null === this.getAttribute(attributeName) && this.setAttribute(attributeName, defaultAttributeValues[attributeName] || "");
                }), 
                // an initial call to set the default attributes
                this.attributeChangedCallback(), 
                // if there were any scripts that were waiting to be triggered on component mount, trigger them now
                this.shadowRoot.querySelectorAll('script[tl-hold="component-mount"]').forEach(componentEffect => {
                    componentEffect.removeAttribute("tl-hold");
                });
            }
            attributeChangedCallback(name, oldValue, newValue) {
                // scan through all text nodes and attributes with template values, and update them
                this.updateTextNodeTemplates(), this.updateAttrNodeTemplates();
            }
            getUpdatedTemplate(originalTemplate) {
                let updatedTemplate = originalTemplate;
                return templateVariables.forEach(attributeName => {
                    // fallback on the default values or an empty string if there is no value for this attribute yet
                    var attributeValue = this.getAttribute(attributeName) || defaultAttributeValues[attributeName] || "";
                    updatedTemplate = updatedTemplate.replaceAll(`tl:${attributeName}:`, attributeValue);
                }), updatedTemplate;
            }
            updateTextNodeTemplates() {
                // go through each text node that has a template variable, and update them
                this.templateValuesTextNodes.forEach(({
                    textNode,
                    originalTemplate
                }) => {
                    textNode.textContent = this.getUpdatedTemplate(originalTemplate);
                });
            }
            updateAttrNodeTemplates() {
                // go through each element with an attribute that has a template variable, and update those attribute values
                this.templateValuesAttrNodes.forEach(({
                    attrNode,
                    element,
                    originalTemplate
                }) => {
                    // set the attribute value to the new value (updated with all template variables)
                    attrNode.value = this.getUpdatedTemplate(originalTemplate), 
                    // these attributes are special, in order to update the live value (after a user has interacted with them),
                    // they need to be set on the element as well
                    [ "value", "checked", "selected" ].includes(attrNode.name) && (element[attrNode.name] = this.getUpdatedTemplate(originalTemplate));
                });
            }
        }