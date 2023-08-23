# Cheat Sheet

This page contains some basic common patterns that developers have found useful when building projects with Tram-Lite.

## Basic template

When building a new component, you can define the styles and initial javascript all in the component.

```js
define`
	<color-picker color="blue">
		<style>
			/* component specific styles */
			/* these will be scoped to just this component */
		</style>
		<!-- your html -->
		<script>
			/* call any initialization your component might need */
			// you can reference "this" to get a pointer to this component
		</script>
	</color-picker>
`;
```

## Get the root web-component node

If the javascript you call has access to an element in a web-component, you can use `getRootNode().host` to access the
web-component instance.

```js
const colorPicker = input.getRootNode().host;

colorPicker.getAttribute('color');
```

## Query an element in a web-component

When you need to interact with elements inside a web-component, use `shadowRoot`.

```js
const input = colorPicker.shadowRoot.querySelector('input');
colorPicker.setAttribute('color', input.value);
```

## Dispatching events across web-components

If you want to notify parent elements of a change, you can dispatch events up (and through shadow DOM).

```js
input.dispatchEvent(
	new CustomEvent('color-changed', { bubbles: true, composed: true, detail: { color: event.target.value } })
);

// elsewhere
colorConsumer.addEventListener('color-changed', (event) => {
	const newColor = event.detail.color;
	colorConsumer.setAttribute('color', newColor);
});
```

## Style host element of a web-component

If you want to style the host element from inside a web-component, you can use `:host`. This can be useful when the
parent element is inside a grid or flexbox.

```js
define`
	<color-picker color="blue">
		<style>
			:host {
				border: 1px solid red;
			}
		</style>
	</color-picker>
`;
```

Read More here: https://css-tricks.com/web-component-pseudo-classes-and-pseudo-elements/
