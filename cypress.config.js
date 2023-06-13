const { defineConfig } = require('cypress');

module.exports = defineConfig({
	e2e: {
		specPattern: '**.cy.js',
		supportFile: false,
		includeShadowDom: true,
	},
});
