function checkItem(input) {
	// trigger an event to the list, so that it can resort accordingly
	input.getRootNode().host.dispatchEvent(new Event('change', { bubbles: true }));
}

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

function newTodoItem(form, event) {
	event.preventDefault();
	const list = form.getRootNode().querySelector('ul');
	const newItem = html`<todo-item>${form.input.value}</todo-item>`;
	list.appendChild(newItem);
	form.reset();
}

function moveListItem(list, event) {
	const isChecked = event.target.shadowRoot.querySelector('input').checked;
	if (isChecked) {
		list.appendChild(event.target);
	} else {
		list.insertBefore(event.target, list.querySelector('todo-item'));
	}
}

define`
  <todo-list>
		<form onsubmit="newTodoItem(this, event)" >
    	<input name="input" placeholder="New Item">
		</form>
		<ul style="padding-inline-start: 5px; margin-block-start: 5px;" onchange="moveListItem(this, event)">
		</ul>
  </todo-list>
`;

const todoList = html`
	<tram-example>
		<todo-list> </todo-list>
	</tram-example>
`;
document.body.appendChild(todoList);
