const css = `
:host {
    //padding-right: 20px;
    position: relative;
    background: #555;
    width: max-content;
    border: 2px solid black;
    color: white;
    overflow: visible;
}
#visible::after {
    content: "";
    float: right;
    width: 8px; height: 8px;
    margin-top: 4px;
    //margin-right: -17px;
    border-right: 2px solid #ddd;
    border-bottom: 2px solid #ddd;
    transition: transform .1s ease-out, margin-top .1s ease-out;
    transform: rotate(45deg);
}
:host([open]) #visible::after {
    margin-top: 7px;
    transform: rotate(225deg);
}
:host([open]) {
    border: 2px solid #ccc;
}
#options {
    display: block;
    background: #333;
    position: relative;
    margin-bottom: calc(-100% - 4px);
    overflow: auto;
    height: min-content;
    max-height: 0em;
    transform: translateY(6px);
    clear: both;
}
:host([open]) #options {
    max-height: 10em;
    border: 2px solid #ccc;
}
:host([open]) #options::slotted(:hover) {
    cursor: pointer;
    background: #fff6;
}
#visible {
    padding: 5px 7px 0px;
    cursor: pointer;
} 
#options::slotted(*) {
    padding: 5px 7px;
    padding-right: 24px;
}`;

export default class extends HTMLElement {
    constructor(...args) {
        const self = super(args);
        // === Build shadow tree ===
        const shadow = this.attachShadow({mode: "open"});
        const style = document.createElement("style");
        style.type = "text/css";
        style.append(css);
        const visible = document.createElement("div");
        visible.id = "visible";
        const options = document.createElement("slot");
        options.id = "options";
        shadow.append(style, visible, options);
        // === React to clicks
        this.addEventListener("click", ev => {
            if (!this.hasAttribute("open")) {
                ev.stopPropagation();
                setTimeout( this.open.bind(this), 0 );
            } else {
                const option = this.getContainingOption(ev.target);
                if (option) this.select(option);
                this.updateVisible();
            }
        });
        return self;
    }

    getContainingOption(node) {
        /** @type {HTMLSlotElement} */
        const slot = this.shadowRoot.getElementById("options");
        return slot.assignedElements().find(x => x == node || x.contains(node));
    }

    /** @param {Element} choice */
    select(choice) {
        this.getActive()?.removeAttribute("active");
        choice.setAttribute("active", "active");
    }

    open() {
        this.setAttribute("open", "open");
        window.addEventListener("click", this.close.bind(this), {once:true});
    }

    close() {
        this.removeAttribute("open");
    }

    updateVisible() {
        const visible = this.shadowRoot.getElementById("visible");
        visible.childNodes.forEach(node => node.remove());
        visible.append(this.getDisplayedHTML());
    }

    getActive() {
        return this.querySelector("[active]");
    }

    getDisplayedHTML() {
        return this.getActive().innerHTML;
    }
}