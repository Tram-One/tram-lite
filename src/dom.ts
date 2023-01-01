import nanohtml from '@tram-one/nanohtml';
import rbel from '@tram-one/rbel';
import hyperx from '@tram-one/hyperx';
import { Children, Props, Registry, TramElement } from './types.d';
import { observableProps } from './observableProps';

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
			// set the observeredProps to the element so that we can update it's props
			// result.observedProps = observedProps;

			// trigger all the `onupdate` effects (to set initial values)
			// TODO: should this only happen on initial mount?
			[result, ...result.querySelectorAll('*')]
				.filter((element) => (element as TramElement).events?.includes('onupdate'))
				.forEach((element) => (element as TramElement).onupdate?.({ target: element }));

			// set up a mutation effect to trigger side-effects when
			// attributes are updated
			const observeAttrChanges = (mutationList: MutationRecord[]) => {
				mutationList.forEach((mutationRecord) => {
					// if this element contains an `onupdate`, trigger those events
					if ((mutationRecord.target as TramElement).events?.includes('onupdate')) {
						(mutationRecord.target as any).onupdate({ target: mutationRecord.target });
					}
					// if the attribute changed was a context attribute,
					// trigger the onupdate for those children with this prop
					if (mutationRecord.attributeName?.match(/context:/)) {
						const propName = mutationRecord.attributeName.replace('context:', '');
						const updateTargets = (mutationRecord.target as TramElement).querySelectorAll(`[use\\:${propName}]`);
						[...updateTargets].forEach((element) => {
							if ((element as any).events?.includes('onupdate')) {
								(element as any).onupdate({ target: element });
							}
						});
					}
				});
			};

			// setup the mutation observer on the resulting dom
			const attributeObserver = new MutationObserver(observeAttrChanges);
			attributeObserver.observe(result, { attributes: true, subtree: true });

			// return the final result dom
			return result;
		};

		return { ...newRegistry, [tagName]: observedTagFunction };
	}, {});

	return rbel(hyperx, nanohtml(), hookedRegistry);
};
