describe('Tram-Lite Example Components (via import and inline)', () => {
	it('should validate Tram-Lite APIs and Use Cases when importing and inline defining components', () => {
		// visit index.html
		cy.visit('../examples/hybrid/index.html');

		/* copied from inline tests, verify inline defined element */
		cy.get('in-temperature').find('input#f').type('19');
		cy.get('in-temperature').find('input#c').should('have.value', '-7');
		cy.get('in-temperature').find('input#f').should('have.value', '19');

		/* copied from inline tests, verify the external component imported works */
		cy.get('ex-progressbar').should('not.have.attr', 'warning');
		cy.get('ex-progressbar').find('input#value').clear().type('12');
		cy.get('ex-progressbar').should('have.attr', 'warning');
		cy.get('ex-progressbar').find('input#max').clear().type('15');
		cy.get('ex-progressbar').should('not.have.attr', 'warning');

		/* copied from inline tests, verify that external component exported works */
		cy.get('ex-colorpicker').invoke('attr', 'hue', '120');
		cy.get('ex-colorpicker').find('input#hue-range-input').should('have.value', '120');
		cy.get('ex-colorpicker').find('input#hue-text-input').should('have.value', '120');
		cy.get('ex-colorpicker')
			.get('rect')
			.then(($element) => {
				const rawColor = window.getComputedStyle($element[0])['fill'];
				expect(rawColor).to.equal('oklch(0.7 0.1 120)');
			});

		/* copied from inline tests, verify that imported component side-effects work as expected */
		cy.get('ex-todoitem').contains('Example Initial Item');
		cy.get('ex-todoitem').contains('Learning Tram-Lite');

		cy.get('ex-todolist').find('form input').type('Cypress Test'); // create new todo item
		cy.get('ex-todolist').find('form').submit();

		cy.get('ex-todoitem').contains('Cypress Test'); // verify it exists

		cy.get('ex-todoitem').contains('Cypress Test').click(); // click it, and verify that the top label updates
		cy.get('ex-todolist').find('span').contains('(1/3)');

		cy.get('ex-todoitem').contains('Cypress Test').click();
		cy.get('ex-todolist').find('span').contains('(0/3)');

		cy.get('ex-todolist').find('input#select-all').click();
		cy.get('ex-todolist').find('span').contains('(3/3)');
		cy.get('ex-todoitem').find('input').should('be.checked');

		cy.get('ex-todolist').find('input#select-all').click(); // deselect all elements
		cy.get('ex-todolist').find('span').contains('(0/3)');
		cy.get('ex-todoitem').click({ multiple: true }); // manually select all elements
		cy.get('ex-todolist').find('span').contains('(3/3)');
		cy.get('ex-todolist').find('input#select-all').should('be.checked'); // it should be checked (since all items are selected)
		cy.get('ex-todolist').find('input#select-all').click(); // should deselect all elements
		cy.get('ex-todolist').find('span').contains('(0/3)');
	});
});
