<p align="center"><a href="http://tram-one.io/" target="_blank"><img src="https://unpkg.com/@tram-one/tram-logo@4" width="128"></a></p>

<div align="center">
  <a href="https://www.npmjs.com/package/tram-lite">
    <img src="https://img.shields.io/npm/dm/tram-lite.svg" alt="Downloads">
  </a>
  <a href="https://www.npmjs.com/package/tram-lite">
    <img src="https://img.shields.io/npm/v/tram-lite.svg" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/tram-lite">
    <img src="https://img.shields.io/npm/l/tram-lite.svg" alt="License">
  </a>
    <a href="https://discord.gg/dpBXAQC">
    <img src="https://img.shields.io/badge/discord-join-5865F2.svg?style=flat" alt="Join Discord">
  </a>
</div>

# Tram-Lite

Tram-Lite is a library that helps developers build native web-components, and makes building simple native javascript applications easier and more elegant!

## Installation

Tram-Lite is easy to include in any project, simply include the following script tag in your html template.

```html
<script src="https://unpkg.com/tram-lite"></script>
```

This will automatically add `define` and `html` attributes for you to use in your javascript.

## API

Tram-Lite has a simple API with two main functions, `define` and `html`.

### `define`

`define` is a template tag function used to create new web-components.

```js
define`
  <my-greeting>
    <h1>Hello ${'name'}</h1>
  </my-greeting>
`;
```

The outer-most tag (in this case, `<my-greeting>`) is the new component that will be defined, and anything under that will be created as shadow-dom inside our new web-component. This can be created using `document.createElement`, the helper `html` function (detailed below), or as part of your HTML template.

```js
const greeting = html`<my-greeting name="Ada"></my-greeting>`;
document.body.appendChild(greeting);
```

Any templated strings (in this case, `${'name'}`) will become observed attributes on the new component. If we want to change them, you can use the native `setAttribute` function.

```js
greeting.setAttribute('Nikola'); // our geeting will update automatically!
```

### `html`

`html` is a helper function to quickly create html dom with all their attributes and content.

```js
const pageHeader = html`<h1 style="padding: 1em;">Hello World</h1>`;
```

This can help reduce the amount of javascript needed, removing the need for `document.createElement`, `setAttribute`, `setInnerHTML`, when building initial DOM with javascript.

## Example Component

Here is an example component (you can see more in the [examples folder](/examples/)).

```js
define`
  <tram-counter>
    <button style="color: ${'color'}" onclick="increment(this)">${'label'}: ${'count'}</button>
  </tram-counter>
`;

function increment(button) {
	const counter = button.getRootNode().host;
	const newCount = parseInt(counter.getAttribute('count')) + 1;
	counter.setAttribute('count', newCount);
}

const counters = html`
	<div>
		<tram-counter label="Blue" count="0" color="#CECEFF"></tram-counter>
		<tram-counter label="Red" count="0" color="#FFCECE"></tram-counter>
	</div>
`;
document.body.appendChild(counters);
```

## This Repo and the Tram-One Org

This repo is a reimagining of the existing Tram-One framework.
[The Tram-One org](https://github.com/Tram-One)
includes the more featureful Tram-One, utilities, dependencies, as well as the websites and generators for Tram-One.

### Discord

If you want to start contributing, need help, or would just like to say hi,
[join our discord](https://discord.gg/dpBXAQC)!
