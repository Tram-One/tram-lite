define`
	<color-picker width="100px">
		<style>
			svg {
				display: block;
			}
			rect {
				fill: oklch(70% 0.1 ${'hue'});
			}
		</style>
		<input id="hue-range-input" type="range" value="${'hue'}" oninput="updateColor(event)" min="0" max="360">
		<input id="hue-text-input" type="text" value="${'hue'}" onchange="updateColor(event)">
		<svg viewbox="0 0 100 100" width=${'width'}>
			<rect width="100" height="100" />
		</svg>

	</color-picker>
`;

function updateColor(event) {
	const colorPicker = event.target.getRootNode().host;
	colorPicker.setAttribute('hue', event.target.value);
}
