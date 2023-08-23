define`
	<example-container>
		<style>
			fieldset {
				border: yellow 1px solid;
			}
			legend {
				color: yellow;
			}
		</style>
		<fieldset>
			<legend>${'name'}</legend>
			<slot></slot>
		</fieldset>
	</example-container>
`;
