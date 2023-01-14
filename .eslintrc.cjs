module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	env: {
		// allow document, window, etc (these are expected as a frontend-library)
		browser: true,
	},
	plugins: ['jest', '@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	rules: {
		// as a framework, we have to sometimes just expect anything
		'@typescript-eslint/no-explicit-any': 'off',
		// we shouldn't have console logs in our project
		'no-console': 'error',
		// we allow Function type, because as a framework, we'll generically have funtions
		'@typescript-eslint/ban-types': [
			'error',
			{
				types: {
					Function: false,
				},
				extendDefaults: true,
			},
		],
	},
	overrides: [
		// allow module.exports for config, testing, and docs
		{
			files: [
				'**/*.cjs', // any file with the cjs extension
				'./*.js', // top level config
				'./docs/runkit_example.js', // runkit example
				'./integration-tests/broken-app/**.js', // tests that still need runtime import/export
			],
			env: {
				commonjs: true,
			},
		},

		// configure test files to be in the jest environment
		{
			files: ['integration-tests/**/*', 'performance-tests/**/*'],
			env: {
				jest: true,
			},
			rules: {
				'@typescript-eslint/no-empty-function': 'off',
			},
		},

		// local scripts are expected to run on local machines with node
		{
			files: ['dev-scripts/**/*.js'],
			env: {
				node: true,
			},
		},
	],
};
