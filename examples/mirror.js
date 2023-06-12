define`
  <tram-mirror value="">
    <input size="10" id="reflection" disabled>
		<input size="10" id="source" onkeyup="updateMirrorValue(this, event)">
		<script>
			initializeMirror(this)
		</script>
  </tram-mirror>
`;

function initializeMirror(tramMirror) {
	addAttributeListener(tramMirror, 'value', () => {
		const [reflection] = queryAllDOM('#reflection', tramMirror);
		reflection.value = tramMirror.getAttribute('value');
	});
}

function updateMirrorValue(input, event) {
	const tramMirror = input.getRootNode().host;
	tramMirror.setAttribute('value', event.target.value);
}
