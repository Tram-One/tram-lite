// usage - this script is intended to be used as part of a script tag
// e.g. <script src=".../import-components.js" tl-components=".../my-component.html">
// see more usage details here: https://tram-one.io/tram-lite/#importing-and-exporting

// tl-components can have a space separated list of import paths
const componentPaths = document.currentScript.getAttribute('tl-components').split(/\s+/);

// for each path we have, process the component definition
componentPaths.forEach(async (componentPath, index) => {
	// author's note:
	// there's no reason for index to be required here, but there is an issue
	// where the minified code breaks in safari - more investigation probably needs to happen
	// here, but for now, this appears to work
	if (index === null || componentPath === undefined) {
		throw 'Tram-Lite: Import could not process component';
	}
	const componentResult = await fetch(componentPath);
	if (!componentResult.ok) {
		// if we couldn't fetch the component, don't process anything
		return;
	}

	// load the content as text, and process it as a definition template string
	const componentContent = await componentResult.text();
	ImportComponent.processDefinitionTemplate(componentContent);
});
