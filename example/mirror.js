function setMirrorValue(event) {
	const reflectionInput = event.target.previousElementSibling;
	reflectionInput.value = event.target.value;
}

define`
  <tram-mirror>
    <input size="10" disabled>
		<input size="10" onkeyup="setMirrorValue(event)">
  </tram-mirror>
`;

const tm = html`
	<tram-example>
		<tram-mirror>!</tram-mirror>
	</tram-example>
`;
document.body.appendChild(tm);
