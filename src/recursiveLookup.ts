import { TramElement } from './types.d';

type recursiveLoookup = [(element: TramElement | null) => TramElement | null][0];
export const lookForParentWithContextProp = (prop: string) => {
	const lookForParentWithContext: recursiveLoookup = (element: TramElement | null) => {
		if (!element) return null;
		if (element.hasAttribute(`context:${String(prop)}`)) {
			return element;
		}
		return lookForParentWithContext(element.parentElement);
	};
	return lookForParentWithContext;
};
