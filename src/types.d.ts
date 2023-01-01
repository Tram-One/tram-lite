type onUpdateEventProps = { target: Element };

export interface TramElement extends HTMLElement {
	events?: string[];
	onupdate?: ({ target }: onUpdateEventProps) => void;
	// observedProps?: any;
}

/**
 * Type for custom Tram One Components.
 * They can take in props and children, and return some rendered Element.
 */
export type TramComponent<PropsInterface extends Props = Props, ChildrenInterface extends Children = Children> = [
	(props: PropsInterface, children: ChildrenInterface) => TramElement
][0];

/**
 * Type for the Root TramComponent,
 * it can have no props or children, since it is the root element
 */
export type RootTramComponent = TramComponent<{ [attribute: string]: never }, undefined>;

/**
 * Type for registering Tram One Components in the template interface.
 * This is used in registerHtml and registerSvg.
 */
export type Registry = [
	{
		// we use <any, any> here since in the Registry we can't be as explicit about the types being provided
		// - for now lean on the end-user to know what types are required and passing them in
		[tag: string]: TramComponent<any, any>;
	}
][0];

/**
 * The Props interface for custom Tram One Components.
 * These are all user defined, if any
 */
export type Props = [
	{
		[attribute: string]: any;
	}
][0];

/**
 * The Children interface for custom Tram One Components.
 * If the tag is self-closing, it will be `undefined`, otherwise it will
 * be a list of strings and DOM Elements
 */
export type Children = [(Element | string)[] | undefined][0];
