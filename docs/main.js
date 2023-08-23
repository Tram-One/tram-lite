/* custom component for showing code with HTML tags */
define`
	<tram-code>
		<link rel="stylesheet" type="text/css" href="./styles.css" />
		<style>
			material-icon	{
				padding-top: -10rem;
			}
		</style>
		<pre>${'code'}</pre>
		<!-- <material-icon icon="content_copy"></material-icon> -->
		<script>
			formatCode(this)
		</script>
	</tram-code>
`;

/**
 * function to format code
 */
function formatCode(tramCode) {
	const code = tramCode.getAttribute('code');

	// get all the lines (excluding any starting lines)
	const allLines = code.split('\n').filter((line, index) => line.trim() !== '' || index !== 0);

	// determine what the fewest tabs are amongst all lines, and unindent all lines based on that
	// remove empty lines at beginning and end
	const nonEmptyLines = allLines.filter((line) => line.trim() !== '');

	// get the number of tab characters per line
	const tabsPerLine = nonEmptyLines.map((line) => line.split('\t').length - 1);
	const minTabs = tabsPerLine.length > 0 ? Math.min(...tabsPerLine) : 0;
	const tabsToRemove = '\t'.repeat(minTabs);

	const linesWithoutTabs = allLines.map((line) => line.replace(tabsToRemove, ''));

	tramCode.setAttribute('code', linesWithoutTabs.join('\n').trimEnd());
}

/* custom component for google icons */
define`
	<material-icon>
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
		<span class="material-symbols-outlined">${'icon'}</span>
	</material-icon>
`;

/* custom element for the parameter optional badge */
define`
	<optional-badge>
		<style>
			span {
				font-weight: normal;
				border: 1px solid var(--text-2);
				border-radius: 10px;
				padding: 2px;
				font-size: 0.8rem;
			}
		</style>
		<span><slot></slot></span>
	</optional-badge>
`;

define`
	<tag-code tag="" content="">
		<link rel="stylesheet" type="text/css" href="./styles.css" />
		<style>
			code {
				background: var(--surface-2);
				border-radius: var(--radius-2);
				padding: var(--size-1) var(--size-2);
			}
		</style>
		<code>&lt;${'tag'}&gt;</code>
		<script>
			injectContent(this)
		</script>
	</tag-code>
`;

function injectContent(tagCode) {
	if (tagCode.getAttribute('content') !== null) {
		const [codeTag] = tagCode.shadowRoot.querySelectorAll('code');
		const tag = tagCode.getAttribute('tag');
		const content = tagCode.getAttribute('content');
		codeTag.innerText = `<${tag}>${content}</${tag}>`;
	}
}
