define`
  <tram-counter>
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
		<tram-counter label="Blue" count="0" color="#CECEFF"></tram-counter>
		<tram-counter label="Red" count="0" color="#FFCECE"></tram-counter>
	</tram-example>
`;
document.body.appendChild(counters);
