/**
 * Forward an event from one DOM node to another
 * @param {string} name 
 * @param {Element} one 
 * @param {Element} other 
 */
export function connectEvent(name, one, other) 
{
    var echo_blocker = false;
    const get_handler = (target) => ev => {
        // If it hit the target already let it bubble out.
        if (ev.composedPath().includes(target)) return;
        // If natural, relay it to the target and set the relay flag
        if (!echo_blocker) 
        {
            echo_blocker = true;
            target.dispatchEvent(new ev.constructor(ev.type, ev));
            ev.stopPropagation();
        }
        // If it's come via this relay, reset the flag
        else echo_blocker = false;
    };
    one.addEventListener(name, get_handler(other));
    one.shadowRoot?.addEventListener(name, get_handler(other));
    other.addEventListener(name, get_handler(one));
    other.shadowRoot?.addEventListener(name, get_handler(one));
}

/**
 * Keep an attribute synced between two elements
 * @param {string} name 
 * @param {Element} one 
 * @param {Element} other 
 */
export function connectAttribute(name, one, other) 
{
    var echo_blocker = false;
    // Sync up
    if (one.hasAttribute(name)) 
    {
        other.setAttribute(name, one.getAttribute(name));
    }
    // Wire one direction
    function get_watcher(source, target)
    {
        const watcher = new MutationObserver(mutation => {
            // If mutated by this pair, don't echo
            if (!echo_blocker) 
            {
                if (source.hasAttribute(name)) 
                {
                    const value = source.getAttribute(name);
                    target.setAttribute(name, value);
                }
                else target.removeAttribute(name);
            }
            // Flip echo-blocker
            echo_blocker = !echo_blocker;
        });
        watcher.observe(source, { attributeFilter: [name] });
        return watcher;
    }
    get_watcher(one, other);
    get_watcher(other, one);
}

/**
 * Connect events and attributes of two elements
 * @param {{events: string[], attributes: string[]}} data 
 * @param {Element} one
 * @param {Element} other
 */
export function connectDom(data, one, other)
{
    data.attributes.forEach(attr => connectAttribute(attr,one,other));
    data.events.forEach(ev => connectEvent(ev,one,other));
}