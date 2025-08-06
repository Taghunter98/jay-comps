# The Jay Framework

[![npm version](https://img.shields.io/npm/v/jay-comp)](https://www.npmjs.com/package/jay-comp)

**Jay** is a fast, lightweight, and powerful web component library built with TypeScript.

It allows you to rapidly build modern, high-performance user interfaces with minimal boilerplate.

With **Jay**, you can focus entirely on **behaviour** and **presentation** while it takes care of the underlying complexity: rendering, styling, and lifecycle management.

### Why Choose Jay?

-   #### **Effortless Reactivity**

    No need for complex state management. Jay’s reactive model automatically updates your UI when data changes, just modify properties and Jay takes care of the rest.

-   #### **Scoped Styling**

    Write your component styles directly within your JavaScript/TypeScript code, with support for responsive design, pseudo-classes, media queries,and more, automatically scoped to your component to avoid conflicts.

-   #### **Component Lifecycle Made Easy**

    Build components with familiar lifecycle hooks. Create HTML, CSS, and handle events, all within one class—without the need to juggle multiple frameworks or tools.

-   #### **Minimalistic, Yet Powerful**

    Jay provides a minimal API surface that handles all the essential functionality you'd expect in a component library, including helpful abstractions for HTTP reuquests, event listener publishing/subscribing and more.

<br>

## Installation

**Via npm:**

```bash
npm install --save-dev jay-comp webpack webpack-cli
```

**Via Git (alternative):**

```bash
git clone https://github.com/Taghunter98/jay-comps.git
cd jay-comps
npm install
npx tsc
```

<br>

## Setting Up Webpack

To bundle your Jay components, you'll need to set up Webpack. Here’s a quick guide to get you started.

Make sure your `package.json` includes this line:

```json
{
    "type": "module"
}
```

Create a Webpack configuration file, `webpack.config.cjs`:

```js
const path = require("path");

module.exports = {
    entry: "./index.js", // Entry file where you import your components
    mode: "development", // Change to "production" for minification
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
};
```

In your `index.js`, import any components you want to use:

```js
import "./helloworld.js"; // Your custom component
```

After configuring Webpack, run:

```bash
npx webpack
```

This will bundle your components and create a `bundle.js` file in the `dist/` directory.

<br>

## Getting Started

Create a simple component with Jay to get started quickly.

**helloworld.js**

```js
import { Comp } from "jay-comp";

export class HelloWorld extends Comp {
    hello = "Hello Jay!"; // immutable prop
    clicked = { default: false }; // mutable prop

    template = (
        text,
        clicked // immutable function prop
    ) =>
        clicked
            ? `<button class="btn clicked">${text}</button>`
            : `<button class="btn">${text}</button>`;

    createHTML() {
        return this.template(this.hello, this.clicked);
    }

    createCSS() {
        return [
            {
                class: "btn",
                background: "black",
                colour: "white",
                padding: [9, 24],
            },
            {
                class: "clicked",
                background: "red",
            },
        ];
    }

    afterRender() {
        this.query(".btn").addEventListener("click", () => {
            this.clicked = true; // Triggers re-render
        });
    }

    static {
        this.define();
    }
}
```

**index.html**

```html
<!DOCTYPE html>
<html>
    <body>
        <!-- Our new HTML Element -->
        <comp-hello-world></comp-hello-world>

        <script type="module" src="./dist/bundle.js"></script>
        <!-- For Webpack users -->
    </body>
</html>
```

<br>

## Core Concepts

**Props**

-   Immutable props don't trigger re-renders.
-   Mutable props trigger re-renders when updated.

**Templating**

-   Define your template in a function, and use `createHTML()` to render it.

**CSS-in-JS**

-   Write scoped styles directly in JavaScript with `createCSS()`.

**Reactivity**

-   Changing a mutable prop triggers the component to re-render.

<br>

## Jay Wiki

For more in-depth guides on advanced features like lifecycle hooks, event handling, HTTP requests, and more, check out the [wiki](https://github.com/Taghunter98/jay-comps/wiki).

## Contributing

Jay is licensed under the **Apache 2.0 License**. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request
