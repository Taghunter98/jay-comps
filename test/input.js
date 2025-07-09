import { Comp } from "../dist/comp.js";

class InputComp extends Comp {

    label_ = "Label" || this.label;
    type_ = "text" || this.type;
    prompt_ = "Enter text" || this.prompt;
    error_ = false || this.error;

    set label(value) {
        this.label_ = value;
        this.update();
    }
    set type(value) {
        this.type_ = value;
        this.update();
    }
    set prompt(value) {
        this.prompt_ = value;
        this.update();
    }
    set error(value) {
        this.error_ = value;
        this.setError(value);
    }

    get label() {return this.label_};
    get type() {return this.type_};
    get prompt() {return this.prompt_};
    get error() {return this.error_};

    createHTML() {
        return /* html */ `
        <div class="inputContainer">
            <label style="color: var(--black80); font-size: 14px">${this.label}</label>
            <input class="inputValue" type="${this.type}" placeholder="${this.prompt}">
        </div>
        `;
    }

    createCSS() {

        const inputContainer = this.css({
            class: "inputContainer",
            display: "flex",
            flexDirection: "column",
            widthPercent: 100,
            maxWidth: "none",
            padding: 0,
            alignItems: "start",
            gap: 10,
            background: "--white"
        });

        const input = this.css({
            class: "inputValue",
            display: "block",
            fontSize: 16,
            width: "100%",
            padding: [8, 12],
            border: "border",
            borderRadius: 8,
            boxSizing: "border-box"
        });

        const inputHover = this.css({
            class: "inputValue",
            pseudoClass: "hover",
            outline: "solid 2px var(--black60)"
        });

        const inputActive = this.css({
            class: "inputValue",
            pseudoClass: "focus",
            outline: "solid 2px var(--black100)"
        });

        const underlineErr = this.css({
            class: "inputValue",
            borderBottom: "2px solid var(--red100)"
        });

        return /* css */ `
        ${inputContainer}
        ${input}
        ${inputHover}
        ${inputActive}
        ${this.error ? underlineErr : ''}
        `;
    }
}

customElements.define("comp-input", InputComp);