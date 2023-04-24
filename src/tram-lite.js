function getTextNodesWithTramLiteValues(root) {
	const result = [];
	const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode: (node) => {
			return node.textContent.match(/tl:(.+?):/) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
		},
	});

	let currentNode;
	while ((currentNode = treeWalker.nextNode())) {
		result.push(currentNode);
	}

	return result;
}

/**
 * define a new custom element
 */
function define(strings, ...values) {
	const template = document.createElement('template');

	// tag our values, so we know how to look for them in the dom
	const taggedValues = values.map((value) => `tl:${value}:`);

	template.innerHTML = String.raw({ raw: strings }, ...taggedValues);
	const element = template.content.firstElementChild;

	class CustomTramLiteElement extends HTMLElement {
		static get observedAttributes() {
			// in the case where we use the tag attributes, we can use the following code
			// e.g. <foo-counter start> ...
			// return Array.from(element.attributes, (attr) => attr.name);

			// in the case where we just use all the templated values
			// e.g. <foo-label>${'label'} ...
			return values;
		}

		attributeChangedCallback(name, oldValue, newValue) {
			console.log('changedCallback', { name, oldValue, newValue });
			// scan through all text nodes with tagged values
			this.updateTextNodeTemplates();
		}

		updateTextNodeTemplates() {
			this.taggedValuesTextNodes.forEach(({ textNode, originalTemplate }) => {
				let updatedTemplate = originalTemplate;
				// we'll need to go through all the attributes, in case this template has other attributes
				[...this.attributes].forEach((attribute) => {
					updatedTemplate = updatedTemplate.replace(`tl:${attribute.name}:`, this.getAttribute(attribute.name));
				});
				console.log({ updatedTemplate });
				textNode.textContent = updatedTemplate;
			});
		}

		constructor() {
			super();

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

			console.log({ taggedValuesTextNodes: this.taggedValuesTextNodes });
		}
	}

	customElements.define(element.tagName.toLowerCase(), CustomTramLiteElement);
}

/**
 * create DOM html with simple JS
 */
function html(strings, ...values) {
	const template = document.createElement('template');
	template.innerHTML = String.raw({ raw: strings }, ...values);
	const element = template.content.firstElementChild;
	return element;
}