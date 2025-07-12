# Jay

Jay is a lightweight, modular web-component library written in TypeScript. It manages rendering, styling, data fetching, and component lifecycle so you can focus on HTML, CSS, and behavior.



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
  // ...
}
```



## Bundling with Webpack

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

After running `npx webpack`, include in your HTML:
```html
<script type="module" src="./dist/bundle.js"></script>
```



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

---

## Core API

### The Comp Class

`Comp` is the base class for all Jay components. It handles Shadow DOM, template injection, styling, HTTP requests, and lifecycle hooks.

#### Lifecycle Flow

1. **Constructor**  
   - Attach shadow root  
   - Call `render()`  

2. **render()**  
   - Inject output of `createHTML()` and `createCSS()` into shadow root  
   - Call `hook()`

3. **hook()**  
   - User-defined method for wiring up logic (event listeners, data fetch, etc.)

---

### Overrideable Methods

#### createHTML(): string  
Define your component’s inner markup:
```js
createHTML() {
  return `<div class="container">${this.content_}</div>`;
}
```

#### createCSS(): string  
Define scoped styles via the CSS compiler:
```js
createCSS() {
  return this.css({
    class:    "container",
    display:  "flex",
    padding:  [10, 15],
    breakpoint: 600,
    flexDirection: "column"
  });
}
```

#### hook(): void  
Run post-render logic:
```js
hook() {
  this.shadowRoot
    .querySelector(".container")
    .addEventListener("click", () => console.log("Clicked!"));
}
```

#### static register(componentClass): void  
Registers the Comp as a custom element using the class name (kebab-cased + `comp-` prefix):
```js
static { Comp.register(this); }
// ButtonComp → <comp-button-comp>
```

---

## Helper Methods

#### update(html?: string, css?: string): void  
Re-render markup and/or styles at runtime.  
```js
set title(text) {
  this.title_ = text;
  this.update();  // Re-runs createHTML/createCSS
}
```

#### css(config: CSSConfig): string  
Compile a config object into CSS, supporting:
- CamelCase → kebab-case  
- British-to-American spelling  
- Arrays for multi-value props  
- `Percent` suffix for `%` units  
- `breakpoint` key for `@media (max-width: …px)`  
- `pseudoClass` for states like `:hover`, `:active`

```js
// 1) Basic CSS object
const basic = this.css({
  class: "box",
  display: "flex",
  flexDirection: "column",
  padding: 10,           // becomes "padding: 10px;"
  opacity: 0.8
});

// 2) CSS object with media query
const advanced = this.css({
  class: "container",
  colour: "white",               // UK -> American
  border: ["solid", 2, "grey"],  // creates 2px solid border
  borderRadius: [4, 8],          // "border-radius: 4px 8px;"
  widthPercent: 75,              // "width: 75%;"
  media: {
    breakpoint: 600,    // wrap next props in @media
    padding: [16, 32]   // becomes "padding: 16px 32px;"
  }
});

// 3) Pseudo-class
const hoverStyles = this.css({
  class:       "btn",
  background:  "blue100",
  pseudoClass: "hover",
  background:  "blue200"
});
```

#### request<T>(url: string, method: "GET"|"POST", data?: object): Promise<T>  
Perform JSON fetch with automatic error handling.

#### submitForm<T>(url: string, formData: FormData|HTMLFormElement|object): Promise<T>  
Submit multipart/form-data for file uploads, returning parsed JSON.

---

## Contribution & License

Jay is licensed under the Apache 2.0 License. Contributions welcome—fork the repo and open a pull request. For issues or feedback, please open an issue or email the maintainer.