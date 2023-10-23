describe('Tram-Lite Example Components', () => {
	// per Cypress best practices (https://docs.cypress.io/guides/references/best-practices#Creating-Tiny-Tests-With-A-Single-Assertion)
	// it is often better to run all tests together, rather than having unit-like tests... so we'll comment the intent of each test,
	// rather than doing a reset between each test. The results should still be just as obvious in the cypress runner!
	it('should validate all Tram-Lite APIs and Use Cases', () => {
		// visit index.html (this works because the test page doesn't need to be hosted to work!)
		cy.visit('../examples/inline/index.html');

		/* validate that slot elements are rendered as expected in Tram-Lite */
		cy.get('in-title').contains('Title');
		cy.get('in-title').contains('Tram-Lite Components!');

		/* validate that the counter elements work as expected */
		cy.get('in-counter#default').contains(/Green: 0/); // default values should populate
		cy.get('in-counter#red').contains(/Red: 0/); // passed in values should populate
		cy.get('in-counter#red').click(); // clicking a counter should increment
		cy.get('in-counter#red').contains(/Red: 1/);

		/* verify that updating inputs updates attributes as expected (tl-controlled) */
		cy.get('in-mirror').find('input#source').type('Hello, World');
		cy.get('in-mirror').find('input#reflection').should('have.value', 'Hello, World');
		cy.get('in-mirror').should('have.attr', 'value', 'Hello, World');
		cy.get('in-mirror').should('have.attr', 'is-mirrored', '');

		/* verify that updating an attribute copies to multiple elements and attributes */
		cy.get('in-colorpicker').invoke('attr', 'hue', '120');
		cy.get('in-colorpicker').find('input#hue-range-input').should('have.value', '120');
		cy.get('in-colorpicker').find('input#hue-text-input').should('have.value', '120');
		cy.get('in-colorpicker')
			.get('rect')
			.then(($element) => {
				const rawColor = window.getComputedStyle($element[0])['fill'];
				expect(rawColor).to.equal('oklch(0.7 0.1 120)');
			});

		/* verify that startup scripts in component definitions trigger as expected */
		cy.get('in-todoitem').contains('Example Initial Item');
		cy.get('in-todoitem').contains('Learning Tram-Lite');

		/* verify that creating elements works as expected */
		cy.get('in-todolist').find('form input').type('Cypress Test'); // create new todo item
		cy.get('in-todolist').find('form').submit();

		cy.get('in-todoitem').contains('Cypress Test'); // verify it exists

		cy.get('in-todoitem').contains('Cypress Test').click(); // click it, and verify that the top label updates
		cy.get('in-todolist').find('span').contains('(1/3)');

		/* verify that updating an input with a false value unsets the attribute value */
		cy.get('in-todoitem').contains('Cypress Test').click();
		cy.get('in-todolist').find('span').contains('(0/3)');

		/* verify that boolean attributes on controlled elements update when host attributes update */
		cy.get('in-todolist').find('input#select-all').click();
		cy.get('in-todolist').find('span').contains('(3/3)');
		cy.get('in-todoitem').find('input').should('be.checked');

		/* verify that attribute removal also emits events */
		cy.get('in-todolist').find('input#select-all').click(); // deselect all elements
		cy.get('in-todolist').find('span').contains('(0/3)');
		cy.get('in-todoitem').click({ multiple: true }); // manually select all elements
		cy.get('in-todolist').find('span').contains('(3/3)');
		cy.get('in-todolist').find('input#select-all').should('be.checked'); // it should be checked (since all items are selected)
		cy.get('in-todolist').find('input#select-all').click(); // should deselect all elements
		cy.get('in-todolist').find('span').contains('(0/3)');

		/* verify that component effects trigger on dependency updates */
		cy.get('in-temperature').find('input#f').type('19');
		cy.get('in-temperature').find('input#c').should('have.value', '-7');
		cy.get('in-temperature').find('input#f').should('have.value', '19');

		/* verify that an element with multiple dependencies triggers on either dependency */
		cy.get('in-progressbar').should('not.have.attr', 'warning');
		cy.get('in-progressbar').find('input#value').clear().type('12');
		cy.get('in-progressbar').should('have.attr', 'warning');
		cy.get('in-progressbar').find('input#max').clear().type('15');
		cy.get('in-progressbar').should('not.have.attr', 'warning');
	});
});
