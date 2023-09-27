<p align="center">
  <a href="http://tram-one.io/tram-lite/" target="_blank">
    <img src="https://unpkg.com/@tram-one/tram-logo@5.0.1/dist/lite.svg" width="128">
  </a>
</p>

<div align="center">
  <a href="https://tram-one.io/tram-lite/#install">
    <img src="https://img.shields.io/npm/dm/tram-lite.svg" alt="Downloads">
  </a>
  <a href="https://tram-one.io/tram-lite/">
    <img src="https://img.shields.io/npm/v/tram-lite.svg" alt="Version">
  </a>
  <a href="https://unpkg.com/tram-lite@4.0.0/output/tram-lite.min.js">
    <img src="https://img.shields.io/badge/gzip-1.7kB-006369.svg?style=flat" alt="Gzipped Size">
  </a>
  <a href="https://github.com/Tram-One/tram-lite/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/tram-lite.svg" alt="License">
  </a>
  <a href="https://discord.gg/dpBXAQC">
    <img src="https://img.shields.io/badge/discord-join-5865F2.svg?style=flat" alt="Join Discord">
  </a>
</div>

# Tram-Lite

Tram-Lite is an HTML-first library that helps developers build native web-components, and makes building simple native
web-applications easier and more elegant!

```html
<!-- include the tram-lite library -->
<script src="https://unpkg.com/tram-lite@4"></script>

<!-- define a new web-component, custom-title -->
<template tl-definition>
	<custom-title color="blue">
		<!-- embed attributes right in the template -->
		<style>
			h1 { color: ${'color'} }
		</style>
		<h1>${'page'}</h1>

		<!-- use controlled elements to update the component attributes -->
		<input tl-controlled placeholder="Title" tl-hostattr="page" />

		<!-- effects run on mount, and when dependencies change -->
		<script tl-effect tl-dependencies="page">
			this.ownerDocument.title = this.getAttribute('page');
		</script>
	</custom-title>
</template>

<!-- use your new component anywhere in your HTML! -->
<custom-title page="Introduction!"></custom-title>
```

To install, you can simply include a script tag pointed to `unpkg.com` in your `index.html`:

```html
<script src="https://unpkg.com/tram-lite@4"></script>
```

To learn more check out the website at https://tram-one.io/tram-lite

### Discord

If you want to start contributing, need help, or would just like to say hi,
[join our discord](https://discord.gg/dpBXAQC)!

### Development

If you would like to do development in this repo, the following are commands you can run after cloning this repo:

#### ci

By running `npm ci`, you can install all the development dependencies. This is required for building, testing, and
running any of the other commands listed.

#### start

You can start a simple http server using `npm run start`. By clicking on the link that it prints out, you can go to the
`examples/` folder, and see a set of components built with Tram-Lite.

#### build

You can build a single asset that is used for publishing to npm, as well as the minified result using `npm run build`.
This is automatically triggered before `start` and `publish`. You can run this manually when making changes to validate
against the example components.

#### docs

You can view the website by running `npm run docs`.

#### tests

You can run the test suite by running `npm test`. This launches cypress, and can run in any browser. You do not need to
run any other commands (aside from an initial install) for this to work (we launch the file directly).
