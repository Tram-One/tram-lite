define`
  <custom-counter>
    <button style="color: ${'color'}" onclick="increment(this)">${'label'}: ${'count'}</button>
  </custom-counter>
`;

function increment(button) {
	const counter = button.getRootNode().host;
	const newCount = parseInt(counter.getAttribute('count')) + 1;
	counter.setAttribute('count', newCount);
}

const counters = html`
	<div>
		<custom-counter label="Blue" count="0" color="#CECEFF"></custom-counter>
		<custom-counter label="Red" count="0" color="#FFCECE"></custom-counter>
	</div>
`;

document.body.appendChild(counters);
