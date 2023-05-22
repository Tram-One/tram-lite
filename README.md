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

```js
define`
  <custom-title color="blue">
    <style>
      h1 { color: ${'color'} }
    </style>

    <h1>${'title'}</h1>
  </custom-title>
`;
```

```html
<body>
	<custom-title title="Welcome to Tram-Lite!"></custom-title>
</body>
```

## Installation

Tram-Lite is easy to include in any project, and requires no build tooling!

### script tag

To install, you can include a script tag pointed to `unpkg.com` in your `index.html`.
We recommend pointing to a fixed major version (in the following case, version 2):

```html
<script src="https://unpkg.com/tram-lite@2"></script>
```

This will automatically add all the API method to your javascript project (see API section below).

### types

If you use npm, you can get the type definitions by installing tram-lite (make sure this matches your script tag above)

```bash
npm i tram-lite
```

This will automatically annotate Tram-Lite methods with documentation in your project if you are using a Typescript-aware editor (like Visual Studio Code).

## API

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

### `queryAllDOM`

`queryAllDOM` is a helper function to easily query across shadow and light DOM boundaries.

```js
const page = html`<custom-list></custom-list>`;
document.body.appendChild(page);

// let's assume the document body looks like the following:
// <custom-list>
//   #shadow-root
//     <ul>
//       <custom-list-item>
//         #shadow-root
//           <li>First Item</li>
//       </custom-list-item>
//     </ul>
// </custom-list>

const listItems = queryAllDOM('li', page);
```

This is extremely useful when nesting multiple components inside of each other, as the `document.querySelector()` methods won't work through shadow DOM.

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
