const css = `
:host {
    display: inline-block;
    position: relative;
    background: #555;
    width: max-content;
    border: 2px solid black;
    color: white;
    overflow: visible;
    height: 100%;
}
#visible::after {
    content: "";
    float: right;
    width: 8px; height: 8px;
    margin-top: 4px;
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
    float: left;
    left: 0;
    overflow: auto;
    height: 0;
    transform: translateY(6px);
    clear: both;
    margin-bottom: calc(-100% - 4px);
    margin-right: 4px;
}
:host([open]) #options {
    margin-right: unset;
    height: min-content;
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
        super();
        // === Build shadow tree ===
        const shadow = this.attachShadow({mode: "open"});
        const style = document.createElement("style");
        style.type = "text/css";
        style.append(css);
        const visible = document.createElement("div");
        visible.id = "visible";
        visible.setAttribute("part", "selection");
        const options = document.createElement("slot");
        options.id = "options";
        options.setAttribute("part", "options");
        shadow.append(style, visible, options);
        this.setAttribute("value", this.getAttribute("default-value"));
        // === Select initial value ===
        const initial = this.getContainingOption(this.querySelector("[active]"));
        this.select(initial);
        this.updateVisible();
        // === React to clicks ===
        if (!this.disabled) this.addEventListener("click", ev => {
            // If the dropdown is closed
            if (!this.hasAttribute("open")) {
                ev.stopPropagation();
                // open it (shortly?)
                setTimeout( this.open.bind(this), 0 );
            } else { // If the dropdown is open
                // Get the option
                const option = this.getContainingOption(ev.target);
                // Select it
                if (option && this.isValidChoice(option)) {
                    this.select(option);
                    this.updateVisible();
                }
            }
        });
    }

    isValidChoice(option) {
        return option && option.textContent != ""
            && !option.getAttribute("disabled");
    }

    getContainingOption(node) {
        /** @type {HTMLSlotElement} */
        const slot = this.shadowRoot.getElementById("options");
        return slot.assignedElements().find(x => x == node || x.contains(node));
    }

    /** @param {Element} choice */
    select(choice) {
        // Remove attribute from previous, if any
        this.getActive()?.removeAttribute("active");
        // Set boolean attribute
        choice.setAttribute("active", "active");
        // Value is either taken from active or deduced if missing
        this.setAttribute("value", choice.hasAttribute("value") ?
                          choice.getAttribute("value") : choice.textContent);
        // Dispatch input-related events
        this.dispatchEvent(new InputEvent("input", { data: choice.getAttribute("value") }));
        this.dispatchEvent(new Event("change"));
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
        visible.innerHTML = this.getDisplayedHTML();
    }

    getActive() {
        return this.querySelector("[active]");
    }

    getDisplayedHTML() {
        return this.getActive().innerHTML;
    }
}