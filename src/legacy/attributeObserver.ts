import { TramElement } from '../types';

// set up a mutation effect to trigger side-effects when
// attributes are updated
const observeAttrChanges = (mutationList: MutationRecord[]) => {
	mutationList.forEach((mutationRecord) => {
		// if this element contains an `onupdate`, trigger those events
		if ((mutationRecord.target as TramElement)?.events?.includes('onupdate')) {
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

export const newAttributeObserver = () => new MutationObserver(observeAttrChanges);
