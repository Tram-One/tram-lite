import { registerDom, mount } from '../src';

import { listItem } from './list-item';
import { list } from './list';
import { counter } from './counter';

const html = registerDom({
	'list-item': listItem,
	counter: counter,
	list: list,
});
const app = (props) => {
	return html`
		<main>
			<h1>To Do List!</h1>
			<counter />
			<counter />
			<list />
		</main>
	`;
};

mount(app, document.body);
