import { Registry } from '../types';

// since all tags in the DOM are capitalized, capitalize all the ones in the registry
const formatRegistry = (registry: Registry) => {
	return Object.entries(registry).reduce((workingRegistry, [tag, component]) => {
		return { ...workingRegistry, [tag.toUpperCase()]: component };
	}, {}) as Registry;
};

// if the added Nodes have a tag name that matches something in the registry,
// we need to call the function and inject that element
export const processNewNodes = (registry: Registry, newNodes: Node[]) => {
	const formattedRegistry = formatRegistry(registry);
	// if the added Nodes have a tag name that matches something in the registry,
	// we need to call the function and inject that element
	newNodes.forEach((addedNode) => {
		const tagName = (addedNode as HTMLElement).tagName;
		if (tagName in formattedRegistry) {
			// pull props from this component
			const props = [...(addedNode as HTMLElement).attributes].reduce(
				(attrs, attr) => ({ ...attrs, [attr.name]: attr.value }),
				{}
			);

			// pull children from this component
			// we move these to a new element so that they are removed from this one
			const childContainer = document.createElement('div');
			[...addedNode.childNodes].forEach((child) => {
				childContainer.appendChild(child);
			});

			// call the registry function, and replace this element with that one
			const newComponent = formattedRegistry[tagName](props, childContainer.childNodes);
			addedNode.appendChild(newComponent);
		}
	});
};

// mutation observer for registered custom-elements
const observeAndInjectRegistryElements = (registry: Registry = {}) => {
	// function to handle mutations in the dom
	return (mutationList: MutationRecord[]) => {
		mutationList.forEach((mutationRecord) => {
			// get all the nodes (and their children) for the added Nodes
			const allNewNodes = [...mutationRecord.addedNodes].flatMap((newNode) => {
				// determine if this is a text node, or an element
				const isTextNode = newNode.nodeType === Node.TEXT_NODE;
				if (!isTextNode) {
					return [newNode, ...(newNode as HTMLElement).querySelectorAll('*')];
				}
				return [];
			});

			// if the added Nodes have a tag name that matches something in the registry,
			// we need to call the function and inject that element
			processNewNodes(registry, allNewNodes);
		});
	};
};

export const newRegistryObserver = (registry: Registry) => {
	const observerForRegistry = observeAndInjectRegistryElements(registry);
	return new MutationObserver(observerForRegistry);
};
