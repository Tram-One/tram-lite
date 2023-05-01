define`
  <tram-counter onload="initCounter(this)">
    <button style="color: ${'color'}" onclick="increment(this)">${'label'}: ${'count'}</button>
  </tram-counter>
`;

function initCounter(counter) {
	counter.setAttribute('count', 0);
}

function increment(button) {
	const counter = button.getRootNode().host;
	const newCount = parseInt(counter.getAttribute('count')) + 1;
	counter.setAttribute('count', newCount);
}

const counters = html`
	<tram-example>
		<tram-counter label="Blue" color="#CECEFF"></tram-counter>
		<tram-counter label="Red" color="#FFCECE"></tram-counter>
	</tram-example>
`;
document.body.appendChild(counters);
