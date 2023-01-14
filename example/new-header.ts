import { registerDom } from '../src';

const html = registerDom();

export const newHeader = ({ color = 'initial' }) => {
	return html`
		<header>
			<h1 style="color: ${color}">Tram-Lite</h1>
		</header>
	`;
};
