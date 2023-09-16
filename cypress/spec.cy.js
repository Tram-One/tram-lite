describe('Tram-Lite Example Components', () => {
	// per Cypress best practices (https://docs.cypress.io/guides/references/best-practices#Creating-Tiny-Tests-With-A-Single-Assertion)
	// it is often better to run all tests together, rather than having unit-like tests... so we'll comment the intent of each test,
	// rather than doing a reset between each test. The results should still be just as obvious in the cypress runner!
	it('should validate all Tram-Lite APIs and Use Cases', () => {
		// visit index.html (this works because the test page doesn't need to be hosted to work!)
		cy.visit('../examples/index.html');

		/* validate that slot elements are rendered as expected in Tram-Lite */
		cy.get('ex-title').contains('Title');
		cy.get('ex-title').contains('Tram-Lite Components!');

		/* validate that the counter elements work as expected */
		cy.get('ex-counter#default').contains(/Green: 0/); // default values should populate
		cy.get('ex-counter#red').contains(/Red: 0/); // passed in values should populate
		cy.get('ex-counter#red').click(); // clicking a counter should increment
		cy.get('ex-counter#red').contains(/Red: 1/);

		/* verify that updating inputs updates attributes as expected (tl-controlled) */
		cy.get('ex-mirror').get('input#source').type('Hello, World');
		cy.get('ex-mirror').get('input#reflection').should('have.value', 'Hello, World');
		cy.get('ex-mirror').should('have.attr', 'value', 'Hello, World');
		cy.get('ex-mirror').should('have.attr', 'is-mirrored', '');

		/* verify that updating an attribute copies to multiple elements and attributes */
		cy.get('ex-colorpicker').invoke('attr', 'hue', '120');
		cy.get('ex-colorpicker').get('input#hue-range-input').should('have.value', '120');
		cy.get('ex-colorpicker').get('input#hue-text-input').should('have.value', '120');
		cy.get('ex-colorpicker')
			.get('rect')
			.then(($element) => {
				const rawColor = window.getComputedStyle($element[0])['fill'];
				expect(rawColor).to.equal('oklch(0.7 0.1 120)');
			});

		/* verify that startup scripts in component definitions trigger as expected */
		cy.get('ex-todoitem').contains('Example Initial Item');
		cy.get('ex-todoitem').contains('Learning Tram-Lite');

		/* verify that creating elements works as expected */
		cy.get('ex-todolist').get('form input').type('Cypress Test'); // create new todo item
		cy.get('ex-todolist').get('form').submit();

		cy.get('ex-todoitem').contains('Cypress Test'); // verify it exists

		cy.get('ex-todoitem').contains('Cypress Test').click(); // click it, and verify that the top label updates
		cy.get('ex-todolist').get('span').contains('(1/3)');

		/* verify that updating an input with a false value unsets the attribute value */
		cy.get('ex-todoitem').contains('Cypress Test').click();
		cy.get('ex-todolist').get('span').contains('(0/3)');

		/* verify that component effects trigger on dependency updates */
		cy.get('ex-temperature').get('input#f').type('19');
		cy.get('ex-temperature').get('input#c').should('have.value', '-7');
		cy.get('ex-temperature').get('input#f').should('have.value', '19');

		/* verify that an element with multiple dependencies triggers on either dependency */
		cy.get('ex-progressbar').should('not.have.attr', 'warning');
		cy.get('ex-progressbar').get('input#value').clear().type('12');
		cy.get('ex-progressbar').should('have.attr', 'warning');
		cy.get('ex-progressbar').get('input#max').clear().type('15');
		cy.get('ex-progressbar').should('not.have.attr', 'warning');
	});
});
