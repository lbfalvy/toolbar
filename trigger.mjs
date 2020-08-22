import {connectAttribute} from "./connect_dom.mjs"

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
:host(:not([disabled])) * {
    cursor: pointer;
}
:host(:not([disabled]):hover) {
    border: 2px solid #fff4;
    background: #fff6;
}
:host(:active) {
    border: 2px solid #fff6;
    background: #fff2;
}
:host([disabled]) {
    filter: brightness(0.5) saturate(0.5);
    pointer-events: none;
}
`;

export default class IconTrigger extends HTMLElement {
    constructor() {
        super();
        // === Create shadow root ===
        const shadow = this.attachShadow({mode:"open"});
        const style = document.createElement("style");
        style.type = "text/css";
        style.append(css);
        const label = document.createElement("label");
        this.img = document.createElement("img");
        label.append(this.img);
        shadow.append(style, label);
        connectAttribute("src", this, this.img);
    }
}

customElements.define("icon-trigger", IconTrigger);