function increment(event) {
	const counter = event.target.getRootNode().host;
	const newCount = parseInt(counter.getAttribute('count')) + 1;
	counter.setAttribute('count', newCount);
}

define`
  <tram-counter>
    <button style="color: ${'color'}" onclick="increment(event)">${'label'}: ${'count'}</button>
  </tram-counter>
`;

const bc = html`<tram-counter label="Blue" count="0" color="#CECEFF"></tram-counter>`;
document.body.appendChild(bc);

const rc = html`<tram-counter label="Red" count="0" color="#FFCECE"></tram-counter>`;
document.body.appendChild(rc);
