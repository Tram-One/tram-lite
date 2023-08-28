describe('Tram-Lite Example Components', () => {
	beforeEach(() => {
		cy.visit('../examples/index.html');
	});
	it('should render a component with a slot', () => {
		cy.get('tram-title').contains('Title');
		cy.get('tram-title').contains('Tram-Lite Components!');
	});
	describe('when using external template', () => {
		it('should template default values', () => {
			cy.get('temp-counter#temp-default').contains(/Green: 0/);
		});
		it('should template passed in values', () => {
			cy.get('temp-counter#temp-red').contains(/Red: 0/);
		});
		it('should update templates on attribute change', () => {
			cy.get('temp-counter#temp-red').click();
			cy.get('temp-counter#temp-red').contains(/Red: 1/);
		});
	});
	describe('when using inline template', () => {
		it('should template default values', () => {
			cy.get('inline-counter#inline-default').contains(/Green: 0/);
		});
		it('should template passed in values', () => {
			cy.get('inline-counter#inline-red').contains(/Red: 0/);
		});
		it('should update templates on attribute change', () => {
			cy.get('inline-counter#inline-red').click();
			cy.get('inline-counter#inline-red').contains(/Red: 1/);
		});
	});
	describe('when using javascript defined component', () => {
		it('should template default values', () => {
			cy.get('js-counter#js-default').contains(/Green: 0/);
		});
		it('should template passed in values', () => {
			cy.get('js-counter#js-red').contains(/Red: 0/);
		});
		it('should update templates on attribute change', () => {
			cy.get('js-counter#js-red').click();
			cy.get('js-counter#js-red').contains(/Red: 1/);
		});
	});
	it('should update the value for inputs via template changes', () => {
		cy.get('input#source').type('Hello, World');
		cy.get('input#reflection').should('have.value', 'Hello, World');
	});
	it('should update multiple element templates', () => {
		cy.get('color-picker').invoke('attr', 'hue', '120');
		cy.get('input#hue-range-input').should('have.value', '120');
		cy.get('input#hue-text-input').should('have.value', '120');
		cy.get('rect').then(($element) => {
			const rawColor = window.getComputedStyle($element[0])['fill'];
			expect(rawColor).to.equal('oklch(0.7 0.1 120)');
		});
	});
	it('should execute script tags', () => {
		cy.get('todo-item').contains('Example Initial Item');
		cy.get('todo-item').contains('Learning Tram-Lite');
	});
	it('should support creating elements at runtime', () => {
		// create new todo item
		cy.get('todo-list').get('form input').type('Cypress Test');
		cy.get('todo-list').get('form').submit();

		// verify it exists
		cy.get('todo-item').contains('Cypress Test');

		// click it, and verify that the top label updates
		cy.get('todo-item').contains('Cypress Test').click();
		cy.get('todo-list').get('span').contains('(1/3)');
	});
	it('should remove attributes when set to false', () => {
		// click a todo item, verify the top label updates, and then unclick it, verify it says 0/2 selected
		cy.get('todo-item').contains('Example Initial Item').click();
		cy.get('todo-list').get('span').contains('(1/2)');
		cy.get('todo-item').contains('Example Initial Item').click();
		cy.get('todo-list').get('span').contains('(0/2)');
	});
	it('should create svg elements', () => {
		cy.get('line-drawer').get('button#svg-button').click();
		cy.get('line-drawer').get('line').should('have.attr', 'stroke', 'white');
	});
});
