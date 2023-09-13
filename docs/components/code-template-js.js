class CodeTemplateJS extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		const templateContent = this.querySelector('template').content;
		const container = document.createElement('div');
		container.appendChild(templateContent);
		const jsCode = container.querySelector('script').innerHTML;

		// attempt to remove minimum number of tabs
		const firstRealLine = jsCode.split('\n').find((line) => line.trim() !== '');
		const indents = firstRealLine.match(/\t/g).join('');
		let formattedCode = jsCode
			.split('\n')
			.map((line) => line.replace(indents, ''))
			.filter((line) => !line.includes('// prettier-ignore')) // remove any lines for prettier
			.map((line) => line.replaceAll('[script]', '<script>').replaceAll('[/script]', '</script>')) // translate <\/script> into </script>
			.join('\n')
			.trim();

		formattedCode = formattedCode;

		const templateHTML = html`
			<section>
				<link rel="stylesheet" href="https://unpkg.com/@highlightjs/cdn-assets@11.8.0/styles/night-owl.min.css" />
				<link rel="stylesheet" type="text/css" href="./styles.css" />
				<pre><code class='language-javascript'></code></pre>
			</section>
		`;

		templateHTML.querySelector('code').textContent = formattedCode;
		this.shadowRoot.append(templateHTML);

		hljs.highlightElement(this.shadowRoot.querySelector('code'));
	}
}

customElements.define('code-template-js', CodeTemplateJS);
