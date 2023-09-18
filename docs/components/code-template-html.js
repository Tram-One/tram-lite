class CodeTemplateHTML extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		const templateContent = this.querySelector('template').content;
		const container = document.createElement('div');
		container.appendChild(templateContent);
		const htmlCode = container.innerHTML;

		// attempt to remove minimum number of tabs
		const firstRealLine = htmlCode.split('\n').find((line) => line.trim() !== '');
		const indents = firstRealLine.match(/\t/g).join('');
		const inlineCorrectedCode = htmlCode
			.split('\n')
			.map((line) => line.replace(indents, ''))
			.join('\n')
			.trim();

		// in HTML it's common to see the `blah=""` attribute reduced to `blah`,
		// replace any occurances of `tl-*=""`
		const attributeCorrectedCode = inlineCorrectedCode.replaceAll(/(tl-\w+)=""/g, '$1');

		const templateHTML = document.createElement('section');
		templateHTML.innerHTML = `
			<link rel="stylesheet" href="https://unpkg.com/@highlightjs/cdn-assets@11.8.0/styles/night-owl.min.css" />
			<link rel="stylesheet" type="text/css" href="./styles.css" />
			<pre><code class='language-html'></code></pre>
		`;

		templateHTML.querySelector('code').textContent = attributeCorrectedCode;
		this.shadowRoot.append(templateHTML);

		hljs.highlightElement(this.shadowRoot.querySelector('code'));
	}
}

customElements.define('code-template-html', CodeTemplateHTML);
