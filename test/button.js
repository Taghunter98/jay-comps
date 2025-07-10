/**
 * TEST Comp 
 */

import { Comp } from "../dist/comp.js";

export class Button extends Comp {

    constructor() {
        super();
        this.host({widthPercent: 100});
    }

    text_ = "This is a button" || this.text_;
    
    set text(value) {
        this.text_ = value;
        this.update();
    }

    get text() { return this.text_;}

    // First define HTML markup
    createHTML() { return `<button id="btn" class="btn">${this.text}</button>`;}

    // Then style the Comp
    createCSS() {
        return this.css({
            class:        "btn",
            padding:      12,
            borderRadius: 4,
            padding: [8, 24],
            background:   "black100",
            colour:       "white",
            border: "none"
        });
    }

    hook() {}

    static { Comp.register(this); }
}

