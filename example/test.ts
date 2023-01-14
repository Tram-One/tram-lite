import { registerDom, mount } from '../src';
import { counter } from './counter';
import { newHeader } from './new-header';

const html = registerDom({
	'new-header': newHeader,
	counter: counter,
});

const app = () => {
	return html`
		<main>
			<new-header color="lightblue">Tram-Lite</new-header>
			<code>Take Two</code>
			<counter />
		</main>
	`;
};

mount(app, document.body);
