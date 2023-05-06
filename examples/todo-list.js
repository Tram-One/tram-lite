define`
	<todo-item>
		<li style="display: block">
			<label>
				<input type="checkbox" onchange="checkItem(this, event)">
				<slot>
			</label>
		</li>
	</todo-item>
`;

function checkItem(input) {
	// trigger an event to the list, so that it can resort accordingly
	input.getRootNode().host.dispatchEvent(new Event('change', { bubbles: true }));
}

define`
  <todo-list>
		<form onsubmit="submitNewTodoItem(this, event)" >
    	<input name="input" placeholder="New Item">
		</form>
		<ul style="padding-inline-start: 5px; margin-block-start: 5px;" onchange="moveListItem(this, event)">
		</ul>
		<script>
			createInitialTodos(this);
		</script>
  </todo-list>
`;

function createInitialTodos(todoList) {
	addNewTodoItem(todoList, 'Example Initial Item');
	addNewTodoItem(todoList, 'Learning Tram-Lite');
}

function addNewTodoItem(todoList, todoText) {
	const list = todoList.shadowRoot.querySelector('ul');
	const newItem = html`<todo-item>${todoText}</todo-item>`;
	list.appendChild(newItem);
}

function submitNewTodoItem(form, event) {
	event.preventDefault();
	const todoList = form.getRootNode().host;
	addNewTodoItem(todoList, form.input.value);
	form.reset();
}

function moveListItem(list, event) {
	const checkInput = event.target.shadowRoot.querySelector('input');
	if (checkInput.checked) {
		list.appendChild(event.target);
	} else {
		list.insertBefore(event.target, list.querySelector('todo-item'));
	}
	checkInput.focus();
}
