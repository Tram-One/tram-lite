import { querySelectorAndMatch } from './querySelectorAndMatch';
import { lookForParentWithContextProp } from './recursiveLookup';
import { Props, TramElement } from './types';

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
			const elementWithAttr = querySelectorAndMatch(obj['tram-element'], `[${String(prop)}]`);
			if (elementWithAttr) {
				const attrValue = elementWithAttr.getAttribute(String(prop));
				if (attrValue) {
					try {
						// try to parse as an object or number
						return JSON.parse(attrValue);
					} catch {
						// if it's actually a string, return that
						return attrValue;
					}
				}
			}

			// check that the element has a `use:<attr>`
			const isUsingContextAttribute = (obj['tram-element'] as TramElement).matches(`[use\\:${String(prop)}]`);
			// TODO - should we check children as well?
			if (isUsingContextAttribute) {
				const parentWithContextAttr = lookForParentWithContextProp(String(prop))(obj['tram-element']);
				if (parentWithContextAttr) {
					const contextAttrValue = parentWithContextAttr.getAttribute(`context:${String(prop)}`);
					if (contextAttrValue) {
						try {
							// try to parse as an object or number
							return JSON.parse(contextAttrValue);
						} catch {
							// if it's actually a string, return that
							return contextAttrValue;
						}
					}
				}
			}
		},
		set(obj, prop, value, reciever) {
			// special attribute 'tram-element' to set what the dom that this proxy mutates
			if (prop === 'tram-element') {
				// no changes required... for now...
				return Reflect.set(obj, prop, value, reciever);
			}

			// -- for all other props, look for the attributes in this tram-element --
			const needsStringification = typeof value !== 'string';
			const attributeSelector = `[${String(prop)}]`;
			// check if any element here has this attribute
			const doesTramElementMatch = obj['tram-element'].matches(attributeSelector);
			const tramElementChildrenThatMatch = obj['tram-element'].querySelectorAll(attributeSelector);
			const elementsWithProp = [
				...(doesTramElementMatch ? [obj['tram-element']] : []),
				...tramElementChildrenThatMatch,
			];
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
