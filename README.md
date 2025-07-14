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

<br>

## Bundling with Webpack

Ensure your `package.json` includes:
```json
{
  "type": "module",
}
```

**index.js**  
```js
import { Comp } from "jay-comp";
import "./helloworld.js";  // Your custom components
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
    return `<h1>Hello Jay!</h1>`;
  }

  createCSS() {
    return {
      class: "heading",
      colour: "#1F276E",
      fontSizePt: 24,
      breakpoint: 600,
      padding: [8, 16]
    };
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

Compiles a single config object into scoped CSS. Supports a wide range of suffix-based operators:

#### Rules
- CamelCase → kebab-case
- UK spellings (colour, centre, behaviour)

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

### CSSConfig Operator Reference

| Operator      | CSS Output                                   | Example Config                 | Compiled CSS Snippet                                      |
|--------------------------|----------------------------------------------|------------------------------------|-----------------------------------------------------------|
| *(default number)*       | `px` appended (except `0`)                   | `margin: 16`                       | `margin: 16px;`                                           |
| Percent                  | `%`                                          | `widthPercent: 50`                 | `width: 50%;`                                             |
| Var                      | `var(--token)`                               | `colourVar: "blue100"`             | `color: var(--blue100);`                                  |
| Url                      | `url(...)`                                   | `backgroundImageUrl: "hero.jpg"`   | `background-image: url(hero.jpg);`                        |
| Calc                     | `calc(...)`                                  | `widthCalc: "100% - 32px"`         | `width: calc(100% - 32px);`                               |
| Em                       | `em`                                         | `paddingTopEm: 2.3`                | `padding-top: 2.3em;`                                     |
| Rem                      | `rem`                                        | `marginRem: 1.5`                   | `margin: 1.5rem;`                                         |
| Vw / Vh / Vmin / Vmax    | `vw` / `vh` / `vmin` / `vmax`                | `heightVh: 80`                     | `height: 80vh;`                                           |
| Ch / Ex                  | `ch` / `ex`                                  | `textIndentCh: 2`                  | `text-indent: 2ch;`                                       |
| Pt / Pc                  | `pt` / `pc`                                  | `fontSizePt: 12`                   | `font-size: 12pt;`                                        |
| In / Cm / Mm             | `in` / `cm` / `mm`                           | `widthCm: 10`                      | `width: 10cm;`                                            |
| Fr                       | `fr` (Grid)                                  | `columnFr: 1`                      | `grid-template-columns: 1fr;`                             |
| S / Ms                   | `s` / `ms` (Time)                            | `transitionDurationS: 0.3`         | `transition-duration: 0.3s;`                              |
| Deg / Rad / Grad / Turn  | `deg` / `rad` / `grad` / `turn` (Angle)      | `rotateDeg: 45`                    | `transform: rotate(45deg);`                               |
| Dpi / Dpcm / Dppx        | `dpi` / `dpcm` / `dppx` (Resolution)         | `printResDpi: 300`                 | `print-resolution: 300dpi;`                               |
| Raw strings / Keywords   | passed through as-is                         | `display: "flex"`                  | `display: flex;`                                          |
| Array shorthand          | space-separated multi-value                  | `padding: [8,16]`                  | `padding: 8px 16px;`                  |
| Unitless props           | no units                                     | `opacity: 0.5`                     | `opacity: 0.5;`                                           |
| pseudoClass              | pseudo-selector state                        | `pseudoClass: "hover"`             | `.my-class:hover { … }`                                   |
| breakpoint (in `media`)  | `@media (max-width: …px)`                    | `media: { breakpoint:600, padding:8 }` | `@media (max-width:600px){.my-class{padding:8px;}}` |


<br>

### HTTP Requests API

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
