describe('Tram-Lite Example Components', () => {
	// per Cypress best practices (https://docs.cypress.io/guides/references/best-practices#Creating-Tiny-Tests-With-A-Single-Assertion)
	// it is often better to run all tests together, rather than having unit-like tests... so we'll comment the intent of each test,
	// rather than doing a reset between each test. The results should still be just as obvious in the cypress runner!
	it('should validate all Tram-Lite APIs and Use Cases', () => {
		// visit index.html (this works because the test page doesn't need to be hosted to work!)
		cy.visit('../examples/index.html');

		/* validate that slot elements are rendered as expected in Tram-Lite */
		cy.get('tram-title').contains('Title');
		cy.get('tram-title').contains('Tram-Lite Components!');

		/* validate that the counter elements, when defined using an external template (html-import), work as expected */
		cy.get('template-counter#temp-default').contains(/Green: 0/); // default values should populate
		cy.get('template-counter#temp-red').contains(/Red: 0/); // passed in values should populate
		cy.get('template-counter#temp-red').click(); // clicking a counter should increment
		cy.get('template-counter#temp-red').contains(/Red: 1/);

		/* repeat the above tests for a component definition using an inline template (template is="component-definition") */
		cy.get('inline-counter#inline-default').contains(/Green: 0/);
		cy.get('inline-counter#inline-red').contains(/Red: 0/);
		cy.get('inline-counter#inline-red').click();
		cy.get('inline-counter#inline-red').contains(/Red: 1/);

		/* and finally, do so for a javascript defined component (define`...`) */
		cy.get('js-counter#js-default').contains(/Green: 0/);
		cy.get('js-counter#js-red').contains(/Red: 0/);
		cy.get('js-counter#js-red').click();
		cy.get('js-counter#js-red').contains(/Red: 1/);

		/* verify that updating inputs updates attributes as expected (updateRootAttr) */
		cy.get('input#source').type('Hello, World');
		cy.get('input#reflection').should('have.value', 'Hello, World');
		cy.get('tram-mirror').should('have.attr', 'is-mirrored', '');

		/* verify that updating an attribute copies to multiple elements and attributes */
		cy.get('color-picker').invoke('attr', 'hue', '120');
		cy.get('input#hue-range-input').should('have.value', '120');
		cy.get('input#hue-text-input').should('have.value', '120');
		cy.get('rect').then(($element) => {
			const rawColor = window.getComputedStyle($element[0])['fill'];
			expect(rawColor).to.equal('oklch(0.7 0.1 120)');
		});

		/* verify that startup scripts in component definitions trigger as expected */
		cy.get('todo-item').contains('Example Initial Item');
		cy.get('todo-item').contains('Learning Tram-Lite');

		/* verify that creating elements works as expected (html`...`) */
		cy.get('todo-list').get('form input').type('Cypress Test'); // create new todo item
		cy.get('todo-list').get('form').submit();

		cy.get('todo-item').contains('Cypress Test'); // verify it exists

		cy.get('todo-item').contains('Cypress Test').click(); // click it, and verify that the top label updates
		cy.get('todo-list').get('span').contains('(1/3)');

		/* verify that updating an input with a false value unsets the attribute value */
		cy.get('todo-item').contains('Cypress Test').click();
		cy.get('todo-list').get('span').contains('(0/3)');

		/* verify that creating svg elements works as expected (svg`...`) */
		cy.get('line-drawer').get('button#svg-button').click();
		cy.get('line-drawer').get('line').should('have.attr', 'stroke', 'white');

		/* verify that multiple inline element definitions are successful */
		cy.get('tooltip-example').contains('Tooltips!');
		cy.get('tooltip-example').contains('Hello!');

		/* verify that component effects trigger on dependency updates */
		cy.get('temperature-converter').get('input#f').type('19');
		cy.get('temperature-converter').get('input#c').should('have.value', '-7');
		cy.get('temperature-converter').get('input#f').should('have.value', '19');
		cy.get('temperature-converter').contains('Updated!');
	});
});
