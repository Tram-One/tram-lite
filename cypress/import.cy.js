describe('Tram-Lite Example Components (via import)', () => {
	it('should validate Tram-Lite APIs and Use Cases when importing components', () => {
		// visit index.html
		cy.visit('../examples/import/index.html');

		/* copied from inline tests */
		cy.get('ex-temperature').get('input#f').type('19');
		cy.get('ex-temperature').get('input#c').should('have.value', '-7');
		cy.get('ex-temperature').get('input#f').should('have.value', '19');

		/* copied from inline tests */
		cy.get('ex-progressbar').should('not.have.attr', 'warning');
		cy.get('ex-progressbar').get('input#value').clear().type('12');
		cy.get('ex-progressbar').should('have.attr', 'warning');
		cy.get('ex-progressbar').get('input#max').clear().type('15');
		cy.get('ex-progressbar').should('not.have.attr', 'warning');

		/* copied from inline tests */
		cy.get('ex-colorpicker').invoke('attr', 'hue', '120');
		cy.get('ex-colorpicker').get('input#hue-range-input').should('have.value', '120');
		cy.get('ex-colorpicker').get('input#hue-text-input').should('have.value', '120');
		cy.get('ex-colorpicker')
			.get('rect')
			.then(($element) => {
				const rawColor = window.getComputedStyle($element[0])['fill'];
				expect(rawColor).to.equal('oklch(0.7 0.1 120)');
			});
	});
});
