describe('Tram-Lite Example Components (via import and inline)', () => {
	it('should validate Tram-Lite APIs and Use Cases when importing and inline defining components', () => {
		// visit index.html
		cy.visit('../examples/hybrid/index.html');

		/* copied from inline tests, verify inline defined element */
		cy.get('in-temperature').get('input#f').type('19');
		cy.get('in-temperature').get('input#c').should('have.value', '-7');
		cy.get('in-temperature').get('input#f').should('have.value', '19');

		/* copied from inline tests, verify the external component imported works */
		cy.get('ex-progressbar').should('not.have.attr', 'warning');
		cy.get('ex-progressbar').get('input#value').clear().type('12');
		cy.get('ex-progressbar').should('have.attr', 'warning');
		cy.get('ex-progressbar').get('input#max').clear().type('15');
		cy.get('ex-progressbar').should('not.have.attr', 'warning');

		/* copied from inline tests, verify that external component exported works */
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
