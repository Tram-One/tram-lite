import { registerDom } from '../src';

const html = registerDom();

export const counter = () => {
	let count = 0;
	const incrementCount = () => {
		console.log('COUNTER CLICKED!');
		count++;
	};
	return html` <button onclick=${incrementCount}>${count}</button> `;
};
