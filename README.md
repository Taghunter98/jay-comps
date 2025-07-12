# Jay Components

[![npm version](https://img.shields.io/npm/v/jay-comp)](https://www.npmjs.com/package/jay-comp)

A lightweight, modular web-component library built in TypeScript. Jay manages rendering, styling, HTTP requests, and component lifecycle so you can focus on HTML, CSS, and behavior.

<br>

## Table of Contents

- [Installation](#installation)  
- [Bundling with Webpack](#bundling-with-webpack)  
- [A Minimal Example](#a-minimal-example)  
- [Core API](#core-api)  
  - [The Comp Class](#the-comp-class)  
  - [Overrideable Methods](#overrideable-methods)  
  - [Helper Methods](#helper-methods)  
- [Contributing & License](#contributing--license)  

<br>

## Installation

**Via npm**  
```bash
npm install --save-dev jay-comp webpack webpack-cli
```

**Via Git**  
```bash
git clone https://github.com/Taghunter98/jay-comps.git
cd jay-comps
npm install
npx tsc
```

Ensure your `package.json` includes:
```json
{
  "type": "module",
}
```

<br>

## Bundling with Webpack

**index.js**  
```js
import { Comp } from "jay-comp";
import "./helloworld.js";  // Your custom Comps
```

**webpack.config.cjs**  
```js
const path = require("path");

module.exports = {
  entry: "./index.js",
  mode: "development",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
```

After building:
```bash
npx webpack
```

Include in your HTML:
```html
<script type="module" src="./dist/bundle.js"></script>
```

<br>

## A Minimal Example

**helloworld.js**  
```js
import { Comp } from "jay-comp";

class HelloWorld extends Comp {
  greeting_ = "Hello, Jay!";

  createHTML() {
    return `<h1>${this.greeting_}</h1>`;
  }

  createCSS() {
    return this.css({
      class:      "heading",
      colour:     "blue100",
      fontSize:   24,
      breakpoint: 600,
      padding:    [8, 16]
    });
  }

  hook() {
    this.shadowRoot
      .querySelector("h1")
      .addEventListener("click", () => alert(this.greeting_));
  }

  static { Comp.register(this); }
}
```

**index.js**  
```js
import { Comp } from "jay-comp";
import "./helloworld.js";
```

**index.html**  
```html
<!DOCTYPE html>
<html>
  <body>
    <comp-hello-world></comp-hello-world>
    <script type="module" src="./dist/bundle.js"></script>
  </body>
</html>
```

Open `index.html` to see your component in action.

<br>

## Core API

### The Comp Class

`Comp` is Jay’s base class. It handles:
- **Shadow DOM** setup  
- **Template injection** via `render()`  
- **Scoped CSS** through `createCSS()`  
- **Lifecycle hooks** (`createHTML()`, `createCSS()`, `hook()`)  
- **HTTP requests** (`request()`, `submitForm()`)

#### Lifecycle Flow

1. **Constructor**  
   - Attaches an open shadow root  
   - Calls `render()`

2. **render()**  
   - Injects output of `createHTML()` and `createCSS()` into shadow root  
   - Calls `hook()`

3. **hook()**  
   - User-defined for wiring up logic (events, data fetch, etc.)


<br>

### Overrideable Methods

#### `createHTML(): string`

Define your component’s inner markup:
```js
createHTML() {
  return `<div class="container">${this.content_}</div>`;
}
```

#### `createCSS(): string`

Define scoped styles via the CSS compiler:
```js
createCSS() {
  return this.css({
    class:         "container",
    display:       "flex",
    padding:       [10, 15],
    breakpoint:    600,
    flexDirection: "column"
  });
}
```

#### `hook(): void`

Run post-render logic:
```js
hook() {
  this.shadowRoot
    .querySelector(".container")
    .addEventListener("click", () => console.log("Clicked!"));
}
```

#### `static register(componentClass): void`

Registers the Comp as a custom element.  
Class names convert to kebab-case and prefix `comp-`:

```js
static { Comp.register(this); }
// MyButtonComp → <comp-my-button-comp>
```

<br>

### Helper Methods

#### `update(html?: string, css?: string): void`

Re-render markup and/or styles at runtime:
```js
set title(text) {
  this.title_ = text;
  this.update();  // Re-runs createHTML/createCSS
}
```

#### `css(config: CSSConfig): string`

Compiles a JS object into scoped CSS.  
Supports:

- CamelCase → kebab-case  
- Appended `px` to numbers  
- `Percent` suffix for `%` units  
- Array shorthand for multi-value props  
- UK spellings (`colour`, `centre`)  
- `breakpoint` for `@media (max-width:…)`  
- `pseudoClass` for states (e.g. `:hover`, `:active`)

**Examples**

A basic box layout:
```js
const config1 = {
  class:         "box",
  display:       "flex",
  flexDirection: "column",
  padding:       10,
  opacity:       0.8
};
console.log(this.css(config1));
```
Compiles to ->
```css
.box {
  display: flex;
  flex-direction: column;
  padding: 10px;
  opacity: 0.8;
}
```

Using arrays, percent, and media:
```js
const config2 = {
  class:        "container",
  colour:       "white",
  border:       ["solid", 2, "black"],
  borderRadius: [4, 8],
  widthPercent: 75,
  media: {
    breakpoint: 600,
    padding:    [16, 32]
  }
};
console.log(this.css(config2));
```
Compiles to ->
```css
.container {
  color: white;
  border: 2px solid black;
  border-radius: 4px 8px;
  width: 75%;
}
@media (max-width: 600px) {
  .container {
    padding: 16px 32px;
  }
}
```

Pseudo-class:
```js
const config3 = {
  class:       "btn",
  background:  "blue100",
  pseudoClass: "hover",
  background:  "blue200"
};
console.log(this.css(config3));
```
Compiles to ->
```css
.btn:hover {
  background: var(--blue200);
}
```

#### `request<T>(url: string, method: "GET"|"POST", data?: object): Promise<T>`

Perform JSON fetch with error handling.

```ts
// GET users
interface User { id: number; name: string; }
const users = await this.request<User[]>("/api/users", "GET");

// POST login
interface LoginResp { token: string; }
const login = await this.request<LoginResp>(
  "/api/login", 
  "POST", 
  { user: "alice", pass: "s3cret" }
);
console.log("JWT =", login.token);
```

#### `submitForm<T>(url: string, data: HTMLFormElement|FormData|object): Promise<T>`

Send multipart/form-data for uploads.

```ts
// 1) HTMLFormElement
const form = document.querySelector("form#profile")!;
const res1 = await this.submitForm<{ success: boolean }>(
  "/api/profile", form
);

// 2) FormData
const fd = new FormData();
fd.append("avatar", fileInput.files[0]);
const res2 = await this.submitForm<{ url: string }>(
  "/api/upload", fd
);

// 3) Plain object
const data = { name: "Alice", age: 30, newsletter: true };
const res3 = await this.submitForm<{ status: "ok" }>(
  "/api/subscribe", data
);
```

<br>

## Contributing & License

Jay is licensed under the **Apache 2.0 License**. Contributions are welcome!  

1. Fork the repo  
2. Create a feature branch  
3. Commit your changes  
4. Open a Pull Request  

For issues or feedback, please open an issue or email the maintainer.  
```