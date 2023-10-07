const fs = require('fs');
const UglifyJS = require('uglify-js');
const { version } = require('./package.json');

// load all files
const classFiles = ['src/TramLite.js', ...fs.readdirSync('src/processors').map((file) => `src/processors/${file}`)];
const loadedClassFiles = Object.fromEntries(
	classFiles.map((filePath) => {
		console.log('loading', filePath);
		return [filePath, fs.readFileSync(filePath).toString()];
	}),
);

console.log('loading', 'src/import-component.js');
const importComponent = { 'src/import-component.js': fs.readFileSync('src/import-component.js').toString() };

// Set configurations
const setConfigs = [
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
		outputFile: 'output/import-component.js',
		files: { ...loadedClassFiles, ...importComponent },
		defines: { MODULE: false, INSTALL: false },
		enclose: true,
	},
];

setConfigs.forEach((config) => {
	console.log('building', config.outputFile);
	const options = {
		compress: {
			global_defs: {
				APP_VERSION: version,
				...config.defines,
			},
		},
		output: {
			comments: 'all',
			beautify: true,
			wrap_iife: config.enclose,
		},
	};
	const result = UglifyJS.minify(config.files, options);
	fs.writeFileSync(config.outputFile, result.code);
});

// Minify
const minifyConfigs = [
	{ inputFile: 'output/api.js', outputFile: 'output/api.min.js' },
	{ inputFile: 'output/tram-lite.js', outputFile: 'output/tram-lite.min.js' },
	{ inputFile: 'output/import-component.js', outputFile: 'output/import-component.min.js' },
];

minifyConfigs.forEach((config) => {
	console.log('minifying', config.outputFile);
	const result = UglifyJS.minify(fs.readFileSync(config.inputFile, 'utf8'));
	fs.writeFileSync(config.outputFile, result.code);
});

console.log('Build complete!');
