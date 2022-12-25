import { registerDom } from './dom';
import { TramComponent } from './types';

/**
 * Updates a container with an initial component for the first render.
 * @param component the tram-lite component to render
 * @param container an element to render the component on
 */
export const mount = (component: TramComponent, container: HTMLElement) => {
	const html = registerDom({
		app: component,
	});

	const app = html`<tram-lite><app /></tram-lite>`;

	container.appendChild(app);
};
