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

import { API, ApiResponse, FetchEntry } from './api.js';
import { CSSConfig, Design } from "./design.js";
import { Effects } from "./effects.js";

/**
 * # Comp
 * 
 * Abstract base class for custom elements that encapsulates Shadow DOM setup,
 * template rendering, styling, data fetching, and lifecycle hooks.
 * 
 * ## Overview
 * This class handles the core lifecycle and utilities of a component:
 * - Calls `beforeRender()` hook before rendering for pre render logic
 * - Attaches an open shadow root  
 * - Injects HTML and CSS via `render()`  
 * - Provides JSON and multipart HTTP helpers (`request()`, `submitForm()`)  
 * - Offers a `css()` helper for building scoped styles  
 * - Calls `afterRender()` hook after rendering to wire up interactivity  
 * 
 * Subclasses must override three methods:
 * - `beforeRender(): void` — runs before DOM/CSS injection to add logic  
 * - `createHTML(): string` — returns the component’s inner markup  
 * - `createCSS(): string` — returns component-scoped CSS rules  
 * - `afterRender(): void` — runs after DOM/CSS injection to add event listeners or logic  
 * 
 * ## Properties
 * - **design** (`Design`) — style builder, including default host rules  
 * - **api** (`API`)        — HTTP helper for JSON and form submissions  
 * - **effect** (`Effects`) — animation and side-effect utility  
 * 
 * ## Methods
 * - **render(): void**  
 *   Attaches HTML/CSS to the shadow root and then calls `hook()`.  
 * 
 * - **update(html?: string, css?: string): void**  
 *   Re-injects optional overrides or regenerates via `createHTML()`/`createCSS()`.  
 * 
 * - **css(config: CSSConfig): string**  
 *   Compiles a CSSConfig object into a CSS block.  
 * 
 * - **request<ApiResponse<T>>(url: string, method: "GET" | "POST", data?: object): Promise<T>**  
 *   Sends a JSON GET/POST and returns the parsed response.  
 * 
 * - **submitForm<ApiResponseT>(url: string, data: HTMLFormElement \| FormData \| Record<string, any>): Promise<T>**  
 *   Converts input into `FormData`, POSTS as multipart, and parses JSON.  
 * 
 * ## Example
 * ```js
 * class MyComp extends Comp {
 *   greeting_ = "Hello, world!";
 * 
 *   createHTML(): string {
 *     return `<button class="btn">${this.greeting_}</button>`;
 *   }
 * 
 *   createCSS(): string {
 *     return {
 *       class: "btn",
 *       background: "blue100",
 *       colour: "white",
 *       padding: [8, 16],
 *       borderRadius: 4,
 *       media: {
 *           size: 600,
 *           fontSize: 16
 *      );
 *   }
 * 
 *   afterRender(): void {
 *     const btn = this.shadowRoot!.querySelector("button")!;
 *     btn.addEventListener("click", () => alert(this.greeting));
 *   }
 * 
 *   static { Comp.register(this); }
 * }
 * ```
 */
export abstract class Comp extends HTMLElement {
    
    private api = new API();
    public effect = new Effects();
    private design = new Design();

    private static _registry = new Set<string>();
    protected asyncStore: Record<string, FetchEntry<any>> = {};
    private unsubscribers_: Array<() => void> = [];
    private listeners = new Map<String, EventListener>();


    /**
     * ## register
     * 
     * Registers a `Comp` subclass as a custom element under the “comp-…” namespace.
     * 
     * ### Behavior 
     * - Converts class name to kebab-case  
     * - Prefixes the result with `"comp-"`  
     * - Calls `customElements.define()` once, avoiding duplicate registrations  
     * 
     * ### Parameters
     * - `ctor: typeof Comp`  
     *   The subclass constructor that you want to register.  
     * 
     * ### Errors
     * Throws an `Error` if stripping “Comp” yields an empty string (i.e. the class is  
     * named just `"Comp"` or doesn’t end in `"Comp"`).  
     * 
     * ### Example
     * ```ts
     * export class UserLoginPageComp extends Comp {
     *   // … your createHTML/createCSS/hook …
     * 
     *   // auto-register at load time
     *   static {
     *     Comp.register(this);
     *   }
     * }
     * 
     * // After import, <comp-user-login-page> is available in the DOM
     * ```
     */
    protected static register(ctor: typeof Comp) {
    
        const raw = ctor.name;
        if (!raw) throw new Error(`Can't auto-derive tag for ${ctor.name}`);

        const tag = "comp-" + raw
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .toLowerCase();

        if (!Comp._registry.has(tag)) {
            customElements.define(tag, ctor as unknown as CustomElementConstructor);
            Comp._registry.add(tag);
        }
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.render();
    }

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
     * - **css** (`string`): The new host CSS to be injected.
     * 
     * ### Example:
     * ```js
     * 
     * class MyComp extends Comp {
     *     constructor() {
     *         super();
     *         this.host({width: "auto", boxSizing: "border-box"});
     *     }
     * }
     * ```
     */
    public host(css: CSSConfig) {
        this.design.hostOverride = this.design.create(css);
        this.render();
        return this;
    }

    /**
     * ## render
     * 
     * Injects the component’s HTML and CSS into its shadow root and re-attaches logic.
     * 
     * ### Behaviour
     *  - If `beforeRender()` is implemented, invokes it immediately before DOM injection.
     * - Calls `createHTML()` to get the latest HTML fragment.  
     * - Calls `createCSS()` to get the latest CSS string.  
     * - Sets `shadowRoot.innerHTML` to the combined template (via `createTemplate`).  
     * - If `afterRender()` is implemented, invokes it immediately after DOM injection.
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

        if (typeof this.beforeRender === "function") this.beforeRender();

        this.shadowRoot.innerHTML = this.createTemplate(
            this.createHTML(), this.compileCSSObjects(this.createCSS())
        );

        if (typeof this.afterRender === "function") this.afterRender();
    }

    /**
     * Helper method conpiles CSSConfig objects into strings.
     */
    private compileCSSObjects(css: CSSConfig | string | Array<CSSConfig | string>): string {
        const rawArray = Array.isArray(css) ? this.flatten(css) : [css];

        return rawArray.map(entry => {
            if (typeof entry === "string") return entry;
            else return this.design.create(entry);    
        }).join("\n");
    }

    /**
     * Helper method flattens arrays and compiles each config recursively.
     */
    flatten(items: any[], out: Array<CSSConfig | string> = []): Array<CSSConfig | string> {
        for (const item of items) {
        if (Array.isArray(item)) this.flatten(item, out);
        else out.push(item);
        }

        return out;
    };

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
    update(newHTML?: string, newCSS?: Array<CSSConfig>): void {
        if (!this.shadowRoot) throw new Error("No shadow root");

        if (typeof this.beforeRender === "function") this.beforeRender();
        
        const html = newHTML || this.createHTML();
        const css  = newCSS || this.createCSS();
       
        this.shadowRoot.innerHTML = this.createTemplate(html, this.compileCSSObjects(css));
        
        if (typeof this.afterRender === "function") this.afterRender();
    }

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
     * `Promise<ApiResponseT>` – the deserialised JSON response.
     * - `ok`: boolean
     * - `status`: number
     * - `data`?: T
     * - `error`?: string
     *
     * ### Example
     * ```ts
     * // GET
     * const usersResp = await this.request<User[]>("/api/users", "GET");
     * if (usersResp.ok) {
     *     console.log("Got users:", usersResp.data);
     * } else {
     *    console.error("Fetch users failed:", usersResp.status, usersResp.error);
     * }
     * 
     * // POST
     * const loginResp = await this.request<{ token: string }>("/api/login", "POST",{ user: "alice", pass: "s3cret" });
     * 
     * if (loginResp.ok) {
     *    console.log("JWT =", loginResp.data.token);
     * } else {
     *    console.error("Login error:", loginResp.status, loginResp.error);
     * }
     * ```
     */
    public async request<T> (url: string, method: "GET" | "POST", data?: object): Promise<ApiResponse<T>> {
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
     *   - An `HTMLFormElement` to be serialised  
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
     * 
     * const form = document.querySelector('form')!;
     * const result = await this.submitForm<{ success: boolean }>(
     *   "/api/profile",
     *   form
     * );
     * ```
     * 
     * // 2) Passing a FormData instance
     * ```ts
     * 
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
     * 
     * const data = { name: "Alice", age: 30, newsletter: true };
     * const result = await this.submitForm<{ status: "ok" }>(
     *   "/api/subscribe",
     *   data
     * );
     * ```
     */
    public async submitForm<T>(url: string, data: HTMLFormElement | FormData | Record<string, any>): Promise<ApiResponse<T>> {
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
     * ## fetchOnce
     * 
     * Fetches data exactly once for a given key and returns a live cache entry
     * that tracks loading, success and error states. Subsequent calls with the
     * same key return the cached result instead of re‐invoking the loader.
     * 
     * ### Behavior
     * - On first invocation the fetched data is stored within the component's `asyncStore`.
     * - On subsequent calls, the data is retrieved from `asyncStore`
     * 
     * ### Type Parameters
     * - `T` – The expected element type.
     * 
     * ### Parameters
     * - `key` (`string`): The desired key from the request response.
     * - `loader` (`Promise<T>`): A function that returns a `Promise<T>`. Called only once.
     * 
     * ### Returns
     * `FetchEntry<T>` – the fetched response object.
     *
     * ### Example
     * ```ts
     * 
     * // TypeScript
     * createHTML() {
     *   const { value: fact, loading, error } = this.fetchOnce<string>(
     *     "catFact",
     *     () => this.request("/fact", "GET")
     *          .then(res => res.ok ? res.data.fact : Promise.reject(res.error))
     *   );
     *
     *   if (loading) return `<h1>Loading a random cat fact…</h1>`;
     *   if (error) return `<h1>Failed to load fact: ${error}</h1>`;
     *   
     *   return `<h1 class="fact">${fact}</h1>`;
     * }
     * ```
    */
    public fetchOnce<T>(key: string, loader: () => Promise<T>): FetchEntry<T> {
        let entry = this.asyncStore[key] as FetchEntry<T>;
        if (entry) return entry;
        
        entry = { value: undefined, loading: true, error: undefined };
        this.asyncStore[key] = entry;

        loader().then(result => {
            entry.value = result;
            entry.error = undefined;
            entry.loading = false;
            this.update();      
        }).catch(err => {
            entry.error = err?.message || err;
            entry.loading = false;
            this.update();
        });

        return entry;
    }

    protected publish(name: string, detail?: unknown) {
        this.dispatchEvent(new CustomEvent(name, {
            detail: detail,
            bubbles: true,
            composed: true
        }))
    }

    protected subscribe<T>(
        name: string,
        listener: (evt: CustomEvent<T>) => void,
        options?: boolean | AddEventListenerOptions,
        autoCleanup: boolean = true
    ): () => void {
        // Check for existing component listner
        if (this.listeners.has(name)) {
            const old = this.listeners.get(name)!;
            this.removeEventListener(name, old, options);
        }

        const bound = (e: Event) => listener(e as CustomEvent<T>);
        this.listeners.set(name, bound);
        this.addEventListener(name, bound, options);

        const unsubscribe = () => {
            this.removeEventListener(name, bound, options);
            this.listeners.delete(name);
        }
        
        if (autoCleanup) this.unsubscribers_.push(unsubscribe);

        return unsubscribe;
    }

    /**
     * ## getById
     * 
     * Retrieves an element from the shadow DOM by its ID.
     * 
     * ### Behaviour
     * - Strips a leading `#` if provided.  
     * - Delegates to `shadowRoot.getElementById`.  
     * - Returns `null` when no matching element is found.
     * 
     * ### Type Parameters
     * - `T` – The expected element type (defaults to `HTMLElement`).
     * 
     * ### Parameters
     * - `id` (`string`):  
     *   The identifier of the element, with or without a leading `#`.
     * 
     * ### Returns
     * `T | null` – The element matching the ID, or `null` if none exists.
     * 
     * ### Examples
     * ```ts
     * // Lookup without '#'
     * const btn = this.getById<HTMLButtonElement>('submitBtn');
     * btn?.addEventListener('click', () => console.log('Clicked'));
     * 
     * // Lookup with '#'
     * const input = this.getById<HTMLInputElement>('#usernameInput');
     * if (input) input.value = 'alice';
     * ```
     */
    protected getById<T extends Element = HTMLElement>(id: string): T | null {
        const clean = id.startsWith('#') ? id.slice(1) : id;
        return this.shadowRoot!.getElementById(clean) as T | null;
    }

    /**
     * ## query
     * 
     * Selects the first element in the shadow DOM matching a CSS selector.
     * 
     * ### Behaviour
     * - Delegates to `shadowRoot.querySelector`.  
     * - Returns `null` when no matching element is found.
     * 
     * ### Type Parameters
     * - `T` – The expected element type (defaults to `Element`).
     * 
     * ### Parameters
     * - `sel` (`string`):  
     *   A valid CSS selector (e.g. `'.foo'`, `'button'`, `'#bar'`, `[data-test]`, etc.).
     * 
     * ### Returns
     * `T | null` – The first matching element, or `null` if none exists.
     * 
     * ### Examples
     * ```ts
     * // Query a single item
     * const item = this.query<HTMLLIElement>('ul > li.active');
     * 
     * // Query an input by attribute
     * const email = this.query<HTMLInputElement>('input[name="email"]');
     * ```
     */
    protected query<T extends Element = Element>(sel: string): T | null {
        return this.shadowRoot!.querySelector(sel) as T | null;
    }

    /**
     * ## queryAll
     * 
     * Selects all elements in the shadow DOM matching a CSS selector.
     * 
     * ### Behaviour
     * - Delegates to `shadowRoot.querySelectorAll`.  
     * - Always returns a `NodeListOf<T>`, which may be empty.
     * 
     * ### Type Parameters
     * - `T` – The expected element type (defaults to `Element`).
     * 
     * ### Parameters
     * - `sel` (`string`):  
     *   A valid CSS selector for matching multiple elements.
     * 
     * ### Returns
     * `NodeListOf<T>` – A live list of all matching elements (empty if none).
     * 
     * ### Examples
     * ```ts
     * // Get all active list items
     * const items = this.queryAll<HTMLLIElement>('ul > li.active');
     * items.forEach(li => li.style.color = 'red');
     * 
     * // Get every button in the shadow root
     * const buttons = this.queryAll<HTMLButtonElement>('button');
     * buttons.forEach(btn => (btn.disabled = true));
     * ```
     */
    protected queryAll<T extends Element = Element>(sel: string): NodeListOf<T> {
        return this.shadowRoot!.querySelectorAll(sel) as NodeListOf<T>;
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
    protected abstract createCSS(): Array<CSSConfig> | CSSConfig;

    /**
     * ## afterRender
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
     * afterRender() {
     *   const btn = this.shadowRoot.querySelector('button');
     *   btn.addEventListener('click', () => {
     *     console.log('Clicked!', this.text);
     *   });
     * }
     * ```
     */
    protected abstract afterRender(): void;

    /**
     * ## afterRender
     * 
     * Wires up component-specific logic before rendering.
     * 
     * ### Behaviour
     * - Must be overridden by subclasses.
     * - Called automatically before `render()` injects HTML & CSS.
     * 
     * ### Returns
     * - `void`
     * 
     * ### Example
     * ```js
     * beforeRender() {
     *   // example
     * }
     * ```
     */
    protected abstract beforeRender(): void;


    disconnectedCallback() {
        this.unsubscribers_.forEach(unsub => unsub());
        this.unsubscribers_.length = 0;
    }
}