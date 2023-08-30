<p align="center">
  <a href="http://tram-one.io/tram-lite/" target="_blank">
    <img src="https://unpkg.com/@tram-one/tram-logo@5.0.1/dist/lite.svg" width="128">
  </a>
</p>

<div align="center">
  <a href="https://www.npmjs.com/package/tram-lite">
    <img src="https://img.shields.io/npm/dm/tram-lite.svg" alt="Downloads">
  </a>
  <a href="https://www.npmjs.com/package/tram-lite">
    <img src="https://img.shields.io/npm/v/tram-lite.svg" alt="Version">
  </a>
  <a href="https://bundlephobia.com/package/tram-lite">
    <img src="https://badgen.net/bundlephobia/minzip/tram-lite" alt="Gzipped Size">
  </a>
  <a href="https://www.npmjs.com/package/tram-lite">
    <img src="https://img.shields.io/npm/l/tram-lite.svg" alt="License">
  </a>
  <a href="https://discord.gg/dpBXAQC">
    <img src="https://img.shields.io/badge/discord-join-5865F2.svg?style=flat" alt="Join Discord">
  </a>
</div>

# Tram-Lite

Tram-Lite is a lite javascript and HTML library that helps developers build native web-components, and makes building
simple native web-applications easier and more elegant!

```html
<!-- include the tram-lite library -->
<script src="https://unpkg.com/tram-lite@3"></script>

<!-- define a new web-component -->
<template is="component-defintion">
	<custom-title color="blue">
		<!-- components have encapsulated styles -->
		<style>
			h1 { color: ${'color'} }
		</style>

		<!-- embed attributes right in the template -->
		<h1>${'page'}</h1>

		<!-- run script as soon as the component mounts -->
		<script>
			document.title = this.getAttribute('page');
		</script>
	</custom-title>
</template>

<!-- use your new component anywhere in your HTML! -->
<custom-title page="Introduction!"></custom-title>
```

To install, you can simply include a script tag pointed to `unpkg.com` in your `index.html`:

```html
<script src="https://unpkg.com/tram-lite@3"></script>
```

To learn more check out the website at https://tram-one.io/tram-lite

### Discord

If you want to start contributing, need help, or would just like to say hi,
[join our discord](https://discord.gg/dpBXAQC)!
