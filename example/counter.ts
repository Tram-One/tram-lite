import { registerDom } from '../src';

const html = registerDom();

export const counter = (props) => {
	const incrementCounter = () => {
		props.count = props.count + 1;
	};

	const onUpdateCounter = (event) => {
		event.target.innerHTML = props.count;
	};

	return html`<button count="0" onclick=${incrementCounter} onupdate=${onUpdateCounter}></button>`;
};
