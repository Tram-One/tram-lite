define`
  <tram-title>
    <h1 style="font-size: 1em;"><slot></h1>
  </tram-title>
`;

const newTitle = html`
	<tram-example>
		<tram-title>Tram-Lite Components!</tram-title>
	</tram-example>
`;
document.body.appendChild(newTitle);
