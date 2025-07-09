/**
 * Copyright (c) 2025 Josh Bassett
 * 
 * Filename:    comp.ts
 * Author:      Josh Bassett
 * Date:        08/06/2025
 * Version:     1.4
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

    private api = new API();
    public effect = new Effects();
    private design = new Design();

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    private connectedCallback() { this.render();}

    /**
     * ## host
     * 
     * Overrides the default `:host` configuration.
     * 
     * ### Behaviour:
     * Nested components by default scale to fill the width of their parent due to 
     * the restrictions of Shadow DOM components.
     * 
     * **Default config**
     * ```css
     * 
     * :host {display: block; width: 100%; box-sizing: border-box;}
     * ```
     * 
     * ### Parameters:
     * - **hostCSS** (`string`): The new host CSS to be injected.
     * 
     * ### Example:
     * ```js
     * 
     * class MyComp extends Comp {
     * 
     *     constructor() {
     * 
     *         super();
     *         this.host(`:host {display: inline-block; width: auto;}`);
     * 
     *     }
     * }
     * ```
     */
    public host(hostCSS: string) {
        this.design.hostOverride = hostCSS;
        this.render();
        return this;
    }

    /**
     * ## render
     * 
     * Injects the component’s HTML and CSS into its shadow root and re-attaches logic.
     * 
     * ### Behaviour
     * - Calls `createHTML()` to get the latest HTML fragment.  
     * - Calls `createCSS()` to get the latest CSS string.  
     * - Sets `shadowRoot.innerHTML` to the combined template (via `createTemplate`).  
     * - If `hook()` is implemented, invokes it immediately after DOM injection.
     * - Throws an Error if the shadow root is unavailable.
     * 
     * ### Throws
     * - `Error` if `this.shadowRoot` is `null` or undefined.
     * 
     * ### Returns
     * - `void`
     * 
     * ### Example
     * ```js
     * // After subclass initialization, simply:
     * this.render();
     *
     * // Or as part of a lifecycle:
     * connectedCallback() {
     *   // ensure all state is ready
     *   this.render();
     * }
     * ```
     */
    public render(): void {
        if (!this.shadowRoot) throw new Error("Shadow root is not available.");

        this.shadowRoot.innerHTML = this.createTemplate(
            this.createHTML(), this.createCSS()
        );

        if (typeof this.hook === "function") this.hook();
    }

    /**
     * ## update
     * 
     * Re-renders the component by injecting fresh HTML and CSS into its shadow root.
     * 
     * ### Behaviour
     * - If both `newHTML` and `newCSS` are supplied, uses those values directly.
     * - If either argument is omitted, calls the corresponding
     *   `createHTML()` or `createCSS()` override to regenerate the missing piece.
     * - Throws if the component’s shadow root is not attached.
     * - After updating the DOM, invokes `hook()` so event listeners and other logic
     *   are wired up again.
     * 
     * ### Parameters
     * - `newHTML?` (`string`): Optional HTML fragment to inject.  
     *   If omitted, runs `this.createHTML()`.
     * - `newCSS?` (`string`): Optional CSS string to inject.  
     *   If omitted, runs `this.createCSS()`.
     * 
     * ### Example
     * ```js
     * // Case 1: update both HTML and CSS explicitly
     * this.update(
     *   `<p>${this.message}</p>`,
     *   this.css({ color: "red" })
     * );
     * 
     * // Case 2: regenerate from your subclass methods
     * set message(text) {
     *   this.message = text;
     *   this.update();         // calls createHTML/createCSS internally
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

    /**
     * ## css
     * 
     * Compiles a CSS declaration block from a `CSSConfig` object.
     * 
     * ### Behaviour:
     * - Converts camelCased keys into kebab-case (e.g. `flexDirection` → `flex-direction`).
     * - Appends `px` to numeric values by default (e.g. `padding: 10` → `10px`).
     * - Detects keys ending in `Percent` and treats their value as a percentage  
     *   (e.g. `widthPercent: 50` → `width: 50%`).
     * - Supports array values for shorthand properties:  
     *   `padding: [8, 24]` → `padding: 8px 24px`.
     * - Recognises boolean flags for common rules:  
     *   `border: true` injects a default border (e.g. `1px solid var(--border-color)`).
     * - Accepts UK spellings for CSS properties ('colour', 'centre' etc).
     * - Applies a `class` field to scope the rules to a selector (e.g. `.my-class { … }`).
     * 
     * ### Parameters:
     * - **config** (`CSSConfig`):  
     *   An object whose keys are CSS properties (or helper fields) and whose values
     *   specify the rule. See example below for supported fields.
     * 
     * ### Returns:
     * `string` – A string of compiled CSS, with the selector and declarations ready
     * to inject into a `<style>` block.
     * 
     * ### Example:
     * ```js
     * const config = {
     *   class:         "container",
     *   display:       "flex",
     *   flexDirection: "column",
     *   widthPercent:  80,              // becomes "width: 80%;"
     *   maxWidth:      600,             // becomes "max-width: 600px;"
     *   padding:       [16, 32],        // becomes "padding: 16px 32px;"
     *   colour:        "white",         // UK spelling
     *   background:    "black100",
     *   border:        true,            // injects default border rule
     *   borderRadius:  8,               // becomes "border-radius: 8px;"
     *   opacity:       0.9,
     *   pseudoClass:   "hover"          // wraps declarations in ":host(:hover) { … }"
     * };
     *
     * const cssText = this.css(config);
     * ```
     * This compiles into:
     * ```css
     * .container:hover {
     *     display: flex;
     *     flex-direction: column;
     *     width: 80%; max-width: 600px;
     *     padding: 16px 32px;
     *     color: white;
     *     background: var(--black100);
     *     border: 1px solid var(--border-color);
     *     border-radius: 8px; opacity: 0.9;
     * }
     * ```
    * 
    */
    public css(css: CSSConfig): string { return this.design.create(css);}

    /**
     * ## request
     *
     * Performs an HTTP GET or POST and returns the parsed JSON body.
     *
     * ### Behaviour
     * - Validates that `method` is `"GET"` or `"POST"`.  
     * - For POST, serialises `data` to JSON.  
     * - Throws on non-2xx responses or network errors.
     *
     * ### Type Parameters
     * - `T` – the expected shape of the JSON response.
     *
     * ### Parameters
     * - `url` (`string`): endpoint URL (absolute or relative).
     * - `method` (`"GET" | "POST"`): HTTP verb.
     * - `data?` (`object`): request payload for POST; ignored for GET.
     *
     * ### Returns
     * `Promise<T>` – the deserialised JSON response.
     *
     * ### Example
     * ```js
     * async login() {
     *   const creds = { user: "alice", pass: "s3cret" };
     *   const resp = await this.request("/api/login", "POST", creds);
     *   console.log("JWT =", resp.token);
     * ```
     * ```ts
     * 
     * // Typescript
     * async login() {
     *   const creds = { user: "alice", pass: "s3cret" };
     *   const resp = await this.request<{ token: string }>("/api/login", "POST", creds);
     *   console.log("JWT =", resp.token);
     * }
     * ```
     */
    public async request<T> (url: string, method: "GET" | "POST", data?: object): Promise<T> {
        return this.api.request<T>(url, method, data);
    }
    
    /**
     * ## submitForm
     * 
     * Gathers form data (from a form element, `FormData` instance, or plain object)
     * and sends it via `multipart/form-data` POST, returning parsed JSON.
     * 
     * ### Behaviour
     * - If passed an `HTMLFormElement`, calls `new FormData(form)` to capture all fields.
     * - If passed a `FormData` instance, sends it directly.
     * - If passed a plain object, converts each key/value pair into FormData entries.
     * - Uses `fetch()` under the hood and throws on non-2xx responses or network errors.
     * 
     * ### Type Parameters
     * - `T` – the expected shape of the JSON response.
     * 
     * ### Parameters
     * - `url` (`string`): the endpoint URL to POST to.
     * - `data` (`HTMLFormElement | FormData | Record<string, any>`):  
     *   - An `HTMLFormElement` to be serialized  
     *   - A `FormData` object  
     *   - A plain object which will be converted to `FormData`  
     * 
     * ### Returns
     * `Promise<T>` – the parsed JSON response body.
     * 
     * ### Examples
     * 
     * // 1) Passing a form element
     * ```ts
     * const form = document.querySelector('form')!;
     * const result = await this.submitForm<{ success: boolean }>(
     *   "/api/profile",
     *   form
     * );
     * ```
     * 
     * // 2) Passing a FormData instance
     * ```ts
     * const fd = new FormData();
     * fd.append("username", "jay");
     * const result = await this.submitForm<{ id: number }>(
     *   "/api/users",
     *   fd
     * );
     * ```
     * 
     * // 3) Passing a plain object
     * ```ts
     * const data = { name: "Alice", age: 30, newsletter: true };
     * const result = await this.submitForm<{ status: "ok" }>(
     *   "/api/subscribe",
     *   data
     * );
     * ```
     */
    public async submitForm<T>(url: string, data: HTMLFormElement | FormData | Record<string, any>): Promise<T> {
        let formData: FormData;
        
        if (data instanceof HTMLFormElement) formData = new FormData(data);
        else if (data instanceof FormData) formData = data;
        else {
            formData = new FormData();
            for (const [k, v] of Object.entries(data)) { formData.append(k, String(v));}
        }

        return this.api.submitForm<T>(url, formData);
    }

    /**
     * Helper method that creates a template from component's HTML/CSS
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
     * ## createHTML
     * 
     * Generates the component’s inner HTML as a string.
     * 
     * ### Behaviour
     * - Must be overridden by subclasses to return the HTML fragment 
     *   that represents this component’s structure.
     * - Should not include `<style>` tags or host-level wrappers.
     * 
     * ### Returns
     * - `string`: HTML markup to inject into the shadow root.
     * 
     * ### Example
     * ```js
     * createHTML() {
     *   return `
     *     <button class="btn">${this.text}</button>
     *   `;
     * }
     * ```
     */
    protected abstract createHTML(): string;

    /**
     * ## createCSS
     * 
     * Generates the component’s CSS rules as a string.
     * 
     * ### Behaviour
     * - Must be overridden by subclasses to return CSS declarations 
     *   scoped to the component.
     * - Use the `css()` helper or `this.design.create()` to build rules
     *   from a `CSSConfig` object.
     * - Should only include rules inside a `<style>` block (no wrapper).
     * 
     * ### Returns
     * - `string`: CSS declarations to inject via `<style>`.
     * 
     * ### Example
     * ```js
     * createCSS() {
     *   return this.css({
     *     class:        "btn",
     *     background:   "black100",
     *     colour:       "white",
     *     padding:      10,
     *     borderRadius: 8
     *   });
     * }
     * ```
     */
    protected abstract createCSS(): string;

    /**
     * ## hook
     * 
     * Wires up component-specific logic after rendering.
     * 
     * ### Behaviour
     * - Must be overridden by subclasses.
     * - Called automatically after `render()` injects HTML & CSS.
     * - Use `this.shadowRoot` to query elements inside the shadow DOM.
     * 
     * ### Returns
     * - `void`
     * 
     * ### Example
     * ```js
     * hook() {
     *   const btn = this.shadowRoot.querySelector('button');
     *   btn.addEventListener('click', () => {
     *     console.log('Clicked!', this.text);
     *   });
     * }
     * ```
     */
    protected abstract hook(): void;

}