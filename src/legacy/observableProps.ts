import { queryElementOrChild } from './queryElementOrChild';
import { lookForParentWithContextProp } from './recursiveLookup';
import { safeParse } from './safeParse';
import { Props, TramElement } from '../types';
import { queryElementAndChildren } from './queryElementAndChildren';

/**
 * Observable Props is a Proxy object that looks at the Tram-Element
 * on the DOM and can read / write attributes on the DOM when interacted with
 * @param props
 * @returns Proxy Object that can interact with DOM
 */
export const observableProps = (props: Props) => {
	return new Proxy(props, {
		get(obj, prop, reciever) {
			// check if this proxy object has the attribute (like a passed in prop)
			const hasAttribute = prop in obj;
			if (hasAttribute) {
				try {
					// try to parse as an object or number
					return JSON.parse(obj[String(prop)]);
				} catch {
					// if it's actually a string, return that
					return Reflect.get(obj, prop, reciever);
				}
			}

			// if not, it's an attribute on the DOM
			// first - check that there is a tram-element!
			const hasElement = 'tram-element' in obj;
			if (!hasElement) return undefined;

			// check if the element (or child element) has the attribute
			const elementWithAttr = queryElementOrChild(obj['tram-element'], `[${String(prop)}]`);
			if (elementWithAttr) {
				const attrValue = elementWithAttr.getAttribute(String(prop));
				return safeParse(attrValue);
			}

			// check that the element has a `use:<attr>`
			const isUsingContextAttribute = (obj['tram-element'] as TramElement).matches(`[use\\:${String(prop)}]`);
			// TODO - should we check children as well?
			if (isUsingContextAttribute) {
				const parentWithContextAttr = lookForParentWithContextProp(String(prop))(obj['tram-element']);
				if (parentWithContextAttr) {
					const contextAttrValue = parentWithContextAttr.getAttribute(`context:${String(prop)}`);
					return safeParse(contextAttrValue);
				}
			}
		},
		set(obj, prop, value, reciever) {
			// special attribute 'tram-element' to set what the dom that this proxy mutates
			if (prop === 'tram-element') {
				// no changes required... for now...
				return Reflect.set(obj, prop, value, reciever);
			}

			// TODO - if Reflect.get(obj, prop, reciever); is true, this
			// prop is something that was passed in, and can not be re-written
			// (or, if it is, it won't be read on subsequent updates, untless we allow that behavior)

			// -- for all other props, look for the attributes in this tram-element --
			const needsStringification = typeof value !== 'string';
			const attributeSelector = `[${String(prop)}]`;
			// check if any element here has this attribute
			const elementsWithProp = queryElementAndChildren(obj['tram-element'], attributeSelector);
			const elementHasProp = elementsWithProp.length > 0;
			if (elementHasProp) {
				elementsWithProp.forEach((element) => {
					element.setAttribute(String(prop), needsStringification ? JSON.stringify(value) : value);
				});
				return true;
			}
			// check if this element is reading a context version of this prop
			const usingAttributeSelector = `[use\\:${String(prop)}]`;
			const elementUsingContext = obj['tram-element'].matches(usingAttributeSelector);
			const tramElementChildrenUsingContext = obj['tram-element'].querySelectorAll(usingAttributeSelector);
			const elementsUsingContext = [
				...(elementUsingContext ? [obj['tram-element']] : []),
				...tramElementChildrenUsingContext,
			];
			const elementUsingContextProp = elementsUsingContext.length > 0;
			if (elementUsingContextProp) {
				// if this element is "using" this attribute, look up the tree for the "context" version
				const parentWithProp = lookForParentWithContextProp(String(prop))(obj['tram-element']);
				if (parentWithProp) {
					parentWithProp.setAttribute(`context:${String(prop)}`, needsStringification ? JSON.stringify(value) : value);
					return true;
				}
			}

			// should probably throw an error here
			return false;
		},
	});
};
