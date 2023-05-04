define`
	<color-picker>
		<style>
			div {
				display: block;
				background: hsl(${'hue'}, 70%, 50%);
				height: 50px;
				width: 50px;
			}
		</style>
		<input type="range" value="${'hue'}" oninput="updateColor(event)" min="0" max="360">
		<input type="text" value="${'hue'}" onchange="updateColor(event)">
		<div></div>
	</color-picker>
`;

function updateColor(event) {
	const colorPicker = event.target.getRootNode().host;
	colorPicker.setAttribute('hue', event.target.value);
}
