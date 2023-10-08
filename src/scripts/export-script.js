#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// check to see if we should use the minified flag for external dependencies
const useMinified = process.argv.includes('-m') || process.argv.includes('--minified');

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

const tramLiteExportDependenciesPath = useMinified
	? path.join(__dirname, './export-dependencies.min.js')
	: path.join(__dirname, './export-dependencies.js');

const tramLiteExportDepenedencies = fs.readFileSync(tramLiteExportDependenciesPath).toString();
const templateAndLoadCode = componentDefinitions
	.map((componentCode) => {
		// update the component code, in case it also uses ``, we'll need to escape them
		const formattedComponentCode = componentCode.replaceAll('`', '\\`').replaceAll('${', '\\${');
		return `
{
	const componentTemplate = \`${formattedComponentCode}\`;
	ImportComponent.importNewComponent(componentTemplate)
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
