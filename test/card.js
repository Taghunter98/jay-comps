import { Comp } from "../dist/comp.js";

export class Card extends Comp {
    heading_;
    text_;
    btnText;

    set heading(value) {
        this.heading_ = value;
        this.update();
    }

    set text(value) {
        this.text_ = value;
        this.update();
    }

    set btnText(value) {
        this.btnText_ = value;
        this.update();
    }

    get heading() { return this.heading_; }
    get text() { return this.text_; }
    get btnText() { return this.btnText_; }

    createHTML() {
        return /* html */ `
        <div class="container">
            <h2>${this.heading}</h2>
            <p>${this.text}</p>
            <comp-button id="btn"></comp-button>
        </div>
        `;
    }

    createCSS() {
        const container = this.css({
            class: "container",
            display: "flex",
            width: 500,
            flexDirection: "column",
            gap: 20,
            padding: [20, 10],
            boxShadow: "var(--black20) 0px 7px 29px 0px",
            border: "border",
            borderRadius: 14,
            media: {
                size: 600,
                widthPercent: 100
            }
        });

        return `${container}`;
    }

    hook() {
        this.shadowRoot.getElementById("btn").text = this.btnText;
    }

    static { Comp.register(this); }
}