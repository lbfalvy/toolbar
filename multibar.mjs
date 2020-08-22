// Generate unique identifiers
var next_uid = 0;
/** @returns {Number} */
var getUid = () => next_uid++;
// Call this to set your own method
/** @param {() => Number} gen */
export function setUidGenerator(gen) {
    getUid = gen;
}

const css = `
div {
    float: left;
    display: table;
}
span {
    display: table-cell;
    width: 0.5em;
    height: 100%;
}
:host(*) {
    display: block;
}
:host(*)::after {
    content: "";
    display: table;
    clear: both;
}
`

export default class Multibar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        // Stylesheet
        this.stylesheet = document.createElement("style");
        this.stylesheet.append(css);
        this.shadowRoot.append(this.stylesheet);
        // Observer
        this.watcher = new MutationObserver(x => this.buildBar());
        this.watcher.observe(this, {childList: true});

        this.ondrop = Multibar.dropHandler;
        this.ondragover = Multibar.dragoverHandler;
        this.buildBar(); // Build dom
    }
    buildBar() {
        // Remove everything except the CSS
        for (let bar of this.shadowRoot.querySelectorAll("div")) {
            bar.remove();
        }
        // Add them in one by one again
        for (let child of this.children) {
            var slotName = child.getAttribute("slot");
            if (!slotName) {
                slotName = getUid();
                child.setAttribute("slot", slotName);
            }
            // If there's already a slot with the given name, skip it.
            if (!this.shadowRoot.querySelector(`slot[name="${slotName}"]`)) {
                const bar = document.createElement("div");
                bar.setAttribute("part", "toolbar");
                bar.ondragenter = () => bar.setAttribute("part", "toolbar hover");
                bar.ondragexit = () => bar.setAttribute("part", "toolbar");
                bar.ondragover = Multibar.dragoverHandler;
                bar.ondrop = Multibar.dropHandler;
                const slot = document.createElement("slot");
                slot.name = slotName;
                slot.setAttribute("part", "slot");
                const handle = document.createElement("span");
                handle.setAttribute("part", "handle");
                handle.draggable = true;
                handle.ondragstart = Multibar.dragHandler;
                bar.append(slot, handle);
                this.shadowRoot.append(bar);
            }
        }
    }

    /** @param {DragEvent} ev */
    static dragHandler(ev) {
        /** @type {Element} */
        const bar = ev.currentTarget.parentElement;
        const slot = bar.firstElementChild;
        ev.dataTransfer.setDragImage(bar, 0, 0);
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("bar/uid", slot.getAttribute("name"));
    }

    /** @param {DragEvent} ev */
    static dragoverHandler(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    }

    /** @param {DragEvent} ev */
    static dropHandler(ev) {
        const uid = ev.dataTransfer.getData("bar/uid");
        const dragged = document.querySelector(`[slot="${uid}"]`);
        /** @type {Element} */
        const target = ev.currentTarget;
        if (target instanceof Multibar) target.append(dragged);
        else {
            target.parentNode.insertBefore(dragged, target);
            target.setAttribute("part", "toolbar");
        }
    }
}

customElements.define("multi-bar", Multibar);