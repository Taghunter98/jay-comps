import { Comp } from "../dist/comp.js";

export class Card extends Comp {

    heading_;
    text_;
    btnText_;

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
            <div class="txt">
                 <h5 style="font-weight: bold">${this.heading}</h5>
                <p>${this.text}</p>
            </div>
            <comp-button id="btn"></comp-button>
        </div>
        `;
    }

    createCSS() {
        const container = this.css({
            class: "container",
            display: "flex",
            alignItems: "centre",
            flexDirection: "row",
            gap: 20,
            padding: 20,
            boxShadow: ["var(--black20)", 0, 7, 29, 0],
            border: "border",
            borderRadius: 14,
            media: {
                size: 600,
                alignItems: "start",
                widthPercent: 100,
                flexDirection: "column"
            }
        });

        const txt = this.css({
            class: "txt",
            display: "flex",
            widthPercent: 100,
            gap: 20,
            alignItems: "centre",
            media: {
                size: 600,
                alignItems: "start",
                flexDirection: "column"
            }
        });

        return `${container} ${txt}`;
    }

    hook() {
        this.shadowRoot.getElementById("btn").text = this.btnText;
    }

    static { Comp.register(this); }
}