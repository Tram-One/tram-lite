define`
	<todo-item checked="">
		<label style="display: block">
			<input type="checkbox" onchange="onTodoItemCheck(this)">
			<slot>
		</label>
	</todo-item>
`;

function onTodoItemCheck(input) {
	const todoItem = input.getRootNode().host;
	todoItem.setAttribute('checked', todoItem.checked);
}

define`
  <todo-list completed="0" total="0">
		<style>
			section {
				padding-inline-start: 5px;
				margin-block-start: 5px;
			}
		</style>
		<span>To Do List (${'completed'}/${'total'})</span>
		<form onsubmit="submitNewTodoItem(this, event)" >
    	<input name="input" placeholder="New Item" autofill="false">
		</form>
		<section></section>
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
	const list = todoList.shadowRoot.querySelector('section');
	const newItem = html`<todo-item>${todoText}</todo-item>`;
	addAttributeListener(newItem, 'checked', () => updateTotalAndCompletedLabel(todoList));
	list.appendChild(newItem);

	updateTotalAndCompletedLabel(todoList);
}

function submitNewTodoItem(form, event) {
	event.preventDefault();
	const todoList = form.getRootNode().host;
	addNewTodoItem(todoList, form.input.value);
	form.reset();
}

function updateTotalAndCompletedLabel(todoList) {
	// query all list items to determine new completed and total
	const todoItems = todoList.shadowRoot.querySelectorAll('todo-item');
	todoList.setAttribute('total', todoItems.length);
	const completedItems = todoList.shadowRoot.querySelectorAll('todo-item[checked]');
	todoList.setAttribute('completed', completedItems.length);
}
