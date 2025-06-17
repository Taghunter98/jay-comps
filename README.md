# Jay

Jay is a lightweight, modular web component library built with TypeScript. It provides everything you need to build maintainable custom elements.

Jay is built on 'Comps', modualar HTML elements that usss the Shadow DOM to keep the logic and styling tidy. Jay allows you to ignore the rendering and focus on the design and logic through some nice features that give vanilla JS a real boost.

Writing CSS is a breeze, I decided to write a custom CSS compiler that converts JavaScript objects into CSS styles, with camel case support for variable names, but the cool thing is, the conversion of British to American spellings for CSS properties. This for me at least is really nice no more 'color'!

Jay also comes with a linter with it's own conventions to help you write cleaner and maintainable code.
## Features

- **Comp System:**  
  Jay is built on 'Comps' each Comp inherits a name, HTML and CSS value, the user can then define just three methods to build their Comp, `createHTML` `createCSS` and `hook`. These methods are detected by `Comp` and respectively build the HTML CSS and hook injects the internal JS logic into the new Comp.

- **CSS Compiler:**  
  Jay includes a uniquely designed CSS compiler that accepts JavaScript-style key: value objects and converts them into standard CSS. This feature simplifies the process of writing and maintaining CSS, while ensuring that your styles adhere to the design system. The compiler allows for camelCase names for keys such as `fontSize` -> `font-size` and British English language support so `colour`, `centre`, `behaviour` and `grey` are now valid!

- **Abstracted API Requests:**  
  The abstracted API request method simplifies network operations. It handles errors gracefully and returns a promise that resolves to JSON data, reducing boilerplate code.

- **Strict Linter Conventions:**  
  Jay enforces code quality using conventions such as:
  - Aligned assignments
  - Consistent spacing in functions
  - 4-space indentation
  - Camel case usage
  - Semicolon enforcement  

### Installation
To install Jay you can use npm or git clone the repository.

After installing, you need to compile the TypeScript files with `tsc` or `npx tsc`.

The JavaScript `Comp` file is found within `/dist/comp.js` post compilation. 

- **npm**
    ```sh
    npm install jay-comp
    ```

- **git**
    ```sh
    git clone https://github.com/Taghunter98/jay-comps.git
    cd jay-comps
    ```

Install the dependencies.
```plaintext
npm install --save-dev jay-comp eslint eslint-plugin-align-assignments @typescript-eslint/eslint-plugin @typescript-eslint/parser globals webpack webpack-cli
```
#### Build with Webpack if using npm
For Jay to work with npm, you need Webpack and ensure that your `package.json` is set to `type: module`.

Then define the central import file for your project, I just use `index.js`. Inside import the main `Comp` class from npm modules, then all your custom Comps. This is to ensure that it will work with HTML.

```cjs
const path = require('path');
module.exports = {
    entry: "<PATH_TO_INDEX.JS>",
    mode: 'development',
    output: {
        filename: 'bundle.js',
        path: path.resolve(_dirname, 'dist')
    }
};
```

This will generate a `dist/bundle.js` directory that you can then link your HTML to and use Jay.
```html
<script type="module" src="<PATH_TO_DIST>/dist/bundle.js"></script>
```

### Configuring the Linter
The linter, if you are running VSCode, needs an additional workspace requirement, add a `.vscode` directory with `settings.json` and pase the following settings. Reload the workspace and Jay will start shouting at you!

Note a known bug with the linter, you need to disable `editor.formatOnSave` to avoid formatting conflicts.

```json
{
  "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
      "javascript",
      "javascriptreact",
      "typescript",
      "typescriptreact"
  ],
  "liveServer.settings.port": 5501
}

Finally extend the linter config to your `eslint.config.js`.
```js
import config from "jay-comp/eslint.config.js";
export default config;
```

## Defining a Comp
To create a new Comp, you need to import and extend `Comp` and call `super()` in the constructor to invoke the parent attributes.

You can then write all the Comp specific attributes, note that any mutable attributes need to be postfixed with an underscore _.

```js
import { Comp } from "../dist/comp.js";

class ButtonComp extends Comp {

    constructor() {

        super();                                                    

        this.buttonText_    = "This is a button";
        this.buttonAction_  = "";  
        
        this.name_ = "Button";
        this.html_ = this.createHTML();
        this.css_  = this.createCSS();

        this.render();
    
    }
}
```

## Updating Attributes

It is advisable for reusable Comps to write getter and setter methods to update the attributes, note for updating values you need to call `update()` and depending on if the HTML or CSS needs changing call the appropriate method.

```js
set buttonText(newButtonText) {

    this.buttonText_ = newButtonText;
    this.update(this.createHTML(), this.css_);
    
}
get buttonText() {

    return this.buttonText_;

}
```

## Writing HTML

The `createHTML()` method is where you will define your Comp's HTML. It needs to be overridden otherwise Jay will warn you in the console.

Writing HTML is rather straightforward, simply write a template string and for reusability include your class attributes. 

Note this method must be called `createHTML()` for Jay to recognise it.

For a better UX, install [Inline HTML](vscode:extension/*pushqrdx.inline-html*) then use the comment postfix to enable syntax highlighting.

```js
createHTML() {

    return /* html */ `
    <button id="button" class="button">${this.buttonText_}</button>
    `;
    
    }
```

## Writing CSS

Jay’s custom CSS compiler is a standout feature. Instead of writing CSS in a traditional stylesheet, you can define your component styles using a JavaScript object with key-value pairs.

The `createCSS()` method is also where you will define your animation properties and build out your styles. It needs to be overridden otherwise Jay will warn you in the console.

As a former designer, I thought about the best way to keep styles maintainable and my solution was to define Comp styles using variables with the power of JavaScript and creativity of CSS.

The result provides a clean and organised look for your work with no messy CSS and a simple syntax that will feel comfortable and familiar.

Note the method must be called`createCSS()` for Jay to recognise it. 

```js
createCSS() {

    const effect = this.effect.scale(0, 10);
    const prop   = this.effect.prop("scale", .5);

    const button = this.design.create({
        class: "button",
        colour: "white",
        background: "black100",
        padding: "9px 16px",
        border: "border",
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 0.1s ease-in-out"
    });

    const buttonHover = this.design.create({
        class: "button",
        psuedoClass: "hover",
        background: "black80",
    });

    const buttonActive = this.design.create({
        class: "button",
        psuedoClass: "active",
        background: "black60"
    });

    return `
    ${effect}
    ${button}
    ${buttonHover}
    ${buttonActive}
    `;
    
}
```

## Writing JavaScript

To write JavaScript you need to first override the method `hook()` which gives you some space to write out your internal logic.

A good approach is to write all functions within the Comp's scope and call them within `hook()` for a cleaner experience.

Note the method must be called`hook()` for Jay to recognise it. Also Comp creates elements in the shadow DOM so you will need to call `shadowRoot` to access values.

```js

async getCatFact() {

        const data = await this.api.request("https://catfact.ninja/fact", "GET");
        console.log(data.fact);
    
    }

hook() {

    this.shadowRoot
        .querySelector('button')
        .addEventListener("click", () => {

            this.getCatFact();
        
        });
    
    }
```

### Exporting and Usage
As Jay is built using web components under the hood, to define your new Comp, use the `customElements` API to create an HTML element.

The Jay convention is to prefix all elements with 'comp-' to ensure a valid element.

```js
class MyComp extends Comp {
// Define Comp logic...
}

customElements.define("comp-button", Button);
```

To then nest your Comp within another Comp's HTML, you need to either import it directly or define an `imports.js` to house all Comps as a cleaner way to ensure all imports are handled in one place.

I like to split my UI into `comps` and `comp-pages`, meaning that my HTML only needs to import one Comp for a clean experience.

```js
// Import Comps
import './comps/button.js';
import './comps/card.js';
import './comps/input.js';

// Import Comp pages
import './comp-pages/login.js';
```

This import structure allows for nesting.

```js
createHTML() {
    
    return /* html */ `
    <div class="background">
        <div class="container">
            <h3>${this.title_}</h3>

            <comp-input id="email" name="email"></comp-input>
            <comp-input id="password" name="password"></comp-input>

            <comp-button id="submit">Refresh Card</comp-button>

            <p id="result"></p>
        </div>
        
    </div>
    `;
    
}
```

### Contribution and Licence
Jay is licenced under the Apache 2.0 licence, so feel free to use it within your projects and any suggestions or bugs please create an issue or send me an email :)

To contribute pleas fork the repo and make a pull request, I'll be happy to review and merge your suggestions and new features.