const css = `
:host {
    display: inline-block;
    position: relative;
    /* === COSMETIC === */
    border: 2px solid #fff3;
    color: white;
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
    /* === COSMETIC === */
    background: #555;
    border: 2px solid #ccc;
}
#options {
    white-space: nowrap;
    display: block;             /* slots are inline by default */
    position: absolute;         /* doesn't affect its parent */
    top: 100%;                  /* below the parent */
    visibility: hidden;         /* hide by default */
    /* === COSMETIC === */
    transform: translateY(2px); /* little room below the parent */
    background: #333;
    border: 2px solid #ccc;
    left: -2px;                 /* Border next to the parent */
}
:host([open]) #options {
    visibility: visible;        /* show only when open */
}
:host([open]) #options::slotted(:hover) {
    cursor: pointer;
    /* === COSMETIC === */
    background: #fff6;
}
#visible {
    padding: 0px 2px 0px 0px;
    cursor: pointer;
    /* === COSMETIC === */
    padding: 2.5px 7px 2.5px;   /* not too close to the borders */
} 
#options::slotted(*) {
    display: block;             /* must fill the whole row */
    padding: 0px 13px 0px 0px;  /* visible +12px on the right */
    /* === COSMETIC === */
    padding: 5px 24px 7px 7px;  /* same as visible, plus the arrow */
}`;

export default class DropdownSelect extends HTMLElement {
    constructor() {
        super();
        // === Build shadow tree ===
        const shadow = this.attachShadow({mode: "open"});
        this.stylesheet = document.createElement("style");
        this.stylesheet.type = "text/css";
        this.stylesheet.append(css);
        this.displayed = document.createElement("div");
        this.displayed.id = "visible";
        this.displayed.setAttribute("part", "selection");
        this.options = document.createElement("slot");
        this.options.id = "options";
        this.options.setAttribute("part", "options");
        shadow.append(this.stylesheet, this.displayed, this.options);
        this.setAttribute("value", this.getAttribute("default-value"));
        // === Select initial value ===
        const initial = this.active;
        if (initial) {
            this.select(initial, false);
        }
        // === React to clicks ===
        if (!this.disabled) this.addEventListener("click", 
            ev => this.handleClick(ev));
        // === Constant width ===
        const widthUpdater = new MutationObserver(this.updateWidth.bind(this));
        widthUpdater.observe(shadow, {childList: true, attributes: true});
        this.updateWidth();
    }

    /** @param {MouseEvent} ev */
    handleClick(ev) {
        // If the dropdown is closed
        if (!this.hasAttribute("open")) {
            ev.stopPropagation();
            this.open();
        } else { // If the dropdown is open
            // Get the option
            const option = this.getContainingOption(ev.target);
            // Select it
            if (this.isValidChoice(option)) {
                this.select(option);
            }
        }
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
    select(choice, noevents = false) {
        // Remove attribute from previous, if any
        this.active?.removeAttribute("active");
        // Set boolean attribute
        choice.setAttribute("active", "active");
        // Value is either taken from active or deduced if missing
        this.setAttribute("value", choice.hasAttribute("value") ?
                          choice.getAttribute("value") : choice.textContent);
        // Update the visisble item
        this.displayed.innerHTML = choice.innerHTML;
        // Dispatch input-related events
        if (!noevents) {
            this.dispatchEvent(new InputEvent("input", { data: choice.getAttribute("value") }));
            this.dispatchEvent(new Event("change"));
        }
    }

    open() {
        this.setAttribute("open", "open");
        window.addEventListener("click", this.close.bind(this), {once:true});
    }

    close() {
        this.removeAttribute("open");
    }

    set active(value) {
        // Value can identify a node:
        if (value instanceof Element) {
            // If it's one of our children
            if (value.parentElement == this) this.select(value);
        } else if (typeof value == "string") {
            // If it's the value of one of our children
            for(let child of this.children) {
                if (child.getAttribute("value") == value) {
                    return this.select(child);
                }
            }
            // If it's the content of one of our children
            for(let child of this.children) {
                if (child.innerHTML == value) {
                    this.select(value);
                    break;
                }
            }
        } else if (typeof value == "number") {
            // If it's an index in the range of our children, or the name of one of them.
            if (this.childElementCount > value) {
                this.select(this.children[value]);
            }
        }
    }

    get active() {
        return this.querySelector("[active]");
    }

    updateWidth() {;
        const optsWidth = this.options.clientWidth + "px";
        this.style.width = optsWidth;
    }
}

customElements.define("dropdown-select", DropdownSelect);