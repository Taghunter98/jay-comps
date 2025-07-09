import { Comp } from "../dist/comp.js";

class ButtonGroupComp extends Comp {

    // 1) Placeholders for your two buttons
    createHTML() {

        return /* html */`
      <div class="group">
        <comp-button           id="btn1"></comp-button>
        <comp-button-danger    id="btn2"></comp-button-danger>
        
      </div>

      <div>
        <p id="res"></p>
        <comp-input id="email"></comp-input>
        <comp-input id="password"></comp-input>
      </div>
    `;
    
    }

    // 2) Just give the group some layout
    createCSS() {

        return this.css({
            class:        "group",
            display:      "flex",
            gap:          12,
            alignItems:   "center"
        });
    
    }

    async getFact(res) {
        const data = await this.request("https://catfact.ninja/fact", "GET");
        res.innerHTML = data.fact;
    }

    async fakeSubmit() {
        const result = await this.submitForm("https://httpbin.org/post", {
            name: "Jay",
            email: "jay@example.com",
            flag: true
        });
        console.log(result);


        console.log("server said:", result);
    }


    // 3) In hook(), grab both by ID and set their .text
    hook() {

        const btn1 = this.shadowRoot.getElementById("btn1");
        const btn2 = this.shadowRoot.getElementById("btn2");
        const email = this.shadowRoot.getElementById("email");
        const pass = this.shadowRoot.getElementById("password");

        // These assignments hit each button’s setter
        // which in turn calls update() on that component only
        btn1.text = "First Action";
        btn2.text = "Delete Forever";

        email.label = "Email";
        email.prompt = "Enter email";
        
        pass.label = "Password";
        pass.prompt = "Enter password";
        pass.type = "password";

        btn1.addEventListener("click", () => {
            let res = this.shadowRoot.getElementById("res");
            this.getFact(res);
        });
    
        btn2.addEventListener("click", () => {
            this.fakeSubmit();
        });
    
    }

}

customElements.define("comp-button-group", ButtonGroupComp);
