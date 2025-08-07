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

import { API, ApiResponse, FetchEntry } from "./api.js";
import { CSSConfig, Design } from "./design.js";
import { Effects } from "./effects.js";

type PropState<T = any> = {
    value: T;
    callback?: () => void | Promise<void>;
    onRender?: () => void | Promise<void>;
    current: T;
};

/**
 * # Comp
 *
 * Abstract base class for creating components that encapsulates:
 * - Shadow DOM setup
 * - Template rendering (HTML + CSS injection)
 * - Data fetching (`request()`, `submitForm()`, `fetchOnce()`)
 * - Event pub/sub (`publish()`, `subscribe()`)
 * - CSS generation from native JavaScript objects with media queries & keyframes
 * - Lifecycle hooks (`beforeRender()`, `createHTML()`, `createCSS()`, `afterRender()`)
 * - Helpers for accessing internal elements (`getById()`, `query()`, `queryAll()`)
 *
 * ## Overview
 *
 * 1. `beforeRender()` runs before any DOM or CSS is injected.
 * 2. An open shadow root is attached.
 * 3. `createHTML()` and `createCSS()` generate the markup and styles.
 * 4. HTML/CSS are injected via `render()`.
 * 5. `afterRender()` runs to wire up event listeners or start effects.
 *
 * ## CSS Generation
 *
 * Build scoped styles from `CSSConfig` or an array of them.
 * Supports:
 * - **Standard rules:** `class`, `pseudoClass`, fallback to `:host`
 * - **Media queries:** use `media` key with breakpoint props (e.g. `maxWidthBp`, nested configs)
 * - **Keyframes:** use `keyframes` key for pure or hybrid `@keyframes` blocks
 * - **Operators:** append suffixes to camelCase props for units/functions
 *
 * ### Operators
 * - `Percent` -> `%`
 * - `Var`     -> `var(--<value>)`
 * - `Url`     -> `url(<value>)`
 * - `Calc`    -> `calc(<value>)`
 * - `Em`      -> `em`
 * - `Rem`     -> `rem`
 * - `Vw`      -> `vw`
 * - `Vh`      -> `vh`
 * - `Vmin`    -> `vmin`
 * - `Vmax`    -> `vmax`
 * - `Ch`      -> `ch`
 * - `Ex`      -> `ex`
 * - `Pt`      -> `pt`
 * - `Pc`      -> `pc`
 * - `In`      -> `in`
 * - `Cm`      -> `cm`
 * - `Mm`      -> `mm`
 * - `Fr`      -> `fr`
 * - `S`       -> `s`
 * - `Ms`      -> `ms`
 * - `Deg`     -> `deg`
 * - `Rad`     -> `rad`
 * - `Grad`    -> `grad`
 * - `Turn`    -> `turn`
 * - `Dpi`     -> `dpi`
 * - `Dpcm`    -> `dpcm`
 * - `Dppx`    -> `dppx`
 * - `Q`       -> `q`
 * - `Hz`      -> `Hz`
 * - `KHz`     -> `kHz`
 *
 * ## Event Pub/Sub
 *
 * - **publish(name, detail?)**
 *   Dispatch a bubbling, composed `CustomEvent`.
 *
 * - **subscribe<T>(name, listener, options?, autoCleanup?)**
 *   Listen for an event, deduplicate by name, and auto-unsubscribe on disconnect.
 *   Returns an unsubscribe function.
 *
 * ## Data Fetching
 *
 * - **request<Api>(url, method, data?)**
 *   JSON GET/POST helper returning typed data.
 *
 * - **submitForm<Api>(url, form \| FormData \| Record)**
 *   Multipart form POST returning parsed JSON.
 *
 * - **fetchOnce<Key,Value>(key, fetcher)**
 *   Memoised fetch to avoid duplicate requests in a render cycle.
 *
 * ## Properties
 *
 * - **design** (`Design`)   — style builder & default host rules
 * - **api** (`API`)         — HTTP & submission helpers
 * - **effect** (`Effects`)  — animation & side-effect utilities
 *
 * ## Methods
 *
 * - `render()`
 * - `update(html?, css?)`
 * - `css(config \| config[])`
 * - `beforeRender()`
 * - `createHTML()`
 * - `createCSS()`
 * - `afterRender()`
 * - `publish()` / `subscribe()`
 * - `request()` / `submitForm()` / `fetchOnce()`
 *
 * ## Example
 *
 * ```ts
 *
 * class MyComp extends Comp {
 *   private msg: string;
 *
 *   beforeRender() {
 *      if (!this.msg) this.msg = "Hello Jay!";
 *   }
 *
 *   createHTML() { return `<button>${this.msg}</button>`; }
 *
 *   createCSS() {
 *     return [
 *       {
 *         class: "btn",
 *         backgroundVar: "primary",
 *         colour: "white",
 *         padding: [8,16],
 *         borderRadiusPercent: 50,
 *         media: {
 *           maxWidthBp: 600,
 *           padding: 5
 *         }
 *       },
 *       {
 *         keyframes: {
 *           name: "pulse",
 *           from: { opacity: 1 },
 *           "50%": { opacity: 0.5 },
 *           to: { opacity: 1 }
 *         }
 *       }
 *     ];
 *   }
 *
 *   afterRender() {
 *     this.subscribe("pulse-done", () => console.log("done"));
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

    // Tracks component registration
    private static registry = new Set<string>();

    // Tracks active event listeners and listeners to be unsubscribed
    private unsubscribers: Array<() => void> = [];
    private listeners = new Map<String, EventListener>();

    // Properties and prop accessor methods (Getter/Setter)
    private static definedAccessors = new WeakSet<Function>();
    protected properties: Record<string, PropState> = {};

    // Tracks component state
    private mounted = false;

    // Component template attributes
    private html!:
        | string
        | (() => string)
        | { html: string | (() => string); css?: string };
    private css!: Array<CSSConfig> | CSSConfig;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    /**
     * Custom Elements hook run every time element is loaded, Jay uses it create and setup
     * internal property getter and setters.
     *
     * If the element has been rendered to the DOM then it is ignored.
     */
    connectedCallback() {
        if (this.mounted) return;
        this.mounted = true;

        this.createProps();
        this.propAccessors();
        this.render();
    }

    /**
     * Method internally builds an HTML Element based off the classname prefixed with 'comp-'.
     */
    private static register(ctor: typeof Comp) {
        const raw = ctor.name;
        if (!raw) throw new Error(`Can't auto-derive tag for ${ctor.name}`);

        const tag =
            "comp-" + raw.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

        if (!Comp.registry.has(tag)) {
            customElements.define(
                tag,
                ctor as unknown as CustomElementConstructor
            );
            Comp.registry.add(tag);
        }
    }

    /**
     * ## define
     *
     * Registers a `Comp` subclass as a custom element under the “comp-…” namespace.
     *
     * ### Behaviour
     * Converts the component's class name into a valid tag name and performs a one-time
     * registration with the browser’s Custom Elements registry.
     *
     * ### Errors
     * Throws an `Error` if:
     * - The class name is empty or
     * - The derived tag name would be an empty string
     *   (e.g. your class is literally named `Comp` or doesn’t end with any characters).
     *
     * ### Example
     * ```ts
     * import { Comp } from "../dist/comp.js";
     *
     * export class UserLoginPage extends Comp {
     *   // … your createHTML/createCSS/hook …
     *
     *   static { this.define(); } // optionally define internally
     * }
     *
     * // Register at load time
     * UserLoginPage.define();
     * ```
     * ```html
     *
     * <!-- Now you can use <comp-user-login-page> in your HTML -->
     * <comp-user-login-page></comp-user-login-page>
     * ```
     */
    public static define() {
        this.register(this);
    }

    /**
     * Scans the instance for properties that match the { default } pattern.
     * Creates the internal `properties` map and removes those props from the instance.
     */
    private createProps() {
        for (const key of Object.keys(this)) {
            const val = (this as any)[key];

            if (
                val &&
                typeof val === "object" &&
                ("value" in val || "callback" in val || "onRender" in val)
            ) {
                const resolve = (v: any) => (typeof v === "function" ? v() : v);

                this.properties[key] = {
                    value: resolve(val.value),
                    callback:
                        typeof val.callback === "function"
                            ? val.callback
                            : undefined,
                    onRender:
                        typeof val.onRender === "function"
                            ? val.onRender
                            : undefined,
                    current: resolve(val.value),
                };

                delete (this as any)[key];
            }
            // define HTML/CSS
            else if (
                val &&
                typeof val === "object" &&
                "html" in val &&
                "css" in val
            ) {
                this.html = val;

                const rawCSS = val.css;
                if (rawCSS && typeof rawCSS === "object" && "value" in rawCSS) {
                    this.css = rawCSS.value;
                } else {
                    this.css = rawCSS;
                }
            } else if (val && typeof val === "object" && "html" in val) {
                this.html = val;
            } else if (val && typeof val === "object" && "css" in val) {
                const rawCSS = val.css;
                this.css =
                    typeof rawCSS === "object" && "value" in rawCSS
                        ? rawCSS.value
                        : rawCSS;
            }
        }
    }

    /**
     * Creates dynamic getters and setters on the instance's prototype
     * for all detected properties.
     */
    private propAccessors() {
        const proto = Object.getPrototypeOf(this);
        const ctor = proto.constructor;

        if (Comp.definedAccessors.has(ctor)) return;

        for (const key of Object.keys(this.properties)) {
            this.defineProp(proto, key);
        }

        Comp.definedAccessors.add(ctor);
    }

    /**
     * Defines a property and its `loading`/`error` accessors on the given prototype.
     */
    private defineProp(proto: any, key: string) {
        Object.defineProperty(proto, key, {
            get(this: Comp) {
                return this.properties[key]?.current;
            },
            set(this: Comp, value: any) {
                const prop = this.properties[key];
                if (!prop) return;
                if (prop.current === value) return;
                prop.current = value;
                this.update();
            },
            enumerable: true,
            configurable: true,
        });
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

        const html = this.buildHTML();
        const css = this.buildCSS();

        this.shadowRoot.innerHTML = this.createTemplate(
            html,
            this.compileCSSObjects(css)
        );

        this.runOnRenderHooks();
        this.runPostRenderHooks();
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
    update(newHTML?: string, newCSS?: Array<CSSConfig>): void {
        if (!this.shadowRoot) throw new Error("No shadow root");

        const html = this.buildHTML();
        const css = this.buildCSS();

        this.shadowRoot.innerHTML = this.createTemplate(
            html,
            this.compileCSSObjects(css)
        );

        this.runPostRenderHooks();
    }

    /**
     * Method runs all callback functions from the properties map.
     */
    private runPostRenderHooks() {
        for (const key in this.properties) {
            const prop = this.properties[key];
            if (prop && typeof prop.callback === "function") {
                console.log("Running post render hooks...");
                prop.callback.call(this);
            }
        }
    }

    /**
     * Method runs all on render hooks from the properties map.
     */
    private runOnRenderHooks() {
        for (const key in this.properties) {
            const prop = this.properties[key];
            if (prop && typeof prop.onRender === "function") {
                console.log("Running on render hooks...");
                prop.onRender.call(this);
            }
        }
    }

    /**
     * Helper methods builds HTML from the components html attribute.
     *
     * Method takes into account functions and nested statements.
     */
    private buildHTML(input?: any): string {
        let html = "";
        const source = input ?? this.html;

        if (typeof source === "function") {
            html = source();
        } else if (typeof source === "string") {
            html = source;
        } else if (typeof source === "object" && source !== null) {
            if ("html" in source) {
                return this.buildHTML(source.html);
            } else {
                throw new Error("Object html must contain an 'html' property.");
            }
        } else {
            throw new Error("Invalid html definition.");
        }

        return html;
    }

    /**
     * Helper method builds CSS from the components css attribute.
     */
    private buildCSS(): Array<CSSConfig> | CSSConfig | string {
        let css = this.css ? this.css : "";
        if (typeof css === "function") css = css.call(this);
        return css;
    }

    /**
     * Helper method conpiles CSSConfig objects into strings.
     */
    private compileCSSObjects(
        css: CSSConfig | string | Array<CSSConfig | string>
    ): string {
        const rawArray = Array.isArray(css) ? this.flatten(css) : [css];

        return rawArray
            .map((entry) => {
                if (typeof entry === "string") return entry;
                else return this.design.create(entry);
            })
            .join("\n");
    }

    /**
     * Helper method flattens arrays and compiles each config recursively.
     */
    flatten(
        items: any[],
        out: Array<CSSConfig | string> = []
    ): Array<CSSConfig | string> {
        for (const item of items) {
            if (Array.isArray(item)) this.flatten(item, out);
            else out.push(item);
        }

        return out;
    }

    /**
     * ## setProp
     */
    public setProp(key: string, value: any) {
        for (const k in this.properties) {
            const prop = this.properties[k];
            if (prop.current == "object") {
                for (const p in prop.current) {
                    if (p === key) console.log("Found prop");
                }
            }
        }
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
    public async request<T>(
        url: string,
        method: "GET" | "POST",
        data?: object
    ): Promise<ApiResponse<T>> {
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
    public async submitForm<T>(
        url: string,
        data: HTMLFormElement | FormData | Record<string, any>
    ): Promise<ApiResponse<T>> {
        let formData: FormData;

        if (data instanceof HTMLFormElement) formData = new FormData(data);
        else if (data instanceof FormData) formData = data;
        else {
            formData = new FormData();
            for (const [k, v] of Object.entries(data)) {
                formData.append(k, String(v));
            }
        }

        return this.api.submitForm<T>(url, formData);
    }

    /**
     * ## publish
     *
     * Dispatches a custom event from this element with an optional payload.
     *
     * ### Behaviour
     * - Creates and dispatches a `CustomEvent` using `this.dispatchEvent`.
     * - Event bubbles (`bubbles: true`) and crosses shadow DOM boundaries (`composed: true`).
     *
     * ### Parameters
     * - `name` (`string`):
     *   The event type/name to publish (e.g. `"data-loaded"`).
     * - `detail` (`unknown`, optional):
     *   Any data to attach to the event’s `detail` property.
     *
     * ### Returns
     * `void`
     *
     * ### Examples
     * ```ts
     * // Notify that user data has loaded
     * this.publish("user-loaded", { id: 42, name: "Alice" });
     *
     * // Fire a simple ping with no payload
     * this.publish("ping");
     * ```
     */
    protected publish(name: string, detail?: unknown) {
        this.dispatchEvent(
            new CustomEvent(name, {
                detail: detail,
                bubbles: true,
                composed: true,
            })
        );
    }

    /**
     * ## subscribe
     *
     * Registers a listener for a named event on this element (or its descendants).
     * Listener is unsubscribed automatically when the component is removed.
     *
     * ### Behaviour
     * - Removes any existing listener for the same `name` before adding a new one.
     * - Wraps the user callback so it receives a strongly-typed `CustomEvent<T>`.
     * - Stores an unsubscribe function for manual removal or automatic teardown.
     *
     * ### Type Parameters
     * - `T` – The shape of the event’s `detail` payload.
     *
     * ### Parameters
     * - `name` (`string`):
     *   The event type to listen for (e.g. `"data-loaded"`).
     * - `listener` (`(evt: CustomEvent<T>) => void`):
     *   Callback invoked with the event when it fires.
     * - `options` (`boolean | AddEventListenerOptions`, optional):
     *   Standard `addEventListener` options (`capture`, `once`, etc.).
     * - `autoCleanup` (`boolean`, default `true`):
     *   If true, the listener is automatically removed in `disconnectedCallback`.
     *
     * ### Returns
     * `() => void` – A function that, when called, removes this listener immediately.
     *
     * ### Examples
     * ```ts
     * // Listen for a custom event and log its detail
     * const unsub = this.subscribe<{ items: number[] }>(
     *   "data-loaded",
     *   evt => console.log(evt.detail.items)
     * );
     *
     * // Manually unsubscribe before removal or leave to be unsubscribed on removal
     * unsub();
     * ```
     */
    protected subscribe<T>(
        name: string,
        listener: (evt: CustomEvent<T>) => void,
        options?: boolean | AddEventListenerOptions,
        autoCleanup: boolean = true
    ): () => void {
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
        };

        if (autoCleanup) this.unsubscribers.push(unsubscribe);

        return unsubscribe;
    }

    /**
     * ## disconnectedCallback
     *
     * Lifecycle hook invoked when the element is removed from the document.
     *
     * ### Behaviour
     * - Calls all stored unsubscribe functions to remove active listeners.
     * - Clears internal maps and lists to prevent memory leaks.
     *
     * ### Returns
     * `void`
     *
     * ### Examples
     * ```ts
     * // No manual action needed; all listeners auto-clean up on disconnect.
     * ```
     */
    disconnectedCallback() {
        this.mounted = false;
        this.unsubscribers.forEach((unsub) => unsub());
        this.unsubscribers.length = 0;
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
        const clean = id.startsWith("#") ? id.slice(1) : id;
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
    protected queryAll<T extends Element = Element>(
        sel: string
    ): NodeListOf<T> {
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
}
