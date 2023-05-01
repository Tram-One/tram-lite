define`
  <tram-counter count="0" label="Green" color="#CEFFCE">
    <button style="color: ${'color'}" onclick="increment(this)">${'label'}: ${'count'}</button>
  </tram-counter>
`;

function increment(button) {
	const counter = button.getRootNode().host;
	const newCount = parseInt(counter.getAttribute('count')) + 1;
	counter.setAttribute('count', newCount);
}

const counters = html`
	<tram-example>
		<tram-counter label="Blue" color="#CECEFF"></tram-counter>
		<tram-counter label="Red" color="#FFCECE"></tram-counter>
		<tram-counter></tram-counter>
	</tram-example>
`;
document.body.appendChild(counters);
