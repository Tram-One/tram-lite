describe('Tram-Lite Example Components (via import and inline)', () => {
	it('should validate Tram-Lite APIs and Use Cases when importing and inline defining components', () => {
		// visit index.html
		cy.visit('../examples/hybrid/index.html');

		/* verify that component effects trigger on dependency updates */
		cy.get('in-temperature').get('input#f').type('19');
		cy.get('in-temperature').get('input#c').should('have.value', '-7');
		cy.get('in-temperature').get('input#f').should('have.value', '19');

		/* verify that an element with multiple dependencies triggers on either dependency */
		cy.get('im-progressbar').should('not.have.attr', 'warning');
		cy.get('im-progressbar').get('input#value').clear().type('12');
		cy.get('im-progressbar').should('have.attr', 'warning');
		cy.get('im-progressbar').get('input#max').clear().type('15');
		cy.get('im-progressbar').should('not.have.attr', 'warning');
	});
});
