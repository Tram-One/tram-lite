import { registerDom } from '../src';

const html = registerDom();

export const counter = (props) => {
	props.count = 0;
	const incrementCount = () => {
		console.log('COUNTER CLICKED!', props.count);
		props.count++;
	};
	return html` <button onclick=${incrementCount} count=${props.count}>Increment Count: ${props.count}</button> `;
};
