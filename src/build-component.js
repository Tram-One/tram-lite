const fs = require('fs');
const path = require('path');

const jsdom = require('jsdom'); // used to create web interfaces (namely document.createElement)
const { JSDOM } = jsdom;
const { window } = new JSDOM('');
global.document = window.document;
global.HTMLElement = window.HTMLElement;

// Load TramLite class
const TramLite = require('../output/api');

// Get the path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
	console.error('Error: No file path provided.');
	process.exit(1);
}

// Construct the full path
const fullPath = path.resolve(filePath);

// Read the file content
fs.readFile(fullPath, 'utf8', (err, data) => {
	if (err) {
		console.error('Error reading the file:', err);
		process.exit(1);
	}

	const newClassComponent = TramLite.makeComponentClass(data);

	// Output the result or do further processing...
	// console.log(newClassComponent.toString());
	fs.writeFileSync('./result.js', newClassComponent.toString());
});
