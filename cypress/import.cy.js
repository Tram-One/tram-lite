describe('Tram-Lite Example Components (via import)', () => {
	it('should validate Tram-Lite APIs and Use Cases when importing components', () => {
		// visit index.html (this works because the test page doesn't need to be hosted to work!)
		cy.visit('../examples/import/index.html');

		/* verify that component effects trigger on dependency updates */
		cy.get('im-temperature').get('input#f').type('19');
		cy.get('im-temperature').get('input#c').should('have.value', '-7');
		cy.get('im-temperature').get('input#f').should('have.value', '19');

		/* verify that an element with multiple dependencies triggers on either dependency */
		cy.get('im-progressbar').should('not.have.attr', 'warning');
		cy.get('im-progressbar').get('input#value').clear().type('12');
		cy.get('im-progressbar').should('have.attr', 'warning');
		cy.get('im-progressbar').get('input#max').clear().type('15');
		cy.get('im-progressbar').should('not.have.attr', 'warning');
	});
});
