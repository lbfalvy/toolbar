import Dropdown from "./dropdown.mjs";

const arrowWidth = 24;
const css = `
#visible::after {
    pointer-events: none;
}
#clickarea {
    position: absolute;
    top: 0; bottom: 0;
    right: 0;
    width: ${arrowWidth}px;
    background: #fff4;
}
`

export default class TriggerSet extends Dropdown {
    constructor() {
        super();
        this.stylesheet.append(css);
        this.openArea = document.createElement("span");
        this.openArea.id = "clickarea";
        this.displayed.append(this.openArea);
        this.addEventListener("change",
                () => this.displayed.append(this.openArea));
        this.displayed.addEventListener("click", 
                ev => this.handleDisplayedClick(ev));
    }

    /** @param {MouseEvent} ev */
    handleClick(ev) {
        if (ev.target != this.openArea) {
            this.removeAttribute("open");
        }
    } // Undefine this
    /** @param {MouseEvent} ev */
    handleDisplayedClick(ev) {
        // If it's being opened by the arrow, let it.
        if (ev.target == this.openArea) {
            this.toggleAttribute("open");
            ev.stopPropagation();
            return;
        }
        // Otherwise stop the event
        ev.stopPropagation();
        // then call the click event on the active option.
        this.active?.dispatchEvent(new ev.constructor(ev.type, ev));
    }
}

customElements.define("trigger-set", TriggerSet);