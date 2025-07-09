import { ButtonComp } from "./button.js";

class DangerButtonComp extends ButtonComp {
    
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

    // Different hook overidden from super
    hook() {
        
        const btn = this.shadowRoot.getElementById("btn");
        btn.addEventListener("click", () => {

            console.log("Secondry click");
        
        });
    
    }

}

customElements.define("comp-button-danger", DangerButtonComp);