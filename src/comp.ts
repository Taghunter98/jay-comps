/**
 * Copyright (c) 2025 Josh Bassett
 *
 * Filename:    comp.ts
 * Author:      Josh Bassett
 * Date:        08/06/2025
 * Version:     2.1.5
 *
 * Licence:     Apache 2.0
 */

import { API, ApiResponse } from "./api.js";
import { CSSConfig, Design } from "./design.js";

/**
 * User Types for component elements
 */
export {
    HTMLTemplate as HTML,
    CSSTemplate as CSS,
    Template,
    ComponentHook as Hook,
};

type HTMLTemplate = string | (() => string);

type CSSTemplate =
    | string
    | CSSConfig
    | CSSConfig[]
    | (() => CSSConfig[])
    | (() => CSSConfig)
    | (() => string);

interface Template {
    html: HTMLTemplate;
    css?: CSSTemplate;
}

type ComponentHook = () => void;

type PropState<T = any> = {
    value: T;
    callback?: () => void | Promise<void>;
    onRender?: () => void | Promise<void>;
    current: T;
};

interface ComponentHooks {
    component?: Template;
    onRender?: ComponentHook;
    callback?: ComponentHook;
}

/**
 * # Component
 *
 * Abstract base class for building reusable, encapsulated Web Components with:
 *
 * - Shadow DOM setup
 * - Declarative rendering via a `component` object
 * - Reactive property system with auto-updating DOM
 * - Lifecycle hooks: `onRender()` and `callback()`
 * - Event pub/sub system
 * - CSS generation via native JavaScript/TypeScript objects
 * - Built-in data fetching utilities
 *
 * ---
 *
 * ## Component Lifecycle
 *
 * The component lifecycle is:
 *
 * 1. Shadow root is attached
 * 2. `component.html()` and `component.css()` are invoked
 * 3. HTML and compiled CSS are injected into the shadow DOM
 * 4. `onRender()` is called once after the first render
 * 5. `callback()` runs after every render (initial + updates)
 *
 * ---
 *
 * ## Component Definition
 *
 * Use the `component` object to define DOM structure and scoped styles:
 *
 * ```ts
 * component = {
 *   html: () => `<div class="greeting">${this.text}</div>`,
 *   css: () => [
 *     {
 *       class: "greeting",
 *       colour: "blue",
 *       padding: [12, 16],
 *     }
 *   ]
 * };
 * ```
 *
 * - `html()` returns a string (template-safe)
 * - `css()` returns one or more JS style objects compiled by Jay's CSS compiler
 *
 * ---
 *
 * ## Lifecycle Hooks
 *
 * Hooks are declared directly on the component instance:
 *
 * - `onRender()` — runs once after the initial render (e.g. to manipulate children)
 * - `callback()` — runs after every render (e.g. to bind events)
 *
 * Example:
 * ```ts
 * onRender = () => {
 *   this.query("#submit").text = "Submit Now";
 * };
 *
 * callback = () => {
 *   this.query("#submit").addEventListener("click", () => {
 *     this.publish("form-submitted");
 *   });
 * };
 * ```
 *
 * ---
 *
 * ## Reactive Properties
 *
 * Declare props as class fields:
 *
 * ```ts
 * class Button extends Comp {
 *   text = "Click me";
 *   fill = true;
 *
 *   component = {
 *     html: () => `<button>${this.text}</button>`,
 *     css: () => [{ width: this.fill ? "100%" : "auto" }]
 *   };
 * }
 * ```
 *
 * All props are converted into accessors per instance and scoped using `Symbol`s,
 * ensuring no cross-instance collisions. Changing a prop triggers a re-render.
 *
 * ---
 *
 * ## Jay CSS Compiler
 *
 * CSS is generated via plain JS/TS objects using `CSSConfig` objects:
 *
 * - Style definitions are scoped to each component’s shadow DOM
 * - Supports **media queries**, **pseudo-selectors**, and **keyframes**
 * - Accepts native data types: arrays, numbers, booleans, strings
 * - Adds **unit operators** via naming conventions (e.g. `widthPercent`)
 * - Supports **UK English** spellings for **CSS properties**
 *
 * ### Operators (Suffix-Based)
 *
 * | **Operator**                | **CSS Output**           | **Example**                                | **Compiled CSS**                              |
 * |----------------------------|---------------------------|---------------------------------------------|-----------------------------------------------|
 * | *(default number)*         | `px` (if non-zero)        | `margin: 16`                                | `margin: 16px;`                                |
 * | `Percent`                  | `%`                       | `widthPercent: 50`                          | `width: 50%;`                                  |
 * | `Var`                      | `var(--…)`                | `colourVar: "blue100"`                      | `color: var(--blue100);`                       |
 * | `Url`                      | `url(...)`                | `backgroundImageUrl: "hero.jpg"`            | `background-image: url(hero.jpg);`            |
 * | `Calc`                     | `calc(...)`               | `widthCalc: "100% - 32px"`                  | `width: calc(100% - 32px);`                    |
 * | `Em`, `Rem`                | `em`, `rem`               | `paddingEm: 1.5`, `marginRem: 2`            | `padding: 1.5em;`, `margin: 2rem;`             |
 * | `Vw`, `Vh`, `Vmin`, `Vmax` | viewport units            | `heightVh: 80`                              | `height: 80vh;`                                |
 * | `Ch`, `Ex`                 | character units           | `textIndentCh: 2`, `fontSizeEx: 1`          | `text-indent: 2ch;`, `font-size: 1ex;`         |
 * | `Pt`, `Pc`                 | print-based units         | `fontSizePt: 12`                            | `font-size: 12pt;`                             |
 * | `In`, `Cm`, `Mm`, `Q`      | metric/absolute lengths   | `widthCm: 10`, `borderQ: 4`                 | `width: 10cm;`, `border: 4q;`                  |
 * | `Fr`                       | grid fractions            | `gridTemplateColumnsFr: [1, 2]`             | `grid-template-columns: 1fr 2fr;`              |
 * | `S`, `Ms`                  | time units                | `transitionDurationS: 0.3`, `delayMs: 200`  | `transition-duration: 0.3s;`, `delay: 200ms;`  |
 * | `Deg`, `Rad`, `Grad`, `Turn` | angle units             | `rotateDeg: 45`                             | `transform: rotate(45deg);`                    |
 * | `Dpi`, `Dpcm`, `Dppx`      | resolution units          | `resolutionDpi: 300`                        | `resolution: 300dpi;`                          |
 * | `Hz`, `KHz`                | frequency                 | `audioRateHz: 60`, `signalKHz: 2.4`         | `audio-rate: 60Hz;`, `signal: 2.4kHz;`         |
 * | *(Raw string / keyword)*   | used directly             | `display: "flex"`                           | `display: flex;`                               |
 * | *(Array shorthand)*        | space-separated values    | `padding: [8, 16]`                          | `padding: 8px 16px;`                           |
 * | `pseudoClass`              | selector suffix           | `pseudoClass: "hover"`                      | `.my-class:hover { ... }`                      |
 *
 * Also supports:
 * - `media` key with nested responsive styles
 * - `keyframes` for defining animations
 *
 * Example:
 * ```ts
 * css: () => [
 *   {
 *     class: "box",
 *     widthPercent: 100,
 *     backgroundVar: "accent",
 *     media: {
 *       maxWidthBp: 768,
 *       padding: 16
 *     }
 *   },
 *   {
 *     keyframes: {
 *       name: "fade-in",
 *       from: { opacity: 0 },
 *       to: { opacity: 1 }
 *     }
 *   }
 * ]
 * ```
 *
 * ---
 *
 * ## Re-rendering
 *
 * Components update automatically when reactive properties change.
 *
 * To force a manual update:
 * ```ts
 * this.update(); // Regenerates HTML + CSS from `component`
 * ```
 *
 * ---
 *
 * ## Event Pub/Sub
 *
 * Use the built-in event system for component communication:
 *
 * - `publish(name: string, detail?: any)`
 *   Emits a bubbling, composed `CustomEvent`
 *
 * - `subscribe(name, listener, options?, autoCleanup?)`
 *   Subscribes to an event and optionally unsubscribes on disconnect
 *
 * Example:
 * ```ts
 * this.subscribe("modal-open", () => this.open = true);
 * this.publish("user-logged-in", { id: 42 });
 * ```
 *
 * ---
 *
 * ## Data Fetching
 *
 * - `request<Api>(url, method, data?)` — Typed JSON GET/POST
 * - `submitForm<Api>(url, form|FormData|object)` — Multipart POST
 *
 * ---
 *
 * ## Utility Methods
 *
 * - `render()` — Initial render into shadow DOM
 * - `update()` — Manual re-render
 * - `query(selector)` — Scoped query inside shadow DOM
 * - `queryAll(selector)` — Multiple matches
 * - `getById(id)` — Optimised `getElementById`
 *
 * ---
 *
 * ## Static API
 *
 * - `static define()` — Registers the component as a custom element
 *
 * ---
 *
 * ## Example
 *
 * ```ts
 * class MyButton extends Comp {
 *   text = "Send";
 *   fill = true;
 *
 *   component = {
 *     html: () => `<button class="btn">${this.text}</button>`,
 *     css: () => [
 *       {
 *         class: "btn",
 *         backgroundVar: "primary",
 *         colour: "white",
 *         padding: [8, 16],
 *         width: this.fill ? "100%" : "auto",
 *         borderRadius: 4
 *       }
 *     ]
 *   };
 *
 *   callback = () => {
 *     this.query("button").addEventListener("click", () => {
 *       this.publish("clicked", { id: 1 });
 *     });
 *   };
 *
 *   static {
 *     this.define();
 *   }
 * }
 * ```
 */
export abstract class Component extends HTMLElement implements ComponentHooks {
    private api = new API();
    private design = new Design();

    /**
     * ## component
     *
     * Defines the visual and structural representation of the component.
     * Includes the `html` and optional `css` used during render and updates.
     *
     * - HTML can be a static string or a function returning a string.
     * - CSS can be a single object or array of style objects, or a function returning them.
     *
     * ### Parameters
     * - `html`: `string` | `() => string`
     *   The markup rendered into the component’s shadow DOM.
     *
     * - `css?`: `CSSConfig` | `CSSConfig[]` | `() => CSSConfig | CSSConfig[]`
     *   The styles scoped to the component. See the **Jay CSS Compiler** section for syntax.
     *
     * ### Notes
     * - The `css` function is re-evaluated on every update cycle.
     * - All styles are fully encapsulated via Shadow DOM and the Jay compiler.
     *
     * ### Throws
     * May throw an `Error` if:
     * - `html` returns an invalid or empty string
     * - `css` returns malformed objects or unsupported values
     *
     * ### Examples
     *
     * ```ts
     * // Static Component
     * export class MyComp extends Comp {
     *   component = {
     *     html: `<h1 class="hello-world">Hello world!</h1>`,
     *     css: {
     *       class: "hello-world",
     *       colour: "red",
     *       fontSizePt: 24
     *     }
     *   };
     * }
     *
     * // Reactive Component
     * export class MyComp extends Comp {
     *   hello = "Hello";
     *   red = false;
     *
     *   component = {
     *     html: () => `<h1 class="hello-world">${this.hello} world!</h1>`,
     *     css: () => ({
     *       class: "hello-world",
     *       colour: this.red ? "red" : "black",
     *       fontSizePt: 24
     *     })
     *   };
     * }
     * ```
     */
    component?: Template;

    /**
     * ## onRender
     *
     * Lifecycle hook that runs after the DOM and styles are rendered,
     * but **before** any event listeners or effects are attached.
     *
     * Use this to:
     * - Set or modify child component props
     * - Query the DOM
     * - Run lightweight initialisation logic
     *
     * ### Throws
     * May throw an `Error` if:
     * - Elements referenced via `query()` or `getById()` are not yet present in the DOM
     *
     * ### Example
     * ```ts
     * export class MyComp extends Comp {
     *   data: string;
     *
     *   onRender = async () => {
     *     const res = await this.request("/get/fact", "GET");
     *     this.data = res.ok ? res.data.fact : res.error;
     *   };
     *
     *   component = {
     *     html: () => `<p>${this.data}</p>`
     *   };
     * }
     * ```
     *
     * ```ts
     * // Setting props on nested components
     * onRender = () => {
     *   this.query("comp-button").text = "Click Me!";
     * };
     *
     * component = {
     *   html: `
     *     <div>
     *       <comp-button></comp-button>
     *     </div>
     *   `
     * };
     * ```
     */
    onRender?: () => void;

    /**
     * ## callback
     *
     * Lifecycle hook that runs **after render**, and after all DOM nodes
     * have been attached and `onRender()` has completed.
     *
     * Use this for:
     * - Setting up event listeners (e.g. `click`, `keydown`)
     * - Subscribing to custom events via `subscribe()`
     * - Running side effects or animations
     *
     * ### Example
     * ```ts
     * callback = () => {
     *   this.query("button").addEventListener("click", () => {
     *     console.log("Button clicked!");
     *   });
     *
     *   this.subscribe("modal-closed", () => {
     *     this.hidden = true;
     *   });
     * };
     *
     * component = {
     *   html: `<button>Click me</button>`
     * };
     * ```
     */
    callback?: () => void;

    /**
     * ## html
     *
     * Defines the structural and visual markup of the component.
     * - Can be a static string or a function returning a string.
     * - The result is rendered into the component’s Shadow DOM.them.
     *
     * ### Type
     * - `html: string | () => string;`
     *
     * ### Behaviour
     * - The function form allows dynamic reactivity based on props.
     * - html is re-evaluated on every update cycle.
     * - Should return a valid HTML string.
     *
     * ### Throws
     * May throw an `Error` if:
     * - Returned value is not a string or is malformed
     *
     * ### Examples
     *
     * ```ts
     * class MyComponent extends Component {
     *    message = "Hello, Jay!";
     *
     *    html = () => <h1>${this.message}</h1>;
     * }
     * ```
     */
    html!: HTMLTemplate;

    css!: CSSTemplate;

    // Tracks component registration
    private static registry = new Set<string>();

    // Tracks active event listeners and listeners to be unsubscribed
    private unsubscribers: Array<() => void> = [];
    private listeners = new Map<String, EventListener>();

    // Properties and prop accessor methods (Getter/Setter)
    private static definedAccessors = new WeakSet<Function>();
    protected properties: Record<symbol, PropState> = {};
    private propNameToSymbol = new Map<string, symbol>();

    // Tracks component state
    private mounted = false;

    // List of internal properties to ignore
    private static readonly INTERNAL_KEYS = new Set([
        "api",
        "design",
        "unsubscribers",
        "listeners",
        "properties",
        "mounted",
        "propNameToSymbol",
        "html",
        "css",
    ]);

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
    private static register(ctor: typeof Component) {
        const raw = ctor.name;
        if (!raw) throw new Error(`Can't auto-derive tag for ${ctor.name}`);

        const tag =
            "comp-" + raw.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

        if (!Component.registry.has(tag)) {
            customElements.define(
                tag,
                ctor as unknown as CustomElementConstructor
            );
            Component.registry.add(tag);
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
     * Method scans the instance for properties and creates internal accessor methods.
     *
     * Then hooks are detected via the `callback` and `onRender` keywords and added to be
     * run when called.
     *
     * Creates the internal `properties` map and removes those props from the instance.
     */
    private createProps() {
        for (const key of Object.keys(this)) {
            if ((this.constructor as typeof Component).INTERNAL_KEYS.has(key)) {
                continue;
            }

            const val = (this as any)[key];
            const propSymbol = Symbol.for(`${this.tagName}-${key}`);
            this.propNameToSymbol.set(key, propSymbol);

            if (
                typeof val === "function" &&
                (key === "callback" || key === "onRender")
            ) {
                console.log("Found hook " + key);
                this.properties[propSymbol] = {
                    value: undefined,
                    current: undefined,
                    callback: key === "callback" ? val : undefined,
                    onRender: key === "onRender" ? val : undefined,
                };

                delete (this as any)[key];
            } else if (
                (val &&
                    typeof val === "object" &&
                    "html" in val &&
                    "css" in val) ||
                key === "html" ||
                key === "css"
            ) {
                this.html = val;
                const rawCSS = val.css;
                this.css =
                    typeof rawCSS === "object" && "value" in rawCSS
                        ? rawCSS.value
                        : rawCSS;
            } else {
                console.log("Creating prop: " + key);
                this.properties[propSymbol] = {
                    value: val,
                    current: val,
                };

                delete (this as any)[key];
            }
        }
    }

    /**
     * Creates dynamic getters and setters on the instance's prototype
     * for all detected properties.
     *
     * Props are stored as Symbols which avoids name overlap and collisions if another instance
     * uses the same prop definition.
     *
     * Collects defined accessors in the global set for referal.
     */
    private propAccessors() {
        const proto = Object.getPrototypeOf(this);
        const ctor = proto.constructor;

        const keywords = ["component", "onClick"];

        for (const [key, symbol] of this.propNameToSymbol.entries()) {
            if (keywords.includes(key)) continue;
            this.defineProp(this, key, symbol);
        }

        Component.definedAccessors.add(ctor);
    }

    /**
     * Defines a property and its accessors on the given prototype.
     *
     * Props are defined per instance, with its own properties map, avoiding collisions.
     */
    private defineProp(instance: any, key: string, symbol: symbol) {
        Object.defineProperty(instance, key, {
            get(this: Component) {
                return this.properties[symbol]?.current;
            },
            set(this: Component, value: any) {
                const prop = this.properties[symbol];
                if (prop.current === value) return;

                prop.current = value;
                this.update?.();
            },
            enumerable: true,
            configurable: true,
        });
    }

    public debugProperties() {
        for (const [key, symbol] of this.propNameToSymbol.entries()) {
            const prop = this.properties[symbol];
            console.log(`Key: ${key} val: ${this.properties[symbol].current}`);
        }
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
        for (const [key, symbol] of this.propNameToSymbol.entries()) {
            const prop = this.properties[symbol];
            if (prop && typeof prop.callback === "function") {
                prop.callback.call(this);
            }
        }
    }

    /**
     * Method runs all on render hooks from the properties map.
     */
    private runOnRenderHooks() {
        const symbols = Object.getOwnPropertySymbols(this.properties);

        for (const sym of symbols) {
            const prop = this.properties[sym];
            if (prop && typeof prop.onRender === "function") {
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
    private buildCSS(): CSSConfig[] | CSSConfig | string {
        const css = this.css;
        if (typeof css === "function") return (css as () => any).call(this);
        return css ?? "";
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

/**
 * ## Define
 *
 * Decorator to automatically define a component.
 *
 * ### Behaviour
 * - Creates a new HTML Element based of the classname
 * - Element is prefixed with "comp-" - e.g `Button` -> `comp-button`
 * - TypeScript only, JavaScript users need to call `define()`
 *
 * * ### Type Parameters
 * - `T` – The expected element type (defaults to `HTMLElement`).
 *
 *  * ### Parameters
 * - `name` (`string`):
 *   A valid HTML Element name, needs to contain a - e.g my-button
 *
 * ### Example
 * ```ts
 * @Define
 * class Button extends Component {
 *     // Your super cool component
 * }
 * ```
 */
export function Define<T extends typeof Component>(ctor: T) {
    ctor.define();
    return ctor;
}
