// If it's neither disabled nor read only
const usable = ":not([disabled]):not([readonly])";
const css = `
:host {
    /* Make room for the border by applying one that doesn't do anything */
    border: 2px solid #0000;
    display: inline-block;
    height: 100%;
}
label {
    display: inline-block;
    padding: 5px 7px 0px;
    height: auto;
}
input {
    display: none;
}
img {
    display: inline;
    height: 1em;
}
:host(${usable}) * {
    cursor: pointer;
}
:host(${usable}:hover) {
    border: 2px solid #fff4;
    background: #fff6;
}
:host(:not([indeterminate])[checked]) {
    border: 2px solid #fff6;
    background: #fff2;
}
:host([indeterminate]) {
    border: 2px dashed #fff6;
}
:host(:not(${usable})) { {
    filter: brightness(0.5) saturate(0.5);
}
`;

export default class extends HTMLElement {
    constructor() {
        super();
        // === Create shadow root ===
        const shadow = this.attachShadow({mode:"open"});
        const style = document.createElement("style");
        style.type = "text/css";
        style.append(css);
        const label = document.createElement("label");
        this.img = document.createElement("img");
        this.checkbox = document.createElement("input");
        this.checkbox.type = "checkbox";
        this.checkbox.oninput = this.updateAttributes.bind(this);
        label.append(this.img, this.checkbox);
        shadow.append(style, label);
        this.connectAttribute("src", this.img);
        this.connectAttribute("disabled", this.checkbox);
        this.connectAttribute("readonly", this.checkbox);
        this.connectAttribute("name", this.checkbox);
        this.connectAttribute("value", this.checkbox);
        this.connectAttribute("checked", this.checkbox);
        this.connectAttribute("required", this.checkbox);
        this.connectEvent("input", this.checkbox);
        this.connectEvent("change", this.checkbox);
        this.connectEvent("click", this.checkbox);
    }

    get indeterminate() { return this.checkbox.indeterminate; }
    set indeterminate(value) { 
        this.checkbox.indeterminate = value; 
        this.updateAttributes();
    }
    get checked() { return this.checkbox.checked; }
    set checked(value) { 
        this.checkbox.checked = value;
        this.updateAttributes();
    }

    updateAttributes() {
        if (this.checkbox.checked) this.setAttribute("checked", "checked");
        else this.removeAttribute("checked");
        if (this.checkbox.indeterminate) this.setAttribute("indeterminate", "indeterminate");
        else this.removeAttribute("indeterminate");
    }

    connectEvent(name, target) {
        var bridging = false;
        const local_handler = ev => {
            // If it hit the target already let it bubble out.
            if (ev.composedPath().includes(target)) return;
            // If natural, relay it to the target (and set the relay flag)
            if (!bridging) {
                bridging = true;
                target.dispatchEvent(new ev.constructor(ev.type, ev));
            }
            // If it's come via this relay, reset the flag
            else bridging = false;
        }
        this.addEventListener(name, local_handler);
        this.shadowRoot.addEventListener(name, local_handler);
        target.addEventListener(name, ev => {
            // If it's a natural event, relay
            if (!bridging) {
                bridging = true;
                this.dispatchEvent(new ev.constructor(ev.type, ev));
            }
            else {
                bridging = false;
                // If it was relayed, it shouldn't bubble.
                ev.stopPropagation();
            }
        });
    }

    connectAttribute(name, target) {
        var bridging = false;
        // Sync up
        if (this.hasAttribute(name)) target.setAttribute(name, this.getAttribute(name));
        // Wire to
        const self_watcher = new MutationObserver(mutation => {
            if (!bridging) {
                if (this.hasAttribute(name)) {
                    const value = this.getAttribute(name);
                    target.setAttribute(name, value);
                }
                else target.removeAttribute(name);
            }
            bridging = !bridging;
        });
        self_watcher.observe(this, { attributeFilter: [name] });
        // Wire from
        const target_watcher = new MutationObserver(() => {
            if (!bridging) {
                if (target.hasAttribute(name)) {
                    const value = target.getAttribute(name);
                    this.setAttribute(name, value);
                }
                else this.removeAttribute(name);
            }
            bridging = !bridging;
        });
        target_watcher.observe(target, { attributeFilter: [name] });
    }
}