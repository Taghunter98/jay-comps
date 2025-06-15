/**
 * Copyright (c) 2025 Josh Bassett
 * 
 * Filename:    design.ts
 * Author:      Josh Bassett
 * Date:        09/06/2025
 * Version:     1.3
 * 
 * Licence:     Apache 2.0
 */

import { Effects } from "./effects.js";

export type CSSValue = string | number | boolean | null | undefined;
export type CSSConfig = Record<string, CSSValue>;

/**
 * # Design
 * 
 * Class that compiles JavaScript -> CSS.
 * 
 * ### Overview:
 * This class serves as the compiler for converting JavaScript into valid CSS.
 * 
 * This is achieved through the `compileCSS()` method and the `create()` API for the
 * developer to write their CSS, but with the luxury of JavaScript Record notation.
 * 
 * ### Methods:
 * - **create**(): Public API for the developer to write CSS.
 * - **compileCSS**(): Compiler for CSS.
 * - **parseVariables**(): Converts camel case variables to kebab case.
 * - **check**(): Returns px value.
 * - **compileCSS**(): Compiler for CSS.
 * - **compileCSS**(): Compiler for CSS.
 * 
 * ### Example:
 * ```js
 * const instance = new [ClassName]();
 * instance.[methodName]([argument]);
 * ```
 */

export class Design {

    /**
     * ## defaultComp
     * 
     * Injects basic Comp CSS.
     * 
     * ### Behaviour:
     * Method injects values:
     * - `root` values to ensure shadow DOM elements inherit correctly.
     * - Typograpgy styles modelled on Material design for accessibility.
     * 
     * ### Returns:
     * `string` - Default CSS to be injected.
     */
    defaultComp() {

        return /* css */ `
        * {
            margin: 0;
            padding: 0;
        }
        :host {
            display: block;
            width: 100%;
            box-sizing: border-box;
        }
        h1 {
            font-size: 57px;
            font-weight: 500;
            line-height: 64pt;
        }
        h2 {
            font-size: 45px;
            font-weight: 500;
            line-height: 52pt;
        }
        h3 {
            font-size: 36px;
            font-weight: 500;
            line-height: 44pt;
        }
        h4 {
            font-size: 32px;
            font-weight: 400;
            line-height: 40pt;
        }
        h5 {
            font-size: 28px;
            font-weight: 400;
            line-height: 36pt;
        }
        h6 {
            font-size: 24px;
            font-weight: 400;
            line-height: 32pt;
        }
        p {
            font-size: 16px;
            font-weight: 400;
            line-height: 24pt;
        }
        label {
            font-size: 12px;
            font-weight: 500;
            line-height: 16pt;
        }
        `;
    
    }

    /**
     * Generates a CSS string from a configuration object.
     *
     * This method transforms a JavaScript object (with keys in camelCase)
     * into a CSS string, converting keys to kebab-case and ensuring the proper
     * conversion of British to American English for property names. Global CSS
     * variables may be referenced as <code>var(--example)</code>, and all colour
     * properties must be defined as CSS variables.
     *
     * **Example Usage:**
     *
     * ```js
     * 
     * const cssConfig = {
     *   valueID: "container",
     *   psuedoClass: "hover",
     *   display: "flex",
     *   flexDirection: "column",
     *   boxSizing: "border-box",
     *   width: "100%",
     *   maxWidth: 500,
     *   padding: 20,
     *   alignItems: "center",
     *   border: true,
     *   borderRadius: 10,
     *   background: "white",
     *   colour: "black100",
     *   fontSize: 16,
     *   fontWeight: 400,
     *   opacity: 1
     * };
     * const cssCode = design.create(cssConfig);
     * console.log(cssCode);
     * ```
     *
     * @param {CSSConfig} css - A configuration object representing CSS properties and values.
     * @returns {string} A compiled CSS string ready for injection.
     */
    public create(css: CSSConfig): string {

        const cssSelector = css.psuedoClass
            ? `${css.class}:${css.psuedoClass}`
            : css.class;

        return /* css */ `
        .${cssSelector} {
            ${this.compileCSS(css)}
        }
        `;
    
    }

    /**
     * Compiles a CSS configuration object into a valid CSS string.
     *
     * This method iterates over a CSS configuration object, performing necessary
     * transformations such as:
     * 
     * - Converting camelCase keys to kebab-case.
     * - Converting British English property names to American English.
     * - Appending appropriate units (e.g. px, pt) to numerical values.
     *
     * **Example Usage:**
     *
     * ```js
     * 
     * const cssConfig = {
     *   class: "container",
     *   psuedoClass: "hover",
     *   display: "flex",
     *   flexDirection: "column",
     *   boxSizing: "border-box",
     *   width: "100%",
     *   maxWidth: 500,
     *   padding: 20,
     *   alignItems: "center",
     *   border: true,
     *   borderRadius: 10,
     *   background: "white",
     *   colour: "black100",
     *   fontSize: 16,
     *   fontWeight: 400,
     *   opacity: 1
     * };
     * const compiledCSS = design.compileCSS(cssConfig);
     * console.log(compiledCSS);
     * ```
     *
     * @param {CSSConfig} css - An object containing CSS properties and values.
     * @returns {string} The compiled CSS code.
     */
    private compileCSS(css: CSSConfig): string {

        let cssString = "";

        for (let key in css) {

            let cssValue: CSSValue = css[key];

            cssValue = this.check(key, cssValue);
            key      = this.parseVariables(key);
            
            cssString += `${this.americanise(key)}: ${this.americanise(cssValue)};\n`;
        
        }

        return cssString;
    
    }

    /**
     * Converts a camelCase string to kebab-case.
     *
     * This method transforms a JavaScript-style camelCase variable
     * into a CSS-friendly kebab-case string.
     *
     * @param {string} variableName - The camelCase string to convert.
     * @returns {string} The converted kebab-case string.
     *
     * @example
     * const design = new Design();
     * const cssVar = design.parseVariables('fontSizeLarge');
     * // Returns 'font-size-large'
     */
    /**
     * ## parseVariables
     * 
     * Coverts a camel case variable to kebab case.
     * 
     * ### Behaviour:
     * Method uses a regex to split the variable up to capital letters and add a -.
     * 
     * ### Parameters:
     * - **variable** (`string`): Camel case variable.
     * 
     * ### Returns:
     * `string` - Kebab case variable.
     * 
     * ### Example:
     * ```js
     * 
     * const c = "fontSize";
     * const k = parseVariables(c);
     * console.log(c + " -> " + k);
     * ```
     * ```plaintext
     * 
     * fontSize -> font-size
     * ```
     */
    private parseVariables(variable: string) {

        return variable.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    
    }

    /**
     * ## americanise
     * 
     * Converts British -> American CSS property names.
     * 
     * ### Behaviour:
     * Method matches CSS property names that are spelt using American English.
     * 
     * This allows for CSS to be written in British English.
     * 
     * ### Parameters:
     * - **variable** (`string`): Variable to be converted.
     * 
     * ### Returns:
     * `string` - Valid CSS property name.
     * 
     * ### Example:
     * ```js
     * 
     * const brit = "colour";
     * const amer = americanise(brit);
     * console.log(brit + " -> " + amer);
     * ```
     * ```plaintext
     * 
     * colour -> color
     * ```
     */
    private americanise(variable: CSSValue): string {

        const convert: Record<string, string> = {
            "colour": "color",
            "centre": "center",
            "grey": "gray",
            "behaviour": "behavior"
        };

        const textValue = String(variable);
        return convert[textValue] || textValue;
    
    }

    /**
     * ## check
     * 
     * Runs checks to compile variabe types.
     * 
     * ### Behaviour:
     * Method takes the key and value of the CSSConfig and checks for conditions to compile
     * the correct variable types.
     * 
     * ### Parameters:
     * - **key** (`string`): The key e.g. (class, fontSize, background).
     * - **value** (`CSSValue`): The value e.g. ("classname", 100pt, var(--black100)).
     * 
     * ### Returns:
     * `string` | `CSSValue` - Valid CSS value.
     * 
     * ### Example:
     * ```js
     * 
     * const key = "fontSize";
     * const val = 200;
     * const css = check(key, val);
     * console.log(css);
     * ```
     * ```plaintext
     * 
     * 200pt
     * ```
     */
    private check(key: String, value: CSSValue): string | CSSValue {

        if (key == "fontSize" && typeof value == 'number') return `${value}px`;
        else if (key == "opacity" || key == "fontWeight" && typeof value == 'number') return value;
        else if (typeof value == 'number') return`${value}px`;
        else if (key === "background" || key === "colour" || key === "border") return `var(--${value})`;
        else return value;
    
    }

}
