/**
 * TEST Comp 
 */

import { Comp } from "../dist/comp.js";

export class ButtonComp extends Comp {

    constructor() {

        super();
        this.host(`:host {display: inline-block; width: auto;}`);
    
    }

    text_ = "This is a button" || this.text_;
    
    set text(value) {

        this.text_ = value;
        this.update();
    
    }

    get text() {

        return this.text_;
    
    }

    // First define HTML markup
    createHTML() {

        return `<button id="btn" class="btn">${this.text}</button>`;
    
    }

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

    // Finally add JS logic
    hook() {

        const btn = this.shadowRoot.getElementById("btn");
        btn.addEventListener("click", () => {

            console.log("You clicked me!");
        
        });
    
    }

}

customElements.define("comp-button", ButtonComp);