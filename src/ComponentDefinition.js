/**
 * ComponentDefinition is a custom element that extends the template element, that allows developers
 * to build new web-components, using Tram-Lite, all in their HTML templates!
 *
 * {@link https://tram-one.io/tram-lite/#component-definition}
 */
class ComponentDefinition extends HTMLTemplateElement {
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

	constructor() {
		super();

		// need a mutation observer to determine exactly when the template content is available
		// once the content is available, we can disconnect immediately
		this.observer = new MutationObserver((mutations, observer) => {
			this.processTemplateDefinition();
			observer.disconnect();
		});
	}

	processTemplateDefinition() {
		ComponentDefinition.processTemplateDefinition(this);

		// indicate that this component has been defined, and does not
		// (and more importantly, should not) be processed again.
		this.setAttribute('defined', '');
	}

	connectedCallback() {
		// if we've already defined this component, don't try to define it again
		if (this.hasAttribute('defined')) {
			return;
		}

		// if this is the first time we've been processed, check if we have template content
		if (this.content.firstElementChild === null) {
			// we don't have the template content yet, wait for it to exist
			this.observer.observe(this.content, { childList: true });
		} else {
			// we already have the template content, process it!
			this.processTemplateDefinition();
		}
	}

	disconnectedCallback() {
		this.observer.disconnect();
	}
}

// associate this class as a custom built-in for the template tag
// e.g. it can be created with a <template is="component-definition"> tag in HTML
customElements.define('component-definition', ComponentDefinition, { extends: 'template' });

try {
	// try to generate an instance of the class, if this fails, that means that
	// custom built-ins are not supported, so we'll need to use a mutation observer
	// (most likely because we are on a WebKit browser)
	new ComponentDefinition();
} catch (error) {
	const processNewNodes = (mutationRecords) => {
		mutationRecords.forEach((mutationRecord) => {
			mutationRecord.addedNodes.forEach((newNode) => {
				if (newNode.matches?.('template[is=component-definition]')) {
					ComponentDefinition.processTemplateDefinition(newNode);
				}
			});
		});
	};

	const observer = new MutationObserver(processNewNodes);
	observer.observe(document, { subtree: true, childList: true });
}
