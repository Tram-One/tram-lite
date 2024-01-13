#!/usr/bin/env node

// usage - use this script to create a javascript version of a component definition
// e.g. npx tram-lite export-components your-component-definition.html
// see more usage details here: https://tram-one.io/tram-lite/#importing-and-exporting

const fs = require('fs');
const path = require('path');

// check to see if there is a predefined output filename (otherwise we will try to generate one)
const outputFlagIndex = process.argv.findIndex((arg) => arg === '-o' || arg === '--output');
const customOutputFile = outputFlagIndex !== -1 ? process.argv[outputFlagIndex + 1] : null;

const filePaths = process.argv.filter((arg) => {
	return arg.match(/\.html$/);
});

if (filePaths.length === 0) {
	console.error('Please provide at least one file path as an argument.');
	process.exit(1);
}

console.log('processing', filePaths, 'for export');
const componentDefinitions = filePaths.map((filePath) => fs.readFileSync(filePath, 'utf8'));

// load the core Tram-Lite library and classes (which are always needed)
const coreFiles = [
	'./export/TramLite.min.js',
	'./export/ComponentDefinition.min.js',
	'./export/ImportComponent.min.js',
].map((filePath) => fs.readFileSync(path.join(__dirname, filePath)).toString());

// load all shadow root processors
const processorFiles = fs
	.readdirSync(path.join(__dirname, './export/processors'))
	.map((file) => `./export/processors/${file}`)
	.map((filePath) => fs.readFileSync(path.join(__dirname, filePath)).toString());

// determine if we need these processors for these components
// (note, this is a very weak regex check, and not using proper CSS or static analysis)
const processorFilesToInclude = processorFiles.filter((processorContent) => {
	// the following regex matches on calls to appendShadowRootProcessor
	// it specifically captures the first parameter (a CSS selector), and
	// parses out the parameter as a whole, and then the text inside `[...]`
	const matches = processorContent.match(/TramLite\.appendShadowRootProcessor\(\"([^\[\,]*(\[?(.+)\])?[^\]\,]*)\"/);

	if (!matches) {
		console.log(processorContent);
	}

	// get the last most match (the most specific)
	const keySelector = [matches[1], matches[2], matches[3]].filter((selector) => selector != undefined).at(-1);

	// see if any of our component definitions match with this selector
	return componentDefinitions.some((template) => template.match(keySelector));
});

const tramLiteExportDepenedencies = [...coreFiles, ...processorFilesToInclude].join('');

const templateAndLoadCode = componentDefinitions
	.map((componentCode) => {
		// update the component code, in case it also uses ``, we'll need to escape them
		const formattedComponentCode = componentCode.replaceAll('`', '\\`').replaceAll('${', '\\${');
		return `
{
	const componentTemplate = \`${formattedComponentCode}\`;
	ImportComponent.processDefinitionTemplate(componentTemplate);
}
`;
	})
	.join('\n');

const isSingleFile = filePaths.length === 1;
// if we are processing a single file, use that as the file name
// if we are processing more than one file, use the directory name
const generatedOutputFileName = isSingleFile
	? path.basename(filePaths[0], '.html') + '.js'
	: path.basename(process.cwd()) + '.js';

const result = '{\n' + tramLiteExportDepenedencies + '\n' + templateAndLoadCode + '\n}';
fs.writeFileSync(customOutputFile || generatedOutputFileName, result);
