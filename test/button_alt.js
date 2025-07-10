import { Button } from "./button.js";

class ButtonAlt extends Button {
    
    createCSS() {

        // First get the base comp css
        const base = super.createCSS();

        // Create new CSS
        const css = this.css({
            class: "btn",
            background: "red100",
            colour: "white"
        });

        return `${base} ${css}`;
    
    }

    static { super.register(this); }
}