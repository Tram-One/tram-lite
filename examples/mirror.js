define`
  <tram-mirror value="">
    <input size="10" id="reflection" disabled value=${'value'}>
		<input size="10" id="source" onkeyup="updateMirrorValue(this, event)">
  </tram-mirror>
`;

function updateMirrorValue(input, event) {
	const tramMirror = input.getRootNode().host;
	tramMirror.setAttribute('value', input.value);
}
