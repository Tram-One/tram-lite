import { processFunctionPlaceholders } from '../processFunctionPlaceholders';

// mutation observer to attach real functions to elements
const observeFunctionAttributes =
	(functionPlaceholders: { [key: string]: Function }) => (mutationList: MutationRecord[]) => {
		mutationList.forEach((mutationRecord) => {
			const addedNodes = [...mutationRecord.addedNodes] as Element[];
			console.log(addedNodes);
			processFunctionPlaceholders(functionPlaceholders, addedNodes);
		});
	};

export const newFunctionObserver = (functionPlaceholders: { [key: string]: Function }) => {
	const observerForFunctionAttrs = observeFunctionAttributes(functionPlaceholders);
	return new MutationObserver(observerForFunctionAttrs);
};
