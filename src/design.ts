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
export type CSSValue = string | number | boolean | null | Array<number> | undefined;
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
            `\n${css.class}:${css.pseudoClass}`: 
            css.class!;

        let cssText = `
${selector ? `.${selector}` : ':host'} {${this.compileCSS(css)}}\n`;

        if (css.media && typeof css.media === "object" && !Array.isArray(css.media)) {
            cssText += this.compileMedia(css.media, css.class, css.pseudoClass);
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
            if (key === "class" || key == "pseudoClass" || key == "media") continue;
            let cssValue: CSSValue = css[key];
            cssValue = this.check(key, cssValue);
            this.isPercent(key) ? key = this.convertPercent(key) : key;
            key = this.camelToKebab(key);

            cssString += `
\t${this.americanise(key)}: ${this.americanise(cssValue)};`;
        }

        return cssString;
    }
    
    private compileMedia(media: CSSConfig, parentClass?: CSSValue, parentPseudo?: CSSValue): string {
        let cssString = "";

        const rawSize = media.breakpoint;
        const breakpoint = typeof rawSize === "number" ? rawSize : parseInt(String(rawSize), 10);
        if (isNaN(breakpoint)) {
            console.warn("Media block missing a numeric size:", media);
            return "";
        }

        delete media.breakpoint;
        const cls = media.class || parentClass;
        const pseudo = media.pseudoClass || parentPseudo;
        const selector = cls ? `.${cls}${pseudo ? `:${pseudo}` : ""}` : ":host";

        cssString += `
@media (max-width: ${breakpoint}px) { 
\t${selector} {${this.compileCSS(media)}}}\n`;

        return cssString;
    }

    /**
     * Helper method checks CSSConfig values and returns valid CSS properies.
     */
    private check(key: string, value: CSSValue): string | CSSValue {
        if (typeof value === 'number') return this.checkInteger(key, value);
        else if (Array.isArray(value)) return this.convertArrays(key, value);
        else if (key === "background" || key === "colour" || key === "border") return `var(--${value})`;
        else return value;
    }

    /**
     * Helper method checks integers and returns valid CSS properties.
     */
    private checkInteger(key: string, value: number): string | CSSValue {
        if (value === 0) return 0;
        if (this.isPercent(key)) return `${value}%`;
        
        switch (key) {
        case "opacity": 
        case "fontWeight": return value + "pt"; 
        case "top": 
        case "bottom": 
        case "left": 
        case "right":
        case "lineHeight": 
        case "zIndex":
        case "flexGrow":
        case "flexShrink":
        case "order":
        case "aspectRatio":
            return value;
        }
        
        return `${value}px`;
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
     * Helper method converts arrays into CSS properties.
     */
    private convertArrays(key: string, values: Array<CSSValue>): string {
        let cssStr: string = '';

        for (let val in values ) typeof values[val] == "number" ? 
            cssStr += (this.checkInteger(key, values[val]) + " ") :
            cssStr += values[val] + " ";

        return cssStr;
    }
    
    /**
     * Helper method checks if key is a percentage.
     */
    private isPercent(key: string): boolean {
        return key.match(/Percent/) ? true : false;
    }
    
    /**
     * Helper method converts a key to valid CSS property.
     */
    private convertPercent(key: string): string {
        return key.replace(/Percent/g, '').toLowerCase();
    }
}