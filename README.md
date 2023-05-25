<p align="center">
  <a href="http://tram-one.io/" target="_blank">
    <img src="https://unpkg.com/@tram-one/tram-logo@4" width="128">
  </a>
</p>

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

Tram-Lite is a library that helps developers build native web-components, and makes building simple native javascript
applications easier and more elegant!

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

To install, you can include a script tag pointed to `unpkg.com` in your `index.html`. We recommend pointing to a fixed
major version (in the following case, version 2):

```html
<script src="https://unpkg.com/tram-lite@2"></script>
```

This will automatically add all the API method to your javascript project (see API section below).

### types

If you use npm, you can get the type definitions by installing tram-lite (make sure this matches your script tag above)

```bash
npm i tram-lite
```

This will automatically annotate Tram-Lite methods with documentation in your project if you are using a
Typescript-aware editor (like Visual Studio Code).

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

The outer-most tag (in this case, `<my-greeting>`) is the new component that will be defined, and anything under that
will be created as shadow-dom inside our new web-component. This can be created using `document.createElement`, the
helper `html` function (detailed below), or as part of your HTML template.

```js
const greeting = html`<my-greeting name="Ada"></my-greeting>`;
document.body.appendChild(greeting);
```

Any templated strings (in this case, `${'name'}`) will become observed attributes on the new component. If we want to
change them, you can use the native `setAttribute` function.

```js
greeting.setAttribute('Nikola'); // our geeting will update automatically!
```

### `html`

`html` is a helper function to quickly create html dom with all their attributes and content.

```js
const pageHeader = html`<h1 style="padding: 1em;">Hello World</h1>`;
```

This can help reduce the amount of javascript needed, removing the need for `document.createElement`, `setAttribute`,
`setInnerHTML`, when building initial DOM with javascript.

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

This is extremely useful when nesting multiple components inside of each other, as the `document.querySelector()`
methods won't work through shadow DOM.

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

## Guiding Principles

The following are principles that motivate the design philosophy around the interface and methods found in the Tram-Lite
library.

### 1. Not a Framework

Tram-Lite is a **library**, it is **not a framework**. As much as possible, users should run and orchestrate their own
code. In the face of bloat and tradeoffs associated with frameworks, and the difficulty associated with learning new
syntax and data models, we'd like Tram-Lite to be a simple alternative. With respect to the
[Frameworkless Manifesto](https://github.com/frameworkless-movement/manifesto), we believe that Tram-Lite can be an
alternative that offers few tradeoffs, and seamless integration with other libraries or frameworks.

In practice, this means that Tram-Lite is not some all encompassing framework that you tie all functions and state to.
Tram-Lite does not heavily bind itself into the window object (save for exposing its own functions), and does not attach
listeners or cause other non-obvious side-effects to the browser.

**This is the main guiding principle that inspires all others.**

### 2. Defer to native APIs

Tram-Lite should strive to only offer functions when they would offer substantial benefit over native existing options.
This could be because the existing options are tedious (as is the case for `.createElement()` and `.setAttribute()`), or
because the existing option is complex (as is the case for creating new web-components).

Conversely, functionality that would be traditionally rare, or already has native solutions, should be avoided.

### 3. Interoperable and optional

Tram-Lite functions should never depend on each other. While we may offer functions that help enable patterns created as
a side effect of other elements in the Tram-Lite library, they should be functional in an environment where no other
Tram-Lite functions are being used.

To this end, all functions that are generative should expose objects with common and native interfaces. This means any
additional functions that mean to target these objects, should work with other non-Tram-Lite elements.

### 4. Favor no-build environments

Tram-Lite's target environment is a basic html file. It should offer everything needed, and let developers build
immediately, with no other tools or libraries required.

While many frameworks will recommend generators or platforms for an optimal development experience, we should strive to
make the vanilla javascript experience ideal, where only a static web host may be available.

To this end, while we should be interoperable with other libraries, we should not be totally contingent on other
libraries to provide a delightful experience.

_Additionally, as much as possible, this project should try to adhere to this principle as much as possible._

## This Repo and the Tram-One Org

This repo is a reimagining of the existing Tram-One framework. [The Tram-One org](https://github.com/Tram-One) includes
Tram-One utilities, dependencies, the website and generators.

Tram-Lite itself has no dependencies on these other projects, and is a stand-alone project.

### Discord

If you want to start contributing, need help, or would just like to say hi,
[join our discord](https://discord.gg/dpBXAQC)!
