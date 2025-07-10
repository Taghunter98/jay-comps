import { Comp } from "../dist/comp.js";

class ButtonGroup extends Comp {

    // 1) Placeholders for your two buttons
    createHTML() {

        return /* html */`
      <div class="group">
        <comp-button           id="btn1"></comp-button>
        <comp-button-alt    id="btn2"></comp-button-alt>
        
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

    async testRegister(res) {
        const fd = new FormData();

        // Required fields
        fd.append("email", "jay@example.com");
        fd.append("password", "securePass123");
        fd.append("name", "Jay");
        fd.append("surname", "Bassett");
        fd.append("age", "28");
        fd.append("occupation", "Frontend Developer");
        fd.append("bio", "Loves clean UI and clever CSS tricks.");

        // Simulate a file upload (replace with actual File object in real use)
        const blob = new Blob(["fake image content"], { type: "image/png" });
        const file = new File([blob], "profile.png", { type: "image/png" });
        fd.append("file", file);

        // Submit using your helper
        const result = await this.submitForm(
            "https://whondo.com/register",
            fd
        );

        res.innerHTML = "Account created. Response: " + result.success;
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
            this.testRegister();
        });
    }

    static { Comp.register(this); }
}

