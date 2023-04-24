let count = 0;

function increment() {
	count++;
	fb.setAttribute('count', count);
	fb2.setAttribute('count', count);
}

define`
  <foo-bar>
    <div styles="color: ${'color'}">${'greeting'} ${'name'}</div>
    <button onclick="increment()">Count: ${'count'}</button>
  </foo-bar>
`;

const fb = html`<foo-bar greeting="Hello" name="Jesse" count="0"></foo-bar>`;
document.body.appendChild(fb);

const fb2 = html`<foo-bar greeting="Hey" name="Tina" count="0"></foo-bar>`;
document.body.appendChild(fb2);