/**
 * Copyright (c) 2025 Josh Bassett
 * 
 * Filename:    comp.ts
 * Author:      Josh Bassett
 * Date:        08/06/2025
 * Version:     1.2
 * 
 * Licence:     Apache 2.0
 */

import { API } from './api.js';
import { CSSConfig, Design } from "./design.js";
import { Effects } from "./effects.js";

/**
 * # Comp
 * 
 * Abstract base class for Comps that handles core logic.
 * 
 * ### Overview:
 * This class serves as the foundation for every component (Comp). Derived classes must override:
 * - **createHTML()**: Provides the component's HTML structure.
 * - **createCSS()**: Defines the component-specific styles.
 * - **hook()**: Implements JavaScript logic within the component.
 * 
 * ### Properties:
 * - **name** (`string`): The name of the component.
 * - **html** (`string`): The HTML structure of the component.
 * - **css** (`string`): The CSS rules applied to the component.
 * - **design** (`Design`): A reference to the Design class for styling.
 * - **api** (`API`): A reference to the API handler for data management.
 * - **effect** (`Effects`): A reference to the Effects class for animations.
 * 
 * ### Methods:
 * - **render()**: Updates the component's Shadow DOM.
 * - **update(newHTML, newCSS)**: Updates the component’s content and re-renders.
 * - **debug()**: Logs the component's data for debugging purposes.
 * 
 * ### Example:
 * ```js
 * 
 * class MyComp extends Comp {
 *     
 *     constructor() {
 *         
 *         super();
 *         
 *         this.hello_ = "Hello World!"; 
 *      
 *         this.name_ = "Comp";
 *         this.html_ = createHTML();           
 *         this.css_  = createCSS();
 * 
 *         this.render();
 *         
 *     }
 * 
 *     createHTML() {
 *      
 *         return `<button class="hello">${this.hello_}</button>`;
 * 
 *     }
 * 
 *     createCSS() {
 *         
 *         const style = this.design.create({
 *             class: "hello",
 *             background: "black100",
 *             colour: "white",
 *             padding: 10,
 *             borderRadius: 8
 *         });
 * 
 *         return `${style}`;
 *     }
 * 
 *     hook() {
 * 
 *         this.shadowRoot
 *             .querySelector('button')
 *             .addEventListener("click", () => {
 *                 console.log(this.hello_);
 *         });
 * 
 *     }
 * 
 * }
 * ```
 */
export abstract class Comp extends HTMLElement {

    public api = new API();
    public effect = new Effects();
    private design = new Design();

    constructor() {

        super();
        this.attachShadow({ mode: "open" });

    }

    private connectedCallback() {

        this.render();
    
    }

    public host(hostCSS: string) {

        this.design.hostStylesOverride = hostCSS;
        this.render();
        return this;
    
    }

    /**
     * ## Render
     * 
     * Renders the Comp to the screen.
     * 
     * ### Behaviour:
     * Method renders the Comp by setting the Shadow DOM's innerHTML to the generated template.
     * 
     * If a hook (an internal build method) is defined, it will be invoked afterwards.
     * 
     * ### Example:
     * ```js
     * 
     * constructor() {
     *   
     *     this.name_ = "Comp";
     *     this.html_ = this.createHTML();
     *     this.css_  = this.createCSS();
     *     
     *     this.render();
     * }
     * ```
     */
    public render(): void {

        if (!this.shadowRoot) throw new Error("Shadow root is not available.");

        const html = this.createHTML();
        const css  = this.createCSS();
        
        this.shadowRoot.innerHTML = this.createTemplate(html, css);

        if (typeof this.hook === "function")this.hook();
    
    }

    /**
     * # Update
     * 
     * Updates the Comp with new HTML/CSS.
     * 
     * ### Behaviour:
     * Method updates the Comp's internal HTML/CSS with new values.
     * 
     * Then renders the Comp with the new template.
     * 
     * ### Parameters:
     * - **newHTML** (`string`): The new HTML to be injected.
     * - **newCSS** (`string`): The new CSS to be injected.
     * 
     * ### Example:
     * ```js
     * 
     * set buttonText(newButtonText) {
     * 
     *     this.buttonText_ = newButtonText;
     *     this.update(this.createHTML(), this.css_);
     * }
     * ```
     */
    update(newHTML?: string, newCSS?: string): void {

        if (!this.shadowRoot) throw new Error("No shadow root");

        const html = newHTML || this.createHTML();
        const css  = newCSS || this.createCSS();
        
        this.shadowRoot.innerHTML = this.createTemplate(html, css);
        this.hook();
    
    }

    public css(css: CSSConfig): string {

        return this.design.create(css);
    
    }
    

    /**
     * ## Create Template
     * 
     * Builds an HTML Element template string.
     * 
     * ### Behaviour:
     * The method takes two string arguments with the HTML and CSS data that is
     * injected into a template string.
     * 
     * ### Parameters:
     * - **html** (`string`): The HTML to be rendered.
     * - **css** (`string`): The CSS to be rendered.
     * 
     * ### Returns:
     * `string` - Template string to be injected.
     */
    private createTemplate(html: string, css: string): string {

        return /* html */ `
      ${html}
      <style>
        ${this.design.defaultComp()}
        ${css}
      </style>
    `;
    
    }

    /**
     * ## Create HTML
     * 
     * Creates an HTML template string.
     * 
     * ### Behaviour:
     * Abstract method that returns a template string with the Comp's inner HTML.
     * 
     * Method needs to be overridden per instance.
     * 
     * ### Example:
     * ```js
     * 
     * createHTML() {
     * 
     *     return `<button>${this.text_}</button>`;
     * 
     * }
     * ```
     */
    protected abstract createHTML(): string;

    /**
     * ## Create CSS
     * 
     * Creates a CSS template string.
     * 
     * ### Behaviour:
     * Abstract method that returns a template string with the Comp's inner CSS.
     * 
     * Use the `Design` class `create` API to build the CSS and the `Effects` class
     * `prop` API for adding effects.
     * 
     * Method needs to be overridden per instance.
     * 
     * ### Example:
     * ```js
     * 
     * createCSS() {
     *         
     *     const style = this.design.create({
     *         class: "hello",
     *         background: "black100",
     *         colour: "white",
     *         padding: 10,
     *         borderRadius: 8
     *     });
     * 
     *     return `${style}`;
     * 
     * }
     * ```
     */
    protected abstract createCSS(): string;
    
    /**
     * ## Hook

     * Implements JavaScript logic within the component.
     * 
     * ### Behaviour:
     * Abstract method that implements the inner JavaScript logic to be executed when the Comp
     * is rendered.
     * 
     * To select elements from the Comp, use `this.shadowRoot` as all Comps are built using the Shadow DOM.
     * 
     * Method needs to be overridden per instance.
     * 
     * ### Example:
     * ```js
     * 
     * hook() {
     * 
     *     this.shadowRoot
     *         .querySelector('button')
     *         .addEventListener("click", () => {
     *             console.log(this.hello_);
     *     });
     * 
     * }
     * ```
     */
    protected abstract hook(): void;

}