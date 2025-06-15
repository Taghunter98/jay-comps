/**
 * Copyright (c) 2025 Josh Bassett
 * 
 * Filename:    comp.ts
 * Author:      Josh Bassett
 * Date:        08/06/2025
 * Version:     1.2
 * 
 * Description: Base Comp class that handles all Comp inner logic.
 */

import { API } from './api.js';
import { Design } from "./design.js";
import { Effects } from "./effects.js";

/**
 * Abstract base class for components.
 * 
 * Every component (Comp) should extend this class and override the following methods:
 * - `createHTML()`: Return the HTML markup for the component.
 * - `createCSS()`: Return the CSS rules that will be injected into the Shadow DOM.
 * - `hook()`: Define the component's inner JavaScript logic (event listeners, etc.).
 */
export abstract class Comp extends HTMLElement {

    protected name_: string;
    protected html_: string;
    protected css_: string;
    public design: Design;
    public api: API;
    public effect: Effects;

    constructor() {

        super();

        this.name_  = "Component Name";
        this.html_  = "";
        this.css_   = "";
        this.design = new Design();
        this.api    = new API();
        this.effect = new Effects();

        this.attachShadow({ mode: "open" });
    
    }

    // Getter and setter for component name
    public set name(newCompName: string) {

        this.name_ = newCompName;
    
    }
    public get name(): string {

        return this.name_;
    
    }

    // Getter and setter for component HTML
    public set html(newCompHTML: string) {

        this.html_ = newCompHTML;
    
    }
    public get html(): string {

        return this.html_;
    
    }

    // Getter and setter for component CSS
    public set css(newCompCSS: string) {

        this.css_ = newCompCSS;
    
    }
    public get css(): string {

        return this.css_;
    
    }

    /**
   * Creates an HTML template that wraps the component markup together with its CSS.
   *
   * The template includes the component's HTML and a <style> block that injects default styles
   * (via this.design.defaultComp()) along with the component-specific CSS.
   *
   * @param html - The component's HTML markup.
   * @param css - The component-specific CSS string.
   * @returns The complete HTML template as a string.
   */
    createTemplate(html: string, css: string): string {

        return /* html */ `
      ${html}
      <style>
        ${this.design.defaultComp()}
        ${css}
      </style>
    `;
    
    }

    /**
     * Debug method for logging the component's base values.
     */
    debug(): void {

        console.log("DEBUG COMP: " + this.name);
        console.log(this.name);
        console.log(this.html);
        console.log(this.css);
    
    }

    /**
     * Renders the component by setting the Shadow DOM's innerHTML to the generated template.
     * 
     * If a hook (an internal build method) is defined, it will be invoked afterward.
     */
    render(): void {

        if (!this.shadowRoot) {

            throw new Error("Shadow root is not available.");
        
        }
        this.shadowRoot.innerHTML = this.createTemplate(this.html_, this.css_);
        if (typeof this.hook === "function") {

            this.hook();
        
        }
    
    }

    /**
     * Updates the component's HTML and CSS, and re-renders it.
     *
     * @param newHTML - The new HTML for the component.
     * @param newCSS - The new CSS for the component.
     */
    update(newHTML: string, newCSS: string): void {

        this.html_ = newHTML;
        this.css_  = newCSS;
        this.render();
    
    }

  /**
   * Abstract method to generate the component's HTML.
   * 
   * This method must be overridden in derived components to provide the HTML structure.
   *
   * @returns The HTML markup as a string.
   *
   * @example
   * createHTML() {
   *    return `
   *      <div class="comp-object">
   *        <h1>Hello, World!</h1>
   *      </div>
   *    `;
   * }
   */
  abstract createHTML(): string;

  /**
   * Abstract method to generate the component's CSS.
   * 
   * This method must be overridden in derived components to provide the component-specific CSS.
   *
   * @returns The CSS rules as a string.
   *
   * @example
   * createCSS() {
   *    return this.design.styleCompCSS({
   *         valueID: "container",
   *         psuedoClass: "hover",
   *         display: "flex",
   *         // ...additional style properties
   *    });
   * }
   */
  abstract createCSS(): string;

  /**
   * Abstract build hook for the component's inner JavaScript.
   * 
   * Derived classes should override this method to implement internal logic,
   * such as adding event listeners or altering component state after rendering.
   *
   * @example
   * hook() {
   *   const button = this.shadowRoot.getElementById("submit");
   *   button.addEventListener("click", () => {
   *      // Custom logic here...
   *   });
   * }
   */
  abstract hook(): void;

}
