import {connectAttribute, connectDom} from "./connect_dom.mjs"

// If it's neither disabled nor read only
const usable = ":not([disabled]):not([readonly])";
const css = `
:host {
    /* Make room for the border by applying one that doesn't do anything */
    border: 2px solid #0000;
    display: inline-block;
    height: 100%;
}
span {
    display: inline-block;
    padding: 4px 4px 0px;
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
        this.stylesheet = document.createElement("style");
        this.stylesheet.type = "text/css";
        this.stylesheet.append(css);
        this.main = document.createElement("span");
        this.img = document.createElement("img");
        this.checkbox = document.createElement("input");
        this.checkbox.type = "checkbox";
        this.checkbox.oninput = this.updateAttributes.bind(this);
        this.main.append(this.img, this.checkbox);
        shadow.append(this.stylesheet, this.main);
        connectDom({
            events: ["input", "click", "change"],
            attributes: [
                "disabled", "readonly", "name", "value", "checked",
                "required"
            ]
        }, this, this.checkbox);
        connectAttribute("src", this, this.img);
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
}