const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');
const { version } = require('./package.json');

// ensure the output directory exists
if (!fs.existsSync('output')) {
	fs.mkdirSync('output');
} else {
	// If it exists, read all the files inside the directory and remove them
	const files = fs.readdirSync('output');
	for (const file of files) {
		const filePath = path.join('output', file);
		fs.unlinkSync(filePath);
	}
}

// load all files
const classFiles = ['src/TramLite.js', ...fs.readdirSync('src/processors').map((file) => `src/processors/${file}`)];
const loadedClassFiles = Object.fromEntries(
	classFiles.map((filePath) => {
		console.log('loading', filePath);
		return [filePath, fs.readFileSync(filePath).toString()];
	}),
);

console.log('loading', 'src/import-components.js');
const importComponentClass = {
	'src/ImportComponent.js': fs.readFileSync('src/ImportComponent.js').toString(),
};
console.log('loading', 'src/import-script.js');
const importScript = {
	'src/scripts/import-script.js': fs.readFileSync('src/scripts/import-script.js').toString(),
};

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

setConfigs.forEach((config) => {
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

// Minify
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

// do a simple copy for the export-script
fs.copyFileSync('src/scripts/export-script.js', 'output/export-components.js');

console.log('Build complete!');
