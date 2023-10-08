{
class TramLite {
    static version = "4.2.0-beta.2";
    static installed = !1;
    /**
	 * utility function to build the component class from the template string
	 * (this is an underlying utility for the define function)
	 */
    static makeComponentClass(t, ...e) {
        var a = document.createElement("template"), o = e.map(t => `tl:${t}:`);
        // tag our templateVariables, so we know how to look for them in the dom
        a.innerHTML = String.raw({
            raw: t
        }, ...o);
        const i = a.content.firstElementChild, r = {};
        // any attributes on the root are considered default values
        [ ...i.attributes ].forEach(t => {
            r[t.name] = t.value;
        }), 
        // if there are any component-effects that aren't already on hold, hold them now
        //   (we don't want them triggering before the component has been completely defined)
        // if there is already a hold, we won't touch these elements
        //   (the developer may want to defer processing until later)
        i.querySelectorAll("script[tl-effect]:not([tl-hold])").forEach(t => {
            t.setAttribute("tl-hold", "component-mount");
        });
        // Custom element class with tram-lite template support.
        class n extends HTMLElement {
            static tramLiteVersion = "4.2.0-beta.2";
            static tagName = i.tagName.toLowerCase();
            static get observedAttributes() {
                // all of the template variables are attributes that we'll update on
                return e;
            }
            constructor() {
                super(), 
                // list of attribute and text nodes that have a template value
                // these are scanned through when templated attributes are updated
                this.templateValuesAttrNodes = [], this.templateValuesTextNodes = [];
                // Create a shadow root
                // and append our HTML to it
                var t = this.attachShadow({
                    mode: "open"
                });
                t.append(...i.cloneNode(!0).childNodes), 
                // save the original template in templateValuesTextNodes
                ComponentDefinition.getTextNodesWithTramLiteValues(t).forEach(t => {
                    this.templateValuesTextNodes.push({
                        textNode: t,
                        originalTemplate: t.textContent
                    });
                }), 
                // save the original attribute in the templateValuesAttributes
                ComponentDefinition.getElementsWithTramLiteValuesInAttributes(t).forEach(e => {
                    [ ...e.attributes ].forEach(t => {
                        t.value.match(/tl:(.+?):/) && this.templateValuesAttrNodes.push({
                            attrNode: t,
                            element: e,
                            originalTemplate: t.value
                        });
                    });
                });
            }
            connectedCallback() {
                // set all attribute values
                // - the first default value is whatever is set on DOM creation
                // - next, we check if there are default values that were part of the define
                // - lastly, we'll set it to an empty string.
                var t = Object.keys(r);
                [ ...e, ...t ].forEach(t => {
                    null === this.getAttribute(t) && this.setAttribute(t, r[t] || "");
                }), 
                // an initial call to set the default attributes
                this.attributeChangedCallback(), 
                // if there were any scripts that were waiting to be triggered on component mount, trigger them now
                this.shadowRoot.querySelectorAll('script[tl-hold="component-mount"]').forEach(t => {
                    t.removeAttribute("tl-hold");
                });
            }
            attributeChangedCallback(t, e, a) {
                // scan through all text nodes and attributes with template values, and update them
                this.updateTextNodeTemplates(), this.updateAttrNodeTemplates();
            }
            getUpdatedTemplate(t) {
                let a = t;
                return e.forEach(t => {
                    // fallback on the default values or an empty string if there is no value for this attribute yet
                    var e = this.getAttribute(t) || r[t] || "";
                    a = a.replaceAll(`tl:${t}:`, e);
                }), a;
            }
            updateTextNodeTemplates() {
                // go through each text node that has a template variable, and update them
                this.templateValuesTextNodes.forEach(({
                    textNode: t,
                    originalTemplate: e
                }) => {
                    t.textContent = this.getUpdatedTemplate(e);
                });
            }
            updateAttrNodeTemplates() {
                // go through each element with an attribute that has a template variable, and update those attribute values
                this.templateValuesAttrNodes.forEach(({
                    attrNode: t,
                    element: e,
                    originalTemplate: a
                }) => {
                    // set the attribute value to the new value (updated with all template variables)
                    t.value = this.getUpdatedTemplate(a), 
                    // these attributes are special, in order to update the live value (after a user has interacted with them),
                    // they need to be set on the element as well
                    [ "value", "checked", "selected" ].includes(t.name) && (e[t.name] = this.getUpdatedTemplate(a));
                });
            }
        }
        return n;
    }
    /**
	 * a template tag function used to create new web-components.
	 * {@link https://tram-one.io/tram-lite/#define Read the full docs here.}
	 */
    static define(t, ...e) {
        // build the new component class from the template
        t = TramLite.makeComponentClass(t, ...e);
        // register this as a new element as a native web-component
        return customElements.define(t.tagName, t), t;
    }
    /**
	 * a helper function to update the root web-component when an input updates
	 * {@link https://tram-one.io/tram-lite/#updateRootAttr Read the full docs here.}
	 * @param {string} attributeName
	 * @param {Event} event
	 * @param {string} [targetAttribute="value"]
	 */
    static updateRootAttr(t, e, a = "value") {
        var o = e.target.getRootNode().host;
        e.target[a] ? o.setAttribute(t, e.target[a]) : o.removeAttribute(t);
    }
    /**
	 * helper function to set up a callback for when an element's attribute changes
	 * {@link https://tram-one.io/tram-lite/#addAttributeListener Read the full docs here.}
	 * @param {Element} targetElement - The DOM element to observe.
	 * @param {string[]} attributeNames - The name of the attribute (or list of attributes) to observe for changes.
	 * @param {function(MutationRecord):void} callback - The function to call when the observed attribute changes.
	 *    This function takes one argument: the MutationRecord representing the change.
	 */
    static addAttributeListener(e, t, a) {
        new MutationObserver(t => {
            t.forEach(t => {
                // only call the mutation if an attribute changed
                t.oldValue !== e.getAttribute(t.attributeName) && a(t);
            });
        }).observe(e, {
            attributes: !0,
            attributeFilter: t,
            attributeOldValue: !0
        });
    }
    /**
	 * function to append new behaviors to elements that are attached to the shadowDOM.
	 * {@link https://tram-one.io/tram-lite/#appendShadowRootProcessor Read the full docs here.}
	 * @param {string} matcher
	 * @param {{ connect: function }} componentClass
	 * @param {ShadowRoot} [shadowRoot=ShadowRoot.prototype]
	 */
    static appendShadowRootProcessor(e, a, t = ShadowRoot.prototype) {
        // save the original version of shadowRoot.append
        const o = t.append;
        t.append = function(...t) {
            o.call(this, ...t), 
            // if any element in this shadowRoot matches our matcher,
            //   run the `connect` function from this class
            this.querySelectorAll(e).forEach(t => {
                t.getRootNode().host && a.connect(t);
            });
        };
    }
}

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
    static nodeHasTramLiteAttr = t => [ ...t.attributes ].some(t => t.value.match(ComponentDefinition.templateVariableRegex)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    /**
	 * function to test if node has an TEXT node with a template variable
	 * e.g. <custom-element>Hello ${'name'}</custom-element>
	 */
    static nodeHasTextElementWithTramLiteAttr = t => t.textContent.match(ComponentDefinition.templateVariableRegex) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    /**
	 * generic function to build a tree walker, and use the filter + tram-lite matcher.
	 * this should return all elements that match the criteria
	 */
    static buildTreeWalkerTramLiteMatcher(t, e, a) {
        for (var o, i = [], r = document.createTreeWalker(t, e, {
            acceptNode: a
        })
        // build a tree walker that goes through each element, and each attribute
        ; o = r.nextNode(); ) i.push(o);
        return i;
    }
    // Returns elements with attributes containing tram-lite template variables.
    static getElementsWithTramLiteValuesInAttributes(t) {
        return ComponentDefinition.buildTreeWalkerTramLiteMatcher(t, NodeFilter.SHOW_ELEMENT, ComponentDefinition.nodeHasTramLiteAttr);
    }
    // Returns text nodes containing tram-lite template variables.
    static getTextNodesWithTramLiteValues(t) {
        return ComponentDefinition.buildTreeWalkerTramLiteMatcher(t, NodeFilter.SHOW_TEXT, ComponentDefinition.nodeHasTextElementWithTramLiteAttr);
    }
    /**
	 * static function to process template tags and define components
	 * @param {HTMLTemplateElement} templateTag
	 */
    static processTemplateDefinition(t) {
        [ ...t.content.children ].forEach(t => {
            var t = t.outerHTML.split(/\$\{\'(.*?)\'\}/), e = t.filter((t, e) => e % 2 == 0), t = t.filter((t, e) => e % 2 != 0);
            // we expect template variables to be in the following pattern, matching "${'...'}"
            TramLite.define(e, ...t);
        });
    }
    /**
	 * utility function to extract js template strings, so that they can be passed into a template tag function
	 */
    static extractTemplateVariables(t) {
        // we expect template variables to be in the following pattern, matching "${'...'}"
        t = t.split(/\$\{\'(.*?)\'\}/);
        // Split the string by the above pattern, which lets us get an alternating list of strings and variables
        return [ t.filter((t, e) => e % 2 == 0), t.filter((t, e) => e % 2 != 0) ];
    }
    /**
	 * function to set up an observer to watch for when new templates are added,
	 *   and process all the definitions in them
	 * @param {Document} [targetRoot=document]
	 */
    static setupMutationObserverForTemplates(t = document) {
        new MutationObserver(t => {
            t.forEach(t => {
                t.addedNodes.forEach(t => {
                    // check if the previous element is a definition template
                    // we wait until we are in the next element (most likely a #text node)
                    // because that will confirm that the element has been completely parsed
                    t.previousSibling?.matches?.("[tl-definition]") && ComponentDefinition.processTemplateDefinition(t.previousSibling);
                });
            });
        }).observe(document, {
            subtree: !0,
            childList: !0
        });
    }
}

/**
 * ComponentEffect is a class that can extend the script element, that allows developers
 * to build side-effects for web-components.
 *
 * {@link https://tram-one.io/tram-lite/#tl-effect}
 */
class ComponentEffect {
    /**
	 * function to trigger the javascript in a script tag.
	 * This does not handle the src attribute, only inline javascript.
	 * The `this` keyword will reference the host parent node of this script tag.
	 * @param {HTMLScriptElement} scriptTag
	 */
    static processScriptTag(t) {
        // don't do this if we have a hold on the script tag
        if (!t.hasAttribute("tl-hold")) {
            const e = t.getRootNode().host;
            // provide a scoped evaluation of the script tags in this element
            t = t.innerHTML, Function("document", "window", t).bind(e)(e.shadowRoot, window);
        }
    }
    /**
	 * connect function for ComponentEffect - when this is run on a script,
	 *   we trigger that script with the host element as context, and set up an
	 *   observer if a set of dependencies are defined and ever update
	 * @param {HTMLScriptElement} newNode
	 */
    static connect(t) {
        var e, a = t.getRootNode().host;
        // run an initial run of the script
        // (this won't happen if there is a tl-hold on the script)
        ComponentEffect.processScriptTag(t), 
        // if we have any dependencies, add a listener to trigger them
        t.hasAttribute("tl-dependencies") && !0 !== t.hasSetupListener && (e = t.getAttribute("tl-dependencies").split(" "), 
        TramLite.addAttributeListener(a, e, () => {
            // check if the inline script is being held
            ComponentEffect.processScriptTag(t);
        }), t.hasSetupListener = !0), 
        // if we ever set (or remove) the hold on this, trigger the inline script
        // (this allows developers to delay triggering inline scripts)
        TramLite.addAttributeListener(t, [ "tl-hold" ], () => {
            ComponentEffect.processScriptTag(t);
        });
    }
}

/**
 * ControlledInput is a class that can extend the input or script element, that allows developers
 * to build 2-way data-binding for web-components.
 *
 * {@link https://tram-one.io/tram-lite/#tl-effect}
 */
class ControlledInput {
    /**
	 * connect function for ControlledInput - when this is run on an input (or other similar control),
	 *   we set up a 2-way data binding from the input to the host element.
	 * @param {HTMLInputElement} newNode
	 */
    static connect(e) {
        // attributes that control the behavior of the controlled input
        var t = (e.getAttribute("tl-trigger") || "change").split(" ");
        const a = e.getAttribute("tl-hostattr") || "value", o = e.getAttribute("tl-targetattr") || "value", i = e.getRootNode().host;
        e[o] = i.getAttribute(a), 
        // update this input whenever the host attribute updates
        TramLite.addAttributeListener(i, [ a ], () => {
            e[o] = i.getAttribute(a);
        }), 
        // update the root component attribute whenever the value changes for this node updates
        t.forEach(t => {
            e.addEventListener(t, t => {
                TramLite.updateRootAttr(a, t, o);
            });
        });
    }
}

class ImportComponent {
    /**
	 * utility function for importing and defining new components (outside of Tram-Lite being installed)
	 * @param {string} componentContent
	 */
    static importNewComponent(t) {
        var [ t, e ] = ComponentDefinition.extractTemplateVariables(t), t = TramLite.makeComponentClass(t, ...e);
        // make a component class based on the template tag pieces
        // (this is done, over define, so we can attach shadow root processors)
        // override attachShadow so that we can add shadowRootProcessors
        const a = t.prototype.attachShadow;
        t.prototype.attachShadow = function(...t) {
            t = a.call(this, ...t);
            return TramLite.appendShadowRootProcessor("[tl-controlled]", ControlledInput, t), 
            TramLite.appendShadowRootProcessor("[tl-effect]", ComponentEffect, t), 
            t;
        }, 
        // define the component in the DOM
        customElements.define(t.tagName, t);
    }
}

{
	const componentTemplate = `<ex-progressbar value="3" max="10">
	<div>
		<input id="value" type="number" tl-controlled tl-trigger="input" />
		<input id="max" type="number" tl-controlled tl-hostattr="max" tl-trigger="input" />
	</div>
	<progress value="\${'value'}" max="\${'max'}"></progress>
	<div>\${'warning'}</div>
	<script tl-effect tl-dependencies="value max">
		const value = parseInt(this.getAttribute('value'));
		const max = parseInt(this.getAttribute('max'));
		if (value > max) {
			this.setAttribute('warning', \`WARNING: \${value} is greater than \${max}\`);
		} else {
			this.removeAttribute('warning');
		}
	</script>
</ex-progressbar>
`;
	ImportComponent.importNewComponent(componentTemplate)
}


{
	const componentTemplate = `<ex-temperature celsius="" fahrenheit="">
	<label>
		<input id="c" tl-controlled placeholder="C" unit="celsius" tl-hostattr="celsius" tl-trigger="input" />
		Celsius
	</label>
	=
	<label>
		<input id="f" tl-controlled placeholder="F" unit="fahrenheit" tl-hostattr="fahrenheit" tl-trigger="input" />
		Fahrenheit
	</label>

	<script tl-effect>
		// functions to define for the rest of the component
		this.calcCelsius = (f) => {
			return ((f - 32) * (5 / 9)).toFixed(0);
		};

		this.calcFahrenheit = (c) => {
			return (c * (9 / 5) + 32).toFixed(0);
		};

		this.isReflectiveUpdate = (temperatureConverter) => {
			const f = temperatureConverter.getAttribute('fahrenheit');
			const c = temperatureConverter.getAttribute('celsius');
			// if this celsius or fahrenheit value would generate the other, don't update
			// this is indicative of an update triggered by another update!
			// this can happen because multiple Fahrenheit values map to the same (truncated) celsius value
			// e.g. 19F and 20F both map to -7C
			return this.calcFahrenheit(this.calcCelsius(f)) === this.calcFahrenheit(c);
		};
	</script>
	<script tl-effect tl-dependencies="celsius">
		const c = this.getAttribute('celsius');
		const newF = this.calcFahrenheit(c);
		if (c && !isNaN(newF) && !this.isReflectiveUpdate(this)) {
			this.setAttribute('fahrenheit', newF);
		}
	</script>
	<script tl-effect tl-dependencies="fahrenheit">
		const f = this.getAttribute('fahrenheit');
		const newC = this.calcCelsius(f);
		if (f && !isNaN(newC)) {
			this.setAttribute('celsius', newC);
		}
	</script>
</ex-temperature>
`;
	ImportComponent.importNewComponent(componentTemplate)
}


{
	const componentTemplate = `<ex-container>
	<style>
		fieldset {
			border: yellow 1px solid;
		}
		legend {
			color: yellow;
		}
	</style>
	<fieldset>
		<legend>\${'name'}</legend>
		<slot></slot>
	</fieldset>
</ex-container>
`;
	ImportComponent.importNewComponent(componentTemplate)
}


{
	const componentTemplate = `<ex-colorpicker width="100px">
	<style>
		svg {
			display: block;
		}
		rect {
			fill: oklch(70% 0.1 \${'hue'});
		}
	</style>
	<input id="hue-range-input" type="range" tl-controlled tl-hostattr="hue" tl-trigger="input" min="0" max="360" />
	<input id="hue-text-input" type="text" placeholder="hue value" tl-controlled tl-hostattr="hue" />
	<svg viewbox="0 0 100 100" width="\${'width'}">
		<rect width="100" height="100" />
	</svg>
</ex-colorpicker>
`;
	ImportComponent.importNewComponent(componentTemplate)
}

}