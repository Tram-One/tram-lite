import { registerDom } from '../src';
import { listItem } from './list-item';

const html = registerDom({
	'list-item': listItem,
});

export const list = (props) => {
	const updateList = (keyEvent) => {
		if (keyEvent.charCode === 13) {
			// get text content of input
			const newElement = keyEvent.target.value;

			// get the current elements, split and rejoin
			props.elements = props.elements.concat({ id: `li-${props.total + 1}`, name: newElement });
			props.total = `${props.total + 1}`;

			// clear input
			keyEvent.target.value = '';
		}
	};

	const onUpdateList = (event) => {
		props.elements.forEach((element) => {
			// if the element doesn't already exist, create it, and append it to the dom
			if (!event.target.querySelector(`#${element.id}`)) {
				const onRemove = () => {
					const listElements = props.elements;
					const filteredElements = listElements.filter((listElement) => listElement.id !== element.id);
					props.elements = filteredElements;
				};
				const liElement = html`<list-item id=${element.id} onremove=${onRemove}>${element.name}</list-item>`;
				event.target.appendChild(liElement);
			}
		});
		// if there are any elements that shouldn't exist anymore, remove them
		const elementIds = props.elements.map((element) => element.id);
		[...event.target.children].forEach((listElement) => {
			if (!elementIds.includes(listElement.id)) {
				listElement.remove();
			}
		});
	};

	const initialElement = [
		{
			id: 'li-0',
			name: 'Test Application',
		},
	];

	return html`
		<section total="1">
			<input onkeypress=${updateList} />
			<ol elements=${JSON.stringify(initialElement)} onupdate=${onUpdateList}></ol>
		</section>
	`;
};
