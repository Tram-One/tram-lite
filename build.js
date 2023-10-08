// This script contains all the steps for generating the output results.
// This can be triggered by running `npm run build`
//
// A majority of this file uses the UglifyJS API
// https://www.npmjs.com/package/uglify-js
//
const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');
const { version } = require('./package.json');

// before we start anything, make sure the output directory exists and is empty
if (!fs.existsSync('output')) {
	// if it doesn't exist make it
	fs.mkdirSync('output');
} else {
	// if it does, remove all files in the directory
	const files = fs.readdirSync('output');
	for (const file of files) {
		const filePath = path.join('output', file);
		fs.unlinkSync(filePath);
	}
}

// load all source class files (these will be included in all builds)
const classFiles = ['src/TramLite.js', ...fs.readdirSync('src/processors').map((file) => `src/processors/${file}`)];
const loadedClassFiles = Object.fromEntries(
	classFiles.map((filePath) => {
		console.log('loading', filePath);
		return [filePath, fs.readFileSync(filePath).toString()];
	}),
);

// load all import/export scripts separately (these are only included in some builds)
console.log('loading', 'src/import-components.js');
const importComponentClass = {
	'src/ImportComponent.js': fs.readFileSync('src/ImportComponent.js').toString(),
};
console.log('loading', 'src/import-script.js');
const importScript = {
	'src/scripts/import-script.js': fs.readFileSync('src/scripts/import-script.js').toString(),
};

// uglify parameters to change the result of each bundle.
// `MODULE` and `INSTALL` are variables that can be found in the class files and
//   determine if we should attach listeners for a window or export the class for a JS API.
// `enclose` determines if the code should be wrapped in an IIFE (which prevents
//   prevents class definitions from colliding).
const buildConfigs = [
	{
		outputFile: 'output/api.js',
		files: loadedClassFiles,
		defines: { MODULE: true, INSTALL: false },
	},
	{
		outputFile: 'output/tram-lite.js',
		files: loadedClassFiles,
		defines: { MODULE: false, INSTALL: true },
	},
	{
		outputFile: 'output/import-components.js',
		files: { ...loadedClassFiles, ...importComponentClass, ...importScript },
		defines: { MODULE: false, INSTALL: false },
		enclose: true,
	},
	{
		outputFile: 'output/export-dependencies.js',
		files: { ...loadedClassFiles, ...importComponentClass },
		defines: { MODULE: false, INSTALL: false },
	},
];

buildConfigs.forEach((config) => {
	console.log('building', config.outputFile);
	const options = {
		compress: {
			global_defs: {
				APP_VERSION: version,
				...config.defines,
			},
		},
		enclose: config.enclose,
		output: {
			comments: 'all',
			beautify: true,
		},
	};
	const result = UglifyJS.minify(config.files, options);
	fs.writeFileSync(config.outputFile, result.code);
});

// for each of these, create a minified version
const minifyConfigs = [
	{ inputFile: 'output/api.js', outputFile: 'output/api.min.js' },
	{ inputFile: 'output/tram-lite.js', outputFile: 'output/tram-lite.min.js' },
	{ inputFile: 'output/import-components.js', outputFile: 'output/import-components.min.js' },
	{ inputFile: 'output/export-dependencies.js', outputFile: 'output/export-dependencies.min.js' },
];

minifyConfigs.forEach((config) => {
	console.log('minifying', config.outputFile);
	const result = UglifyJS.minify(fs.readFileSync(config.inputFile, 'utf8'));
	fs.writeFileSync(config.outputFile, result.code);
});

// do a simple copy for the export-script (needs no minification)
fs.copyFileSync('src/scripts/export-script.js', 'output/export-components.js');

console.log('Tram-Lite build complete!');
