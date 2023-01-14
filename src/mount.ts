import { registerDom } from './dom';
import { TramComponent } from './types';

/**
 * Updates a container with an initial component for the first render.
 * @param component the tram-lite component to render
 * @param container an element to render the component on
 */
export const mount = (component: TramComponent, container: HTMLElement) => {
	// setup the mutation observer on the initial container
	// this will force updates on children when attributes (or dom) changes
	// const attributeObserver = newAttributeObserver();
	// attributeObserver.observe(container, { attributes: true, subtree: true });

	const html = registerDom({
		app: component,
	});

	const app = html`<tram-lite><app /></tram-lite>`;

	container.appendChild(app);
};
