/**
 * Copyright (c) 2025 Josh Bassett
 * 
 * Filename:    design.ts
 * Author:      Josh Bassett
 * Date:        09/06/2025
 * Version:     1.4
 * 
 * Licence:     Apache 2.0
 */

/**
 * Custom types for CSSValues and CSSConfig objects
 */
export type CSSValue = string | number | boolean | null | Array<number|string> | any;
export type CSSConfig = Record<string, CSSValue>;

export class Design {

    // Variable to hold CSS to override default :host values.
    private hostOverride_?: string;

    /**
     * Getter and Settter methods
     */
    public set hostOverride(hostCSS: string | undefined) { this.hostOverride_ = hostCSS; }
    public get hostOverride() { return this.hostOverride_;}

    /**
     * API provides default values to be injected into every Comp when rendered.
     */
    public defaultComp() {
        return /* css */ `${this.resetStyles()}${this.hostOverride_ ? this.hostOverride_ : this.defaultHost()}${this.defaultFontStyle()}`;
    }

    /**
     * Helper method provides standard reset values.
     */
    private resetStyles(): string { 
        return `
* {margin: 0; padding: 0;}`;
    }

    /**
     * Helper method provides default :host config.
     */
    private defaultHost(): string {
        return `
:host {display: block; width: 100%; box-sizing: border-box;}`;
    }

    /**
     * Helper method provides default font styles modelled on Material Design 3 typography.
     */
    private defaultFontStyle(): string {
        return /* css */`
h1 {font-size: 57px; font-weight: 500; line-height: 64pt;}
h2 {font-size: 45px; font-weight: 500; line-height: 52pt;}
h3 {font-size: 36px; font-weight: 500; line-height: 44pt;}
h4 {font-size: 32px; font-weight: 400; line-height: 40pt;}
h5 {font-size: 28px; font-weight: 400; line-height: 36pt;}
h6 {font-size: 24px; font-weight: 400; line-height: 32pt;}
p {font-size: 16px; font-weight: 400; line-height: 24pt;}
label {font-size: 12px; font-weight: 500; line-height: 16pt;}`;
    }

    /**
     * API abstracted through the Comp class, provides a method to build a CSS string.
     * 
     * Method compiles base CSS and then appends media queries if applicable.
     */
    public create(css: CSSConfig): string {
        const selector = css.pseudoClass ? 
            `${css.class}:${css.pseudoClass}`: 
            css.class!;

        let cssText = `
${selector ? `.${selector}` : ':host'} {${this.compileCSS(css)}}\n`;

        if (css.media && typeof css.media === "object" && !Array.isArray(css.media)) {
            cssText += this.compileMedia(css.media, css.class, css.pseudoClass);
        }

        if (css.keyframes && typeof css.keyframes === "object" && !Array.isArray(css.keyframes)) {
            cssText += this.compileKeyframes(css.keyframes);
        }

        return cssText;
    }

    /**
     * Method compiles a CSS string from a provided CSS Config object.
     * 
     * Works by appending a CSS string and running checks against both the key and value.
     */
    private compileCSS(css: CSSConfig): string {
        let cssString = "";

        for (let key in css) {
            if (
                key == "class" 
                || key == "pseudoClass" 
                || key == "media" 
                || key == "keyframes"
            ) continue;
            let value: CSSValue = css[key];
            const {propKey, propValue} = this.parseProperties(key, value)

            cssString += `\n  ${this.americanise(propKey)}: ${this.americanise(propValue)};`;
        }

        return cssString;
    }

    private compileKeyframes(config: CSSConfig): string {
        const { name, ...steps } = config;
        if (!name) throw new Error("Keyframes config must include a name");

        // Build each percentage/from/to block
        const blocks = Object.entries(steps).map(([step, declarations]) => {
            const stepName = this.normaliseKeyframe(step);

            // Turn each declaration into "prop: value;"
            const props = Object.entries(declarations).map(([rawKey, rawVal]) => {
            const { propKey, propValue } = this.parseProperties(rawKey, rawVal);
            return `    ${propKey}: ${propValue};`;
            }).join("\n");

            return `  ${stepName} {\n${props}\n  }`;
        });

        return `@keyframes ${name} {\n${blocks.join("\n")}\n}`;
    }

    // Helper to normalise keyframe values
    private normaliseKeyframe(step: string): string {
        const lower = step.toLowerCase();
        if (lower === "from" || lower === "to") return lower;
        if (/^\d+%$/.test(step)) return step;
        throw new Error('Invalid keyframe step. Use "from", "to", or "NN%".');
    }
  
    
    /**
     * Method compiles a CSS media query string from a CSS Config object.
     * 
     * Works by finding the breakpoint with the 'Bp' operator and uses the CSS key to create
     * a media query heading.
     * 
     * The 'Bp' value is removed to allow for the parseProperties function to compile the value.
     * 
     * The media query is then assembled and returned.
     */
    private compileMedia(media: CSSConfig, parentClass?: CSSValue, parentPseudo?: CSSValue
    ): string {
        const bp = Object.entries(media).find(([k]) => k.toLowerCase().endsWith("bp"));
        if (!bp) throw new Error("Media config must include a *Bp key");
        
        const [breakKey, breakVal] = bp as [string, CSSValue];

        const {propKey: headingProp, propValue: headingVal} = this.parseBreakpoint(breakKey, breakVal);

        const inner = { ...media };
        for (const k of Object.keys(media)) if (k.toLowerCase().endsWith("bp")) {
            delete (inner as any)[k];
        }

        const cls = media.class || parentClass;
        const pseudo = media.pseudoClass || parentPseudo;
        const selector = `.${cls}${pseudo ? `:${pseudo}` : ""}`;

        const innerCSS = this.compileCSS(inner as CSSConfig);

        return `
@media (${headingProp}: ${headingVal}) {
  ${selector} {
    ${innerCSS}
  }
}`;
    }

    /**
     * Helper method removes the 'Bp' operator and compiles and returns the CSS properties.
     */
    private parseBreakpoint(key: string, val: CSSValue): {propKey: string, propValue: string} {
        const coreKey = key.slice(0, -"Bp".length);
        return this.parseProperties(coreKey, val);
    }

    /**
     * Helper method converts camel case variables to kebab case.
     */
    public camelToKebab(key: string) {
        return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Helper method translates UK -> US CSS property names.
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
     * Method parses CSSValue objects and returns valid CSS.
     * 
     * The method checks for operators that suffix a key, these are then used to validate the CSS type.
     * 
     * Method handles all dataypes and arrays, with a recursive call to find all child CSS types.
     * 
     * The returned CSS is a hash map of valid css properry key and value.
     */
    private parseProperties(key: string, value: CSSValue): {propKey: string, propValue: string} {
        let propKey, propValue;
        let suffix = "", unit = "";

        const OPERATORS: Record<string, string> = {
        Percent: "%", Var: "var", Url: "url", Calc: "calc",
        Em: "em", Rem: "rem", Vw: "vw", Vh: "vh", Vmin: "vmin",
        Vmax: "vmax", Ch: "ch", Ex: "ex", Pt: "pt", Pc: "pc", 
        In: "in", Cm: "cm", Mm: "mm", Fr: "fr", S: "s", Ms: "ms",
        Deg: "deg", Rad: "rad", Grad: "grad", Turn: "turn",
        Dpi: "dpi", Dpcm: "dpcm", Dppx: "dppx", Q: "q", 
        Hz: "Hz", KHz: "kHz"
        };

        const UNITLESS_PROPERTIES = [
            "opacity", "z-index", "line-height", "font-weight",
            "flex", "order", "flex-grow", "flex-shrink", "grid-row",
            "grid-column", "column-count", "widows", "orphans", "tab-size"
        ];

        for (const k of Object.keys(OPERATORS)) if (key.endsWith(k)) {
            suffix = k; 
            unit = OPERATORS[k]; 
            key = key.slice(0, -k.length);
            break;
        }

        propKey = this.camelToKebab(key);
        propValue = propValue;

        if (Array.isArray(value)) 
            propValue = (value as CSSValue[])
                .map(v => this.parseProperties(propKey + suffix, v).propValue)
                .join(" ");
        
        else if (typeof value === "number" && value === 0) propValue = "0";

        else if (typeof value === "string") {
            if (suffix === "Var")  propValue = `var(--${value})`;
            else if (suffix === "Url")  propValue = `url(${value})`;
            else if (suffix === "Calc") propValue = `calc(${value})`;
            else propValue = value;
        }

        else {
            if (unit) propValue = `${value}${unit}`;
            else if (UNITLESS_PROPERTIES.includes(propKey)) propValue = String(value);
            else propValue = `${value}px`;
        }

        return {propKey, propValue}
    }
}