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
const outputDirectories = ['output', 'output/export', 'output/export/processors'];
outputDirectories.forEach((directory) => {
	if (!fs.existsSync(directory)) {
		// if it doesn't exist make it
		fs.mkdirSync(directory);
	} else {
		// if it does, remove all files in the directory
		const files = fs.readdirSync(directory);
		for (const file of files) {
			const filePath = path.join(directory, file);
			try {
				fs.unlinkSync(filePath);
			} catch {
				// if we tried to delete a directory, this will blow up
				// but it's actually fine...
			}
		}
	}
});

// load all source class files (these will be included in all builds)
// ORDER IS IMPORTANT! We need ComponentDefinition to be last, so that
//   shadow root processors exist by the time we start processing templates
const processors = fs.readdirSync('src/processors').map((file) => `src/processors/${file}`);
const classFiles = ['src/TramLite.js', ...processors, 'src/ComponentDefinition.js'];

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
// `enclose` determines if the code should be wrapped in an IIFE (which prevents
//   class definitions from colliding).
const buildConfigs = [
	{
		outputFile: 'output/tram-lite.js',
		files: loadedClassFiles,
		defines: { INSTALL: true },
	},
	{
		outputFile: 'output/import-components.js',
		files: { ...loadedClassFiles, ...importComponentClass, ...importScript },
		defines: { INSTALL: false },
		enclose: true,
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
	{ inputFile: 'output/tram-lite.js', outputFile: 'output/tram-lite.min.js' },
	{ inputFile: 'output/import-components.js', outputFile: 'output/import-components.min.js' },
	// build files for use with the export-components script
	...classFiles.map((classFile) => ({
		inputFile: classFile,
		outputFile: classFile.replace('src', 'output/export').replace('.js', '.min.js'),
	})),
	{ inputFile: 'src/ImportComponent.js', outputFile: 'output/export/ImportComponent.min.js' },
];

minifyConfigs.forEach((config) => {
	console.log('minifying', config.outputFile);
	const result = UglifyJS.minify(fs.readFileSync(config.inputFile, 'utf8'), {
		compress: { global_defs: { APP_VERSION: version, INSTALL: false } },
	});
	fs.writeFileSync(config.outputFile, result.code);
});

// do a simple copy for the export-script (needs no minification)
fs.copyFileSync('src/scripts/export-script.js', 'output/export-components.js');

console.log('Tram-Lite build complete!');
