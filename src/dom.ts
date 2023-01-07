import nanohtml from '@tram-one/nanohtml';
import rbel from '@tram-one/rbel';
import hyperx from '@tram-one/hyperx';
import { Children, Props, Registry, TramElement } from './types.d';
import { observableProps } from './observableProps';
import { newAttributeObserver } from './attributeObserver';

/**
 * This function takes in a registry of custom components,
 * and builds a `dom` template tag function that can take in a template XML string.
 *
 * @param registry mapping of tag names to component functions
 */
export const registerDom = (registry: Registry = {}) => {
	// modify the registry so that each component function updates the hook working key
	const hookedRegistry = Object.keys(registry).reduce((newRegistry, tagName) => {
		const tagFunction = registry[tagName];

		// when we export tag functions, we wrap them with
		// a function to give them special observed props
		const observedTagFunction = (props: Props, children: Children) => {
			// make a proxy props object that when updated
			// will set attributes on elements
			const observedProps = observableProps(props);

			// create the resulting dom
			// (pass in observedProps, so that mutations trigger proxy-effects)
			const result = tagFunction(observedProps, children);
			observedProps['tram-element'] = result;

			// trigger all the `onupdate` effects (to set initial values)
			// NEW TODO: this should only happen when the component mounts (otherwise we won't have context data)
			[result, ...result.querySelectorAll('*')]
				.filter((element) => (element as TramElement).events?.includes('onupdate'))
				.forEach((element) => (element as TramElement).onupdate?.({ target: element }));

			// setup the mutation observer on the resulting dom
			const attributeObserver = newAttributeObserver();
			attributeObserver.observe(result, { attributes: true, subtree: true });

			// return the final result dom
			return result;
		};

		return { ...newRegistry, [tagName]: observedTagFunction };
	}, {});

	return rbel(hyperx, nanohtml(), hookedRegistry);
};
