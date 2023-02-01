
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.50.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let collisionAlpha = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    let wall = [];

    for(let i = 0; i < collisionAlpha.length; i += 70){
        wall.push(collisionAlpha.slice(i, 70 + i));
    }

    const alphaTask0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const task0 = [];
    for(let i = 0; i < alphaTask0.length; i += 70){
        task0.push(alphaTask0.slice(i, 70 + i));
    }


    const alphaTask1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const task1$1 = [];
    for(let i = 0; i < alphaTask1.length; i += 70){
        task1$1.push(alphaTask1.slice(i, 70 + i));
    }

    const alphaTask2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const task2$1 = [];
    for(let i = 0; i < alphaTask2.length; i += 70){
        task2$1.push(alphaTask2.slice(i, 70 + i));
    }

    const collision = writable(wall);
    const walk = writable(true);
    const Task0 = writable(task0);
    const Task1 = writable(task1$1);
    const Task2 = writable(task2$1);
    let life = writable(100);
    const ranking = writable([]);

    ranking.subscribe(v => {
        const user = v.at(-1);
        if (!user) return;
        const formData = new FormData();
        formData.append('Nome', user.nome);
        formData.append('pontos', user.pontos);

        fetch('http://localhost:8001/adicionar.php', {
            method: 'post',
            body: formData
        }); // non blocking
    });

    /* src/Tasks/telaTeste.svelte generated by Svelte v3.50.0 */
    const file$8 = "src/Tasks/telaTeste.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Task 0";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Back";
    			add_location(h1, file$8, 11, 2, 199);
    			add_location(button, file$8, 12, 2, 217);
    			attr_dev(div, "id", "task0");
    			attr_dev(div, "class", "svelte-u0f1xo");
    			add_location(div, file$8, 10, 0, 180);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $walk;
    	validate_store(walk, 'walk');
    	component_subscribe($$self, walk, $$value => $$invalidate(2, $walk = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TelaTeste', slots, []);

    	function backToLobby() {
    		set_store_value(walk, $walk = true, $walk);
    		game.style.display = "flex";
    		epiContainer.style.display = "none";
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TelaTeste> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => backToLobby();
    	$$self.$capture_state = () => ({ walk, backToLobby, $walk });
    	return [backToLobby, click_handler];
    }

    class TelaTeste extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TelaTeste",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Tasks/telaTeste1.svelte generated by Svelte v3.50.0 */
    const file$7 = "src/Tasks/telaTeste1.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Task 1";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Back";
    			add_location(h1, file$7, 12, 8, 225);
    			add_location(button, file$7, 13, 8, 249);
    			attr_dev(div, "id", "task1");
    			attr_dev(div, "class", "svelte-1x4bmmt");
    			add_location(div, file$7, 11, 0, 200);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $walk;
    	validate_store(walk, 'walk');
    	component_subscribe($$self, walk, $$value => $$invalidate(2, $walk = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TelaTeste1', slots, []);

    	function backToLobby() {
    		game.style.display = "flex";
    		task1.style.display = "none";
    		set_store_value(walk, $walk = true, $walk);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TelaTeste1> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => backToLobby();
    	$$self.$capture_state = () => ({ walk, backToLobby, $walk });
    	return [backToLobby, click_handler];
    }

    class TelaTeste1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TelaTeste1",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Tasks/telaTeste2.svelte generated by Svelte v3.50.0 */
    const file$6 = "src/Tasks/telaTeste2.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let button0;
    	let t3;
    	let form_1;
    	let input0;
    	let t4;
    	let input1;
    	let t5;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Task 2";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Back";
    			t3 = space();
    			form_1 = element("form");
    			input0 = element("input");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Send";
    			add_location(h1, file$6, 30, 8, 545);
    			add_location(button0, file$6, 31, 8, 569);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Nome");
    			attr_dev(input0, "name", "Nome");
    			add_location(input0, file$6, 34, 12, 688);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "placeholder", "pontos");
    			attr_dev(input1, "name", "pontos");
    			add_location(input1, file$6, 40, 12, 856);
    			add_location(button1, file$6, 46, 12, 1033);
    			add_location(form_1, file$6, 33, 8, 631);
    			attr_dev(div, "id", "task2");
    			attr_dev(div, "class", "svelte-6933wu");
    			add_location(div, file$6, 29, 0, 520);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, button0);
    			append_dev(div, t3);
    			append_dev(div, form_1);
    			append_dev(form_1, input0);
    			set_input_value(input0, /*form*/ ctx[0].nome);
    			append_dev(form_1, t4);
    			append_dev(form_1, input1);
    			set_input_value(input1, /*form*/ ctx[0].pontos);
    			append_dev(form_1, t5);
    			append_dev(form_1, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(form_1, "submit", prevent_default(/*addranking*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*form*/ 1 && input0.value !== /*form*/ ctx[0].nome) {
    				set_input_value(input0, /*form*/ ctx[0].nome);
    			}

    			if (dirty & /*form*/ 1 && to_number(input1.value) !== /*form*/ ctx[0].pontos) {
    				set_input_value(input1, /*form*/ ctx[0].pontos);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $ranking;
    	let $walk;
    	validate_store(ranking, 'ranking');
    	component_subscribe($$self, ranking, $$value => $$invalidate(6, $ranking = $$value));
    	validate_store(walk, 'walk');
    	component_subscribe($$self, walk, $$value => $$invalidate(7, $walk = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TelaTeste2', slots, []);

    	function backToLobby() {
    		game.style.display = "flex";
    		task2.style.display = "none";
    		set_store_value(walk, $walk = true, $walk);
    	}

    	const form = { nome: "", pontos: 0 };

    	const addranking = () => {
    		// form.nome = 'Pchronos';
    		// form.pontos = 7000;
    		set_store_value(ranking, $ranking = $ranking.concat({ nome: form.nome, pontos: form.pontos }), $ranking);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TelaTeste2> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => backToLobby();

    	function input0_input_handler() {
    		form.nome = this.value;
    		$$invalidate(0, form);
    	}

    	function input1_input_handler() {
    		form.pontos = to_number(this.value);
    		$$invalidate(0, form);
    	}

    	$$self.$capture_state = () => ({
    		walk,
    		ranking,
    		backToLobby,
    		form,
    		addranking,
    		$ranking,
    		$walk
    	});

    	return [
    		form,
    		backToLobby,
    		addranking,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class TelaTeste2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TelaTeste2",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    // o estado do jogo guarda a informação sobre a tela questamos no momento
    let estado = writable('mapa');

    function trocarEstadoDoJogo(novoEstado) {
    	estado.set(novoEstado);
    }

    /* src/Tasks/EpiTask.svelte generated by Svelte v3.50.0 */

    const { document: document_1$1 } = globals;
    const file$5 = "src/Tasks/EpiTask.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    // (89:12) {#each cards as card}
    function create_each_block$1(ctx) {
    	let div6;
    	let div0;
    	let h10;
    	let t0_value = /*card*/ ctx[41].item_name + "";
    	let t0;
    	let t1;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let div2;
    	let h11;
    	let t4;
    	let p;
    	let t5_value = /*card*/ ctx[41].item_info + "";
    	let t5;
    	let t6;
    	let div5;
    	let div3;
    	let t8;
    	let div4;
    	let t10;
    	let mounted;
    	let dispose;

    	function click_handler_17() {
    		return /*click_handler_17*/ ctx[25](/*card*/ ctx[41]);
    	}

    	function click_handler_18() {
    		return /*click_handler_18*/ ctx[26](/*card*/ ctx[41]);
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			div2 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Descrição do item";
    			t4 = space();
    			p = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "Voltar";
    			t8 = space();
    			div4 = element("div");
    			div4.textContent = "Equipar";
    			t10 = space();
    			add_location(h10, file$5, 91, 20, 7289);
    			attr_dev(div0, "class", "item_Name");
    			add_location(div0, file$5, 90, 16, 7245);
    			if (!src_url_equal(img.src, img_src_value = /*card*/ ctx[41].item_image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*card*/ ctx[41].item_name);
    			add_location(img, file$5, 94, 20, 7397);
    			attr_dev(div1, "class", "cardInfo");
    			add_location(div1, file$5, 93, 16, 7354);
    			add_location(h11, file$5, 97, 20, 7536);
    			add_location(p, file$5, 98, 20, 7583);
    			attr_dev(div2, "class", "item_description");
    			add_location(div2, file$5, 96, 16, 7485);
    			attr_dev(div3, "class", "returnBtn");
    			add_location(div3, file$5, 101, 20, 7688);
    			attr_dev(div4, "class", "confirmBtn");
    			add_location(div4, file$5, 102, 20, 7804);
    			attr_dev(div5, "class", "btnArea");
    			add_location(div5, file$5, 100, 16, 7646);
    			attr_dev(div6, "class", "card");
    			attr_dev(div6, "id", /*card*/ ctx[41].item);
    			set_style(div6, "display", "none");
    			add_location(div6, file$5, 89, 12, 7172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			append_dev(div0, h10);
    			append_dev(h10, t0);
    			append_dev(div6, t1);
    			append_dev(div6, div1);
    			append_dev(div1, img);
    			append_dev(div6, t2);
    			append_dev(div6, div2);
    			append_dev(div2, h11);
    			append_dev(div2, t4);
    			append_dev(div2, p);
    			append_dev(p, t5);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div6, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", click_handler_17, false, false, false),
    					listen_dev(div4, "click", click_handler_18, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(89:12) {#each cards as card}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let link;
    	let t0;
    	let div49;
    	let div48;
    	let div0;
    	let t1;
    	let div18;
    	let h10;
    	let t3;
    	let div17;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let div3;
    	let t6;
    	let div4;
    	let t7;
    	let div5;
    	let img2;
    	let img2_src_value;
    	let t8;
    	let div6;
    	let t9;
    	let div7;
    	let t10;
    	let div8;
    	let img3;
    	let img3_src_value;
    	let t11;
    	let div9;
    	let img4;
    	let img4_src_value;
    	let t12;
    	let div10;
    	let img5;
    	let img5_src_value;
    	let t13;
    	let div11;
    	let t14;
    	let div12;
    	let img6;
    	let img6_src_value;
    	let t15;
    	let div13;
    	let img7;
    	let img7_src_value;
    	let t16;
    	let div14;
    	let img8;
    	let img8_src_value;
    	let t17;
    	let div15;
    	let img9;
    	let img9_src_value;
    	let t18;
    	let div16;
    	let t19;
    	let div43;
    	let div20;
    	let p0;
    	let t21;
    	let div19;
    	let t23;
    	let div22;
    	let p1;
    	let t25;
    	let div21;
    	let t27;
    	let div28;
    	let p2;
    	let t29;
    	let div26;
    	let div23;
    	let span0;
    	let span1;
    	let t32;
    	let div24;
    	let span2;
    	let span3;
    	let t35;
    	let div25;
    	let span4;
    	let span5;
    	let t38;
    	let div27;
    	let t40;
    	let div30;
    	let p3;
    	let t42;
    	let div29;
    	let t44;
    	let div36;
    	let p4;
    	let t45;
    	let t46;
    	let br;
    	let t47;
    	let t48;
    	let t49;
    	let div34;
    	let div31;
    	let span6;
    	let span7;
    	let t52;
    	let div32;
    	let span8;
    	let span9;
    	let t55;
    	let div33;
    	let span10;
    	let span11;
    	let t58;
    	let div35;
    	let t60;
    	let div42;
    	let p5;
    	let t62;
    	let div40;
    	let div37;
    	let span12;
    	let span13;
    	let t65;
    	let div38;
    	let span14;
    	let span15;
    	let t68;
    	let div39;
    	let span16;
    	let span17;
    	let t71;
    	let div41;
    	let t73;
    	let div44;
    	let t74;
    	let div45;
    	let t75;
    	let div47;
    	let h11;
    	let t77;
    	let h2;
    	let t78;
    	let t79;
    	let t80;
    	let div46;
    	let mounted;
    	let dispose;
    	let each_value = /*cards*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div49 = element("div");
    			div48 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div18 = element("div");
    			h10 = element("h1");
    			h10.textContent = "INVENTARIO DO ARMARIO";
    			t3 = space();
    			div17 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t4 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t5 = space();
    			div3 = element("div");
    			t6 = space();
    			div4 = element("div");
    			t7 = space();
    			div5 = element("div");
    			img2 = element("img");
    			t8 = space();
    			div6 = element("div");
    			t9 = space();
    			div7 = element("div");
    			t10 = space();
    			div8 = element("div");
    			img3 = element("img");
    			t11 = space();
    			div9 = element("div");
    			img4 = element("img");
    			t12 = space();
    			div10 = element("div");
    			img5 = element("img");
    			t13 = space();
    			div11 = element("div");
    			t14 = space();
    			div12 = element("div");
    			img6 = element("img");
    			t15 = space();
    			div13 = element("div");
    			img7 = element("img");
    			t16 = space();
    			div14 = element("div");
    			img8 = element("img");
    			t17 = space();
    			div15 = element("div");
    			img9 = element("img");
    			t18 = space();
    			div16 = element("div");
    			t19 = space();
    			div43 = element("div");
    			div20 = element("div");
    			p0 = element("p");
    			p0.textContent = "Em nossa empresa é extremamente importante garantir a sua segurança enquando atua em nossas dependências.";
    			t21 = space();
    			div19 = element("div");
    			div19.textContent = "Avançar";
    			t23 = space();
    			div22 = element("div");
    			p1 = element("p");
    			p1.textContent = "Tendo isso em mente nós disponibilizamos os equipamentos de proteção essenciais para a realização segura do seu trabalho, assim que estiver pronto clique no armário para iniciar a missão.";
    			t25 = space();
    			div21 = element("div");
    			div21.textContent = "Estou pronto";
    			t27 = space();
    			div28 = element("div");
    			p2 = element("p");
    			p2.textContent = "Para que você possa trabalhar com segurança é necessário ter equipado os seguintes equipamentos.";
    			t29 = space();
    			div26 = element("div");
    			div23 = element("div");
    			span0 = element("span");
    			span0.textContent = "Capacete de segurança";
    			span1 = element("span");
    			span1.textContent = "Óculos de proteção";
    			t32 = space();
    			div24 = element("div");
    			span2 = element("span");
    			span2.textContent = "Colete Refletivo";
    			span3 = element("span");
    			span3.textContent = "Protetor de ouvidos";
    			t35 = space();
    			div25 = element("div");
    			span4 = element("span");
    			span4.textContent = "Botas com biqueira";
    			span5 = element("span");
    			span5.textContent = "Luvas de proteção";
    			t38 = space();
    			div27 = element("div");
    			div27.textContent = "Avançar";
    			t40 = space();
    			div30 = element("div");
    			p3 = element("p");
    			p3.textContent = "Agora que você sabe quais os itens necessários selecione os equipamentos corretos para avançar para a proxima fase";
    			t42 = space();
    			div29 = element("div");
    			div29.textContent = "Selecionar itens";
    			t44 = space();
    			div36 = element("div");
    			p4 = element("p");
    			t45 = text(/*equipedItem*/ ctx[1]);
    			t46 = text(" com Sucesso. ");
    			br = element("br");
    			t47 = text("Equipamentos restantes: ");
    			t48 = text(/*equipCont*/ ctx[2]);
    			t49 = space();
    			div34 = element("div");
    			div31 = element("div");
    			span6 = element("span");
    			span6.textContent = "Capacete de segurança";
    			span7 = element("span");
    			span7.textContent = "Óculos de proteção";
    			t52 = space();
    			div32 = element("div");
    			span8 = element("span");
    			span8.textContent = "Colete Refletivo";
    			span9 = element("span");
    			span9.textContent = "Protetor de ouvidos";
    			t55 = space();
    			div33 = element("div");
    			span10 = element("span");
    			span10.textContent = "Botas com biqueira";
    			span11 = element("span");
    			span11.textContent = "Luvas de proteção";
    			t58 = space();
    			div35 = element("div");
    			div35.textContent = "Continuar";
    			t60 = space();
    			div42 = element("div");
    			p5 = element("p");
    			p5.textContent = "Este item não corresponde com os requesitos de segurança selecione outro item.";
    			t62 = space();
    			div40 = element("div");
    			div37 = element("div");
    			span12 = element("span");
    			span12.textContent = "Capacete de segurança";
    			span13 = element("span");
    			span13.textContent = "Óculos de proteção";
    			t65 = space();
    			div38 = element("div");
    			span14 = element("span");
    			span14.textContent = "Colete Refletivo";
    			span15 = element("span");
    			span15.textContent = "Protetor de ouvidos";
    			t68 = space();
    			div39 = element("div");
    			span16 = element("span");
    			span16.textContent = "Botas com biqueira";
    			span17 = element("span");
    			span17.textContent = "Luvas de proteção";
    			t71 = space();
    			div41 = element("div");
    			div41.textContent = "Continuar selecionando";
    			t73 = space();
    			div44 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t74 = space();
    			div45 = element("div");
    			t75 = space();
    			div47 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Missão Concluida";
    			t77 = space();
    			h2 = element("h2");
    			t78 = text("Pontuação da missão: ");
    			t79 = text(/*points*/ ctx[0]);
    			t80 = space();
    			div46 = element("div");
    			div46.textContent = "Voltar ao mapa";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/styles/epi.css");
    			add_location(link, file$5, 1, 4, 18);
    			attr_dev(div0, "id", "locker");
    			add_location(div0, file$5, 5, 8, 137);
    			add_location(h10, file$5, 7, 12, 296);
    			attr_dev(img0, "id", "helmet_img");
    			if (!src_url_equal(img0.src, img0_src_value = "/images/helmet.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "helmet");
    			add_location(img0, file$5, 9, 35, 391);
    			attr_dev(div1, "class", "slots");
    			add_location(div1, file$5, 9, 16, 372);
    			attr_dev(img1, "id", "boot2_img");
    			if (!src_url_equal(img1.src, img1_src_value = "/images/botabalanceiada.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "bota");
    			add_location(img1, file$5, 10, 35, 554);
    			attr_dev(div2, "class", "slots");
    			add_location(div2, file$5, 10, 16, 535);
    			attr_dev(div3, "class", "slots");
    			add_location(div3, file$5, 11, 16, 700);
    			attr_dev(div4, "class", "slots");
    			add_location(div4, file$5, 12, 16, 742);
    			attr_dev(img2, "id", "glasses_img");
    			if (!src_url_equal(img2.src, img2_src_value = "/images/glasses.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "glasses");
    			add_location(img2, file$5, 13, 35, 803);
    			attr_dev(div5, "class", "slots");
    			add_location(div5, file$5, 13, 16, 784);
    			attr_dev(div6, "class", "slots");
    			add_location(div6, file$5, 14, 16, 950);
    			attr_dev(div7, "class", "slots");
    			add_location(div7, file$5, 15, 16, 992);
    			attr_dev(img3, "id", "machado_img");
    			if (!src_url_equal(img3.src, img3_src_value = "/images/machado.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "machado");
    			add_location(img3, file$5, 16, 35, 1053);
    			attr_dev(div8, "class", "slots");
    			add_location(div8, file$5, 16, 16, 1034);
    			attr_dev(img4, "id", "colete_img");
    			if (!src_url_equal(img4.src, img4_src_value = "/images/colete.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "colete");
    			add_location(img4, file$5, 17, 35, 1213);
    			attr_dev(div9, "class", "slots");
    			add_location(div9, file$5, 17, 16, 1194);
    			attr_dev(img5, "id", "helmet2_img");
    			if (!src_url_equal(img5.src, img5_src_value = "/images/capacetedanificado.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			add_location(img5, file$5, 18, 35, 1373);
    			attr_dev(div10, "class", "slots");
    			add_location(div10, file$5, 18, 16, 1354);
    			attr_dev(div11, "class", "slots");
    			add_location(div11, file$5, 19, 16, 1522);
    			attr_dev(img6, "id", "boot_img");
    			if (!src_url_equal(img6.src, img6_src_value = "/images/BotaEpii.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "bota de segurança");
    			add_location(img6, file$5, 20, 35, 1584);
    			attr_dev(div12, "class", "slots");
    			add_location(div12, file$5, 20, 16, 1565);
    			attr_dev(img7, "id", "glove_img");
    			if (!src_url_equal(img7.src, img7_src_value = "/images/glove.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "glove");
    			add_location(img7, file$5, 21, 35, 1753);
    			attr_dev(div13, "class", "slots");
    			add_location(div13, file$5, 21, 16, 1734);
    			attr_dev(img8, "id", "protetor_img");
    			if (!src_url_equal(img8.src, img8_src_value = "/images/Protetor.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$5, 22, 35, 1912);
    			attr_dev(div14, "class", "slots");
    			add_location(div14, file$5, 22, 16, 1893);
    			attr_dev(img9, "id", "desentupidor_img");
    			if (!src_url_equal(img9.src, img9_src_value = "/images/Desentupidor.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "desentupidor");
    			add_location(img9, file$5, 23, 35, 2074);
    			attr_dev(div15, "class", "slots");
    			add_location(div15, file$5, 23, 16, 2055);
    			attr_dev(div16, "class", "slots");
    			add_location(div16, file$5, 24, 16, 2240);
    			attr_dev(div17, "id", "itens");
    			add_location(div17, file$5, 8, 12, 339);
    			attr_dev(div18, "id", "epiStorage");
    			set_style(div18, "display", "none");
    			add_location(div18, file$5, 6, 8, 239);
    			add_location(p0, file$5, 29, 16, 2427);
    			attr_dev(div19, "class", "skipBtn");
    			add_location(div19, file$5, 30, 16, 2556);
    			set_style(div20, "display", "flex");
    			attr_dev(div20, "class", "dialogue");
    			attr_dev(div20, "id", "dialogue-1");
    			add_location(div20, file$5, 28, 12, 2349);
    			add_location(p1, file$5, 33, 16, 2758);
    			attr_dev(div21, "class", "skipBtn");
    			add_location(div21, file$5, 34, 16, 2970);
    			set_style(div22, "display", "none");
    			attr_dev(div22, "class", "dialogue");
    			attr_dev(div22, "id", "dialogue-2");
    			add_location(div22, file$5, 32, 12, 2681);
    			add_location(p2, file$5, 37, 16, 3231);
    			attr_dev(span0, "class", "unequipped");
    			add_location(span0, file$5, 40, 24, 3420);
    			attr_dev(span1, "class", "unequipped");
    			add_location(span1, file$5, 40, 77, 3473);
    			add_location(div23, file$5, 39, 20, 3390);
    			attr_dev(span2, "class", "unequipped");
    			add_location(span2, file$5, 43, 24, 3601);
    			attr_dev(span3, "class", "unequipped");
    			add_location(span3, file$5, 43, 72, 3649);
    			add_location(div24, file$5, 42, 20, 3571);
    			attr_dev(span4, "class", "unequipped");
    			add_location(span4, file$5, 46, 24, 3778);
    			attr_dev(span5, "class", "unequipped");
    			add_location(span5, file$5, 46, 74, 3828);
    			add_location(div25, file$5, 45, 20, 3748);
    			attr_dev(div26, "class", "Epis");
    			add_location(div26, file$5, 38, 16, 3351);
    			attr_dev(div27, "class", "skipBtn");
    			add_location(div27, file$5, 49, 16, 3944);
    			set_style(div28, "display", "none");
    			set_style(div28, "flex-direction", "column");
    			attr_dev(div28, "class", "dialogue");
    			attr_dev(div28, "id", "dialogue-3");
    			add_location(div28, file$5, 36, 12, 3131);
    			add_location(p3, file$5, 52, 16, 4147);
    			attr_dev(div29, "class", "skipBtn");
    			add_location(div29, file$5, 53, 16, 4285);
    			set_style(div30, "display", "none");
    			attr_dev(div30, "class", "dialogue");
    			attr_dev(div30, "id", "dialogue-4");
    			add_location(div30, file$5, 51, 12, 4070);
    			add_location(br, file$5, 56, 46, 4580);
    			add_location(p4, file$5, 56, 16, 4550);
    			toggle_class(span6, "unequipped", /*worker*/ ctx[3].helmet == false);
    			toggle_class(span6, "equipped", /*worker*/ ctx[3].helmet == true);
    			add_location(span6, file$5, 59, 24, 4709);
    			toggle_class(span7, "unequipped", /*worker*/ ctx[3].glasses == false);
    			toggle_class(span7, "equipped", /*worker*/ ctx[3].glasses == true);
    			add_location(span7, file$5, 59, 139, 4824);
    			add_location(div31, file$5, 58, 20, 4679);
    			toggle_class(span8, "unequipped", /*worker*/ ctx[3].vest == false);
    			toggle_class(span8, "equipped", /*worker*/ ctx[3].vest == true);
    			add_location(span8, file$5, 62, 24, 5016);
    			toggle_class(span9, "unequipped", /*worker*/ ctx[3].headphone == false);
    			toggle_class(span9, "equipped", /*worker*/ ctx[3].headphone == true);
    			add_location(span9, file$5, 62, 130, 5122);
    			add_location(div32, file$5, 61, 20, 4986);
    			toggle_class(span10, "unequipped", /*worker*/ ctx[3].boot == false);
    			toggle_class(span10, "equipped", /*worker*/ ctx[3].boot == true);
    			add_location(span10, file$5, 65, 24, 5319);
    			toggle_class(span11, "unequipped", /*worker*/ ctx[3].glove == false);
    			toggle_class(span11, "equipped", /*worker*/ ctx[3].glove == true);
    			add_location(span11, file$5, 65, 132, 5427);
    			add_location(div33, file$5, 64, 20, 5289);
    			attr_dev(div34, "class", "Epis");
    			add_location(div34, file$5, 57, 16, 4640);
    			attr_dev(div35, "class", "skipBtn");
    			add_location(div35, file$5, 68, 16, 5603);
    			set_style(div36, "display", "none");
    			set_style(div36, "flex-direction", "column");
    			attr_dev(div36, "class", "dialogue");
    			attr_dev(div36, "id", "dialogue-5");
    			add_location(div36, file$5, 55, 12, 4450);
    			add_location(p5, file$5, 71, 16, 5833);
    			toggle_class(span12, "unequipped", /*worker*/ ctx[3].helmet == false);
    			toggle_class(span12, "equipped", /*worker*/ ctx[3].helmet == true);
    			add_location(span12, file$5, 74, 24, 6005);
    			toggle_class(span13, "unequipped", /*worker*/ ctx[3].glasses == false);
    			toggle_class(span13, "equipped", /*worker*/ ctx[3].glasses == true);
    			add_location(span13, file$5, 74, 139, 6120);
    			add_location(div37, file$5, 73, 20, 5975);
    			toggle_class(span14, "unequipped", /*worker*/ ctx[3].vest == false);
    			toggle_class(span14, "equipped", /*worker*/ ctx[3].vest == true);
    			add_location(span14, file$5, 77, 24, 6312);
    			toggle_class(span15, "unequipped", /*worker*/ ctx[3].headphone == false);
    			toggle_class(span15, "equipped", /*worker*/ ctx[3].headphone == true);
    			add_location(span15, file$5, 77, 130, 6418);
    			add_location(div38, file$5, 76, 20, 6282);
    			toggle_class(span16, "unequipped", /*worker*/ ctx[3].boot == false);
    			toggle_class(span16, "equipped", /*worker*/ ctx[3].boot == true);
    			add_location(span16, file$5, 80, 24, 6615);
    			toggle_class(span17, "unequipped", /*worker*/ ctx[3].glove == false);
    			toggle_class(span17, "equipped", /*worker*/ ctx[3].glove == true);
    			add_location(span17, file$5, 80, 132, 6723);
    			add_location(div39, file$5, 79, 20, 6585);
    			attr_dev(div40, "class", "Epis");
    			add_location(div40, file$5, 72, 16, 5936);
    			attr_dev(div41, "class", "skipBtn");
    			add_location(div41, file$5, 83, 16, 6899);
    			set_style(div42, "display", "none");
    			set_style(div42, "flex-direction", "column");
    			attr_dev(div42, "class", "dialogue");
    			attr_dev(div42, "id", "dialogue-6");
    			add_location(div42, file$5, 70, 12, 5733);
    			attr_dev(div43, "id", "dialogueContainer");
    			add_location(div43, file$5, 27, 8, 2308);
    			attr_dev(div44, "id", "cardHolder");
    			set_style(div44, "display", "none");
    			add_location(div44, file$5, 86, 8, 7081);
    			attr_dev(div45, "id", "cardHolder");
    			set_style(div45, "display", "none");
    			add_location(div45, file$5, 107, 8, 7978);
    			add_location(h11, file$5, 109, 12, 8093);
    			add_location(h2, file$5, 110, 12, 8131);
    			attr_dev(div46, "id", "backToMap");
    			add_location(div46, file$5, 111, 12, 8182);
    			attr_dev(div47, "id", "EndScreen");
    			set_style(div47, "display", "none");
    			add_location(div47, file$5, 108, 8, 8037);
    			attr_dev(div48, "id", "epiScreen");
    			add_location(div48, file$5, 4, 4, 108);
    			attr_dev(div49, "id", "epiContainer");
    			add_location(div49, file$5, 3, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1$1.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div49, anchor);
    			append_dev(div49, div48);
    			append_dev(div48, div0);
    			append_dev(div48, t1);
    			append_dev(div48, div18);
    			append_dev(div18, h10);
    			append_dev(div18, t3);
    			append_dev(div18, div17);
    			append_dev(div17, div1);
    			append_dev(div1, img0);
    			append_dev(div17, t4);
    			append_dev(div17, div2);
    			append_dev(div2, img1);
    			append_dev(div17, t5);
    			append_dev(div17, div3);
    			append_dev(div17, t6);
    			append_dev(div17, div4);
    			append_dev(div17, t7);
    			append_dev(div17, div5);
    			append_dev(div5, img2);
    			append_dev(div17, t8);
    			append_dev(div17, div6);
    			append_dev(div17, t9);
    			append_dev(div17, div7);
    			append_dev(div17, t10);
    			append_dev(div17, div8);
    			append_dev(div8, img3);
    			append_dev(div17, t11);
    			append_dev(div17, div9);
    			append_dev(div9, img4);
    			append_dev(div17, t12);
    			append_dev(div17, div10);
    			append_dev(div10, img5);
    			append_dev(div17, t13);
    			append_dev(div17, div11);
    			append_dev(div17, t14);
    			append_dev(div17, div12);
    			append_dev(div12, img6);
    			append_dev(div17, t15);
    			append_dev(div17, div13);
    			append_dev(div13, img7);
    			append_dev(div17, t16);
    			append_dev(div17, div14);
    			append_dev(div14, img8);
    			append_dev(div17, t17);
    			append_dev(div17, div15);
    			append_dev(div15, img9);
    			append_dev(div17, t18);
    			append_dev(div17, div16);
    			append_dev(div48, t19);
    			append_dev(div48, div43);
    			append_dev(div43, div20);
    			append_dev(div20, p0);
    			append_dev(div20, t21);
    			append_dev(div20, div19);
    			append_dev(div43, t23);
    			append_dev(div43, div22);
    			append_dev(div22, p1);
    			append_dev(div22, t25);
    			append_dev(div22, div21);
    			append_dev(div43, t27);
    			append_dev(div43, div28);
    			append_dev(div28, p2);
    			append_dev(div28, t29);
    			append_dev(div28, div26);
    			append_dev(div26, div23);
    			append_dev(div23, span0);
    			append_dev(div23, span1);
    			append_dev(div26, t32);
    			append_dev(div26, div24);
    			append_dev(div24, span2);
    			append_dev(div24, span3);
    			append_dev(div26, t35);
    			append_dev(div26, div25);
    			append_dev(div25, span4);
    			append_dev(div25, span5);
    			append_dev(div28, t38);
    			append_dev(div28, div27);
    			append_dev(div43, t40);
    			append_dev(div43, div30);
    			append_dev(div30, p3);
    			append_dev(div30, t42);
    			append_dev(div30, div29);
    			append_dev(div43, t44);
    			append_dev(div43, div36);
    			append_dev(div36, p4);
    			append_dev(p4, t45);
    			append_dev(p4, t46);
    			append_dev(p4, br);
    			append_dev(p4, t47);
    			append_dev(p4, t48);
    			append_dev(div36, t49);
    			append_dev(div36, div34);
    			append_dev(div34, div31);
    			append_dev(div31, span6);
    			append_dev(div31, span7);
    			append_dev(div34, t52);
    			append_dev(div34, div32);
    			append_dev(div32, span8);
    			append_dev(div32, span9);
    			append_dev(div34, t55);
    			append_dev(div34, div33);
    			append_dev(div33, span10);
    			append_dev(div33, span11);
    			append_dev(div36, t58);
    			append_dev(div36, div35);
    			append_dev(div43, t60);
    			append_dev(div43, div42);
    			append_dev(div42, p5);
    			append_dev(div42, t62);
    			append_dev(div42, div40);
    			append_dev(div40, div37);
    			append_dev(div37, span12);
    			append_dev(div37, span13);
    			append_dev(div40, t65);
    			append_dev(div40, div38);
    			append_dev(div38, span14);
    			append_dev(div38, span15);
    			append_dev(div40, t68);
    			append_dev(div40, div39);
    			append_dev(div39, span16);
    			append_dev(div39, span17);
    			append_dev(div42, t71);
    			append_dev(div42, div41);
    			append_dev(div48, t73);
    			append_dev(div48, div44);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div44, null);
    			}

    			append_dev(div48, t74);
    			append_dev(div48, div45);
    			append_dev(div48, t75);
    			append_dev(div48, div47);
    			append_dev(div47, h11);
    			append_dev(div47, t77);
    			append_dev(div47, h2);
    			append_dev(h2, t78);
    			append_dev(h2, t79);
    			append_dev(div47, t80);
    			append_dev(div47, div46);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(img0, "click", /*click_handler_1*/ ctx[9], false, false, false),
    					listen_dev(img1, "click", /*click_handler_2*/ ctx[10], false, false, false),
    					listen_dev(img2, "click", /*click_handler_3*/ ctx[11], false, false, false),
    					listen_dev(img3, "click", /*click_handler_4*/ ctx[12], false, false, false),
    					listen_dev(img4, "click", /*click_handler_5*/ ctx[13], false, false, false),
    					listen_dev(img5, "click", /*click_handler_6*/ ctx[14], false, false, false),
    					listen_dev(img6, "click", /*click_handler_7*/ ctx[15], false, false, false),
    					listen_dev(img7, "click", /*click_handler_8*/ ctx[16], false, false, false),
    					listen_dev(img8, "click", /*click_handler_9*/ ctx[17], false, false, false),
    					listen_dev(img9, "click", /*click_handler_10*/ ctx[18], false, false, false),
    					listen_dev(div19, "click", /*click_handler_11*/ ctx[19], false, false, false),
    					listen_dev(div21, "click", /*click_handler_12*/ ctx[20], false, false, false),
    					listen_dev(div27, "click", /*click_handler_13*/ ctx[21], false, false, false),
    					listen_dev(div29, "click", /*click_handler_14*/ ctx[22], false, false, false),
    					listen_dev(div35, "click", /*click_handler_15*/ ctx[23], false, false, false),
    					listen_dev(div41, "click", /*click_handler_16*/ ctx[24], false, false, false),
    					listen_dev(div46, "click", /*backToLobby*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*equipedItem*/ 2) set_data_dev(t45, /*equipedItem*/ ctx[1]);
    			if (dirty[0] & /*equipCont*/ 4) set_data_dev(t48, /*equipCont*/ ctx[2]);

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span6, "unequipped", /*worker*/ ctx[3].helmet == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span6, "equipped", /*worker*/ ctx[3].helmet == true);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span7, "unequipped", /*worker*/ ctx[3].glasses == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span7, "equipped", /*worker*/ ctx[3].glasses == true);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span8, "unequipped", /*worker*/ ctx[3].vest == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span8, "equipped", /*worker*/ ctx[3].vest == true);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span9, "unequipped", /*worker*/ ctx[3].headphone == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span9, "equipped", /*worker*/ ctx[3].headphone == true);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span10, "unequipped", /*worker*/ ctx[3].boot == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span10, "equipped", /*worker*/ ctx[3].boot == true);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span11, "unequipped", /*worker*/ ctx[3].glove == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span11, "equipped", /*worker*/ ctx[3].glove == true);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span12, "unequipped", /*worker*/ ctx[3].helmet == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span12, "equipped", /*worker*/ ctx[3].helmet == true);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span13, "unequipped", /*worker*/ ctx[3].glasses == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span13, "equipped", /*worker*/ ctx[3].glasses == true);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span14, "unequipped", /*worker*/ ctx[3].vest == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span14, "equipped", /*worker*/ ctx[3].vest == true);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span15, "unequipped", /*worker*/ ctx[3].headphone == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span15, "equipped", /*worker*/ ctx[3].headphone == true);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span16, "unequipped", /*worker*/ ctx[3].boot == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span16, "equipped", /*worker*/ ctx[3].boot == true);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span17, "unequipped", /*worker*/ ctx[3].glove == false);
    			}

    			if (dirty[0] & /*worker*/ 8) {
    				toggle_class(span17, "equipped", /*worker*/ ctx[3].glove == true);
    			}

    			if (dirty[0] & /*cards, equipItem*/ 48) {
    				each_value = /*cards*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div44, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*points*/ 1) set_data_dev(t79, /*points*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div49);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function openItem(el) {
    	let it = document.getElementById(el);

    	if (it.style.display === "none") {
    		it.style.display = "flex";
    	} else {
    		it.style.display = "none";
    	}
    }

    function changeDialogues$1(paragraph1, paragraph2) {
    	let paragraph = document.getElementById(paragraph1);

    	if (paragraph.style.display === "flex") {
    		openItem(paragraph1);
    		openItem(paragraph2);
    	}
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $walk;
    	validate_store(walk, 'walk');
    	component_subscribe($$self, walk, $$value => $$invalidate(28, $walk = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EpiTask', slots, []);

    	class EpiCard {
    		constructor(item_name, item_info, item_image, item, img_ref) {
    			this.item_name = item_name;
    			this.item_info = item_info;
    			this.item_image = item_image;
    			this.item = item;
    			this.img_ref = img_ref;
    		}
    	}

    	class PlayerEpi {
    		constructor(helmet, glasses, vest, glove, boot, headphone) {
    			this.helmet = helmet;
    			this.glasses = glasses;
    			this.vest = vest;
    			this.glove = glove;
    			this.boot = boot;
    			this.headphone = headphone;
    		}
    	}

    	let points = 0;
    	let equipedItem = "";
    	let equipCont = 6;
    	let confirmlock = true;
    	let glove = new EpiCard("Luvas de proteção", "As luvas de proteção tem a capacidade de proteger a sua mão de possiveis riscos e acidentes no local de trabalho.", "/images/glove.png", "gloves", "glove_img");
    	let helmet = new EpiCard("Capacete de segurança", "Este item tem a capacidade de proteger a sua cabeça de possiveis riscos e acidentes de trabalho.", "/images/helmet.png", "helmet", "helmet_img");
    	let glasses = new EpiCard("Oculos de proteção", "Este item tem a capacidade proteger a seu olho de possiveis riscos e acidentes de trabalho.", "/images/glasses.png", "glasses", "glasses_img");
    	let vest = new EpiCard("Colete refletivo", "Este item melhora a visibilidade de quem o usa, evitando que ele seja atingido por um veículo ou equipamento.", "/images/colete.png", "vest", "colete_img");
    	let axe = new EpiCard("Machado", "O machado acaba com seus problemas ;)", "/images/machado.png", "axe", "machado_img");
    	let boot = new EpiCard("Botas com biqueira", "Descrição não definida", "/images/BotaEpii.png", "boot", "boot_img");
    	let protetor = new EpiCard("Protetor de ouvido", "Descrição não definida", "/images/Protetor.png", "headphones", "protetor_img");
    	let desentupidor = new EpiCard("desentupidor", "Descrição não definida", "/images/Desentupidor.png", "desentupidor", "desentupidor_img");
    	let helmet2 = new EpiCard("Capacete danificado", "Descrição não definida", "/images/capacetedanificado.png", "helmet2", "helmet2_img");
    	let boot2 = new EpiCard("Bota Balence iada", "Bota balanciada... ", "/images/botabalanceiada.png", "boot2", "boot2_img");

    	let cards = [
    		glove,
    		helmet,
    		glasses,
    		vest,
    		axe,
    		boot,
    		protetor,
    		desentupidor,
    		helmet2,
    		boot2
    	];

    	let worker = new PlayerEpi(false, false, false, false, false, false);

    	function equipItem(el, imgRef) {
    		let card = document.getElementById(el);
    		imgRef = document.getElementById(imgRef);

    		if (confirmlock) {
    			confirmlock = false;
    			card.classList.add("cardShakeAniamtion");

    			setTimeout(
    				() => {
    					if (el === "helmet") {
    						card.classList.add("cardOutAnimation");
    						$$invalidate(0, points += 25);
    						$$invalidate(3, worker.helmet = true, worker);
    						imgRef.classList.add("hiddenAnimation");
    						$$invalidate(1, equipedItem = "Capacete de segurança equipado ");
    						$$invalidate(2, equipCont--, equipCont);

    						setTimeout(
    							() => {
    								openItem("dialogueContainer");
    							},
    							800
    						);
    					} else if (el === "gloves") {
    						card.classList.add("cardOutAnimation");
    						$$invalidate(0, points += 25);
    						$$invalidate(3, worker.glove = true, worker);
    						imgRef.classList.add("hiddenAnimation");
    						$$invalidate(1, equipedItem = "Luvas de segurança equipadas ");
    						$$invalidate(2, equipCont--, equipCont);

    						setTimeout(
    							() => {
    								openItem("dialogueContainer");
    							},
    							800
    						);
    					} else if (el === "vest") {
    						card.classList.add("cardOutAnimation");
    						$$invalidate(0, points += 25);
    						$$invalidate(3, worker.vest = true, worker);
    						imgRef.classList.add("hiddenAnimation");
    						$$invalidate(1, equipedItem = "Colete refletivo equipado ");
    						$$invalidate(2, equipCont--, equipCont);

    						setTimeout(
    							() => {
    								openItem("dialogueContainer");
    							},
    							800
    						);
    					} else if (el === "glasses") {
    						card.classList.add("cardOutAnimation");
    						$$invalidate(0, points += 25);
    						$$invalidate(3, worker.glasses = true, worker);
    						imgRef.classList.add("hiddenAnimation");
    						$$invalidate(1, equipedItem = "Óculos de proteção equipado ");
    						$$invalidate(2, equipCont--, equipCont);

    						setTimeout(
    							() => {
    								openItem("dialogueContainer");
    							},
    							800
    						);
    					} else if (el === "boot") {
    						card.classList.add("cardOutAnimation");
    						$$invalidate(0, points += 25);
    						$$invalidate(3, worker.boot = true, worker);
    						imgRef.classList.add("hiddenAnimation");
    						$$invalidate(1, equipedItem = "Botas equipadas ");
    						$$invalidate(2, equipCont--, equipCont);

    						setTimeout(
    							() => {
    								openItem("dialogueContainer");
    							},
    							800
    						);
    					} else if (el === "headphones") {
    						card.classList.add("cardOutAnimation");
    						$$invalidate(0, points += 25);
    						$$invalidate(3, worker.headphone = true, worker);
    						imgRef.classList.add("hiddenAnimation");
    						$$invalidate(2, equipCont--, equipCont);
    						$$invalidate(1, equipedItem = "Protetor de ouvido equipado ");

    						setTimeout(
    							() => {
    								openItem("dialogueContainer");
    							},
    							800
    						);
    					} else {
    						$$invalidate(0, points -= 10);
    						changeDialogues$1("dialogue-5", "dialogue-6");

    						setTimeout(
    							() => {
    								openItem("dialogueContainer");
    							},
    							1400
    						);
    					}

    					setTimeout(
    						() => {
    							card.style.display = "none";
    							imgRef.classList.add("hiddenAnimation");
    							imgRef.style.pointerEvents = "none";
    						},
    						1300
    					);

    					setTimeout(
    						() => {
    							openItem("cardHolder");
    							confirmlock = true;
    						},
    						1350
    					);
    				},
    				1450
    			);
    		}
    	}

    	function taskFInished() {
    		if (worker.helmet && worker.glasses && worker.vest && worker.glove && worker.boot && worker.headphone) {
    			openItem("EndScreen");
    			openItem("epiStorage");
    		}
    	}

    	function backToLobby() {
    		set_store_value(walk, $walk = true, $walk);
    		game.style.display = "flex";
    		epiScreen.style.display = "none";
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EpiTask> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		(openItem("epiStorage"), openItem("dialogueContainer"));
    	};

    	const click_handler_1 = () => {
    		(openItem("helmet"), openItem("cardHolder"));
    	};

    	const click_handler_2 = () => {
    		(openItem("boot2"), openItem("cardHolder"));
    	};

    	const click_handler_3 = () => {
    		(openItem("glasses"), openItem("cardHolder"));
    	};

    	const click_handler_4 = () => {
    		(openItem("axe"), openItem("cardHolder"));
    	};

    	const click_handler_5 = () => {
    		(openItem("vest"), openItem("cardHolder"));
    	};

    	const click_handler_6 = () => {
    		(openItem("helmet2"), openItem("cardHolder"));
    	};

    	const click_handler_7 = () => {
    		(openItem("boot"), openItem("cardHolder"));
    	};

    	const click_handler_8 = () => {
    		(openItem("gloves"), openItem("cardHolder"));
    	};

    	const click_handler_9 = () => {
    		(openItem("headphones"), openItem("cardHolder"));
    	};

    	const click_handler_10 = () => {
    		(openItem("desentupidor"), openItem("cardHolder"));
    	};

    	const click_handler_11 = () => changeDialogues$1("dialogue-1", "dialogue-2");

    	const click_handler_12 = () => {
    		(openItem("dialogueContainer"), changeDialogues$1("dialogue-2", "dialogue-3"));
    	};

    	const click_handler_13 = () => {
    		changeDialogues$1("dialogue-3", "dialogue-4");
    	};

    	const click_handler_14 = () => {
    		(openItem("dialogueContainer"), changeDialogues$1("dialogue-4", "dialogue-5"));
    	};

    	const click_handler_15 = () => {
    		(openItem("dialogueContainer"), taskFInished());
    	};

    	const click_handler_16 = () => {
    		(openItem("dialogueContainer"), changeDialogues$1("dialogue-6", "dialogue-5"));
    	};

    	const click_handler_17 = card => {
    		(openItem(card.item), openItem("cardHolder"));
    	};

    	const click_handler_18 = card => {
    		equipItem(card.item, card.img_ref);
    	};

    	$$self.$capture_state = () => ({
    		walk,
    		EpiCard,
    		PlayerEpi,
    		points,
    		equipedItem,
    		equipCont,
    		confirmlock,
    		glove,
    		helmet,
    		glasses,
    		vest,
    		axe,
    		boot,
    		protetor,
    		desentupidor,
    		helmet2,
    		boot2,
    		cards,
    		worker,
    		openItem,
    		equipItem,
    		changeDialogues: changeDialogues$1,
    		taskFInished,
    		backToLobby,
    		$walk
    	});

    	$$self.$inject_state = $$props => {
    		if ('points' in $$props) $$invalidate(0, points = $$props.points);
    		if ('equipedItem' in $$props) $$invalidate(1, equipedItem = $$props.equipedItem);
    		if ('equipCont' in $$props) $$invalidate(2, equipCont = $$props.equipCont);
    		if ('confirmlock' in $$props) confirmlock = $$props.confirmlock;
    		if ('glove' in $$props) glove = $$props.glove;
    		if ('helmet' in $$props) helmet = $$props.helmet;
    		if ('glasses' in $$props) glasses = $$props.glasses;
    		if ('vest' in $$props) vest = $$props.vest;
    		if ('axe' in $$props) axe = $$props.axe;
    		if ('boot' in $$props) boot = $$props.boot;
    		if ('protetor' in $$props) protetor = $$props.protetor;
    		if ('desentupidor' in $$props) desentupidor = $$props.desentupidor;
    		if ('helmet2' in $$props) helmet2 = $$props.helmet2;
    		if ('boot2' in $$props) boot2 = $$props.boot2;
    		if ('cards' in $$props) $$invalidate(4, cards = $$props.cards);
    		if ('worker' in $$props) $$invalidate(3, worker = $$props.worker);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		points,
    		equipedItem,
    		equipCont,
    		worker,
    		cards,
    		equipItem,
    		taskFInished,
    		backToLobby,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11,
    		click_handler_12,
    		click_handler_13,
    		click_handler_14,
    		click_handler_15,
    		click_handler_16,
    		click_handler_17,
    		click_handler_18
    	];
    }

    class EpiTask extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EpiTask",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Tasks/Recebimento.svelte generated by Svelte v3.50.0 */

    const { document: document_1 } = globals;
    const file$4 = "src/Tasks/Recebimento.svelte";

    function create_fragment$4(ctx) {
    	let link;
    	let t0;
    	let div34;
    	let div32;
    	let div5;
    	let div0;
    	let p0;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let t5;
    	let span0;
    	let t7;
    	let span1;
    	let t9;
    	let t10;
    	let p3;
    	let t12;
    	let p4;
    	let t13;
    	let span2;
    	let t15;
    	let t16;
    	let p5;
    	let t18;
    	let p6;
    	let t19;
    	let span3;
    	let t21;
    	let t22;
    	let div4;
    	let div1;
    	let t24;
    	let div2;
    	let t26;
    	let div3;
    	let t28;
    	let div6;
    	let t29;
    	let div31;
    	let div15;
    	let div14;
    	let div7;
    	let h10;
    	let t31;
    	let div8;
    	let h11;
    	let t33;
    	let p7;
    	let t34_value = /*cargaAtual*/ ctx[0].fornecedor + "";
    	let t34;
    	let t35;
    	let div9;
    	let h12;
    	let t37;
    	let p8;
    	let t38_value = /*cargaAtual*/ ctx[0].produto + "";
    	let t38;
    	let t39;
    	let div10;
    	let h13;
    	let t41;
    	let p9;
    	let t42_value = /*cargaAtual*/ ctx[0].caixas + "";
    	let t42;
    	let t43;
    	let div11;
    	let h14;
    	let t45;
    	let p10;
    	let t46_value = /*cargaAtual*/ ctx[0].quantidade + "";
    	let t46;
    	let t47;
    	let div12;
    	let h15;
    	let t49;
    	let p11;
    	let t50_value = /*cargaAtual*/ ctx[0].validade + "";
    	let t50;
    	let t51;
    	let div13;
    	let h16;
    	let t53;
    	let p12;
    	let t54_value = /*cargaAtual*/ ctx[0].lote + "";
    	let t54;
    	let t55;
    	let div30;
    	let div24;
    	let div23;
    	let div16;
    	let h17;
    	let t56_value = /*selectedNote*/ ctx[1].nota + "";
    	let t56;
    	let t57;
    	let div17;
    	let h18;
    	let t59;
    	let p13;
    	let t60_value = /*selectedNote*/ ctx[1].fornecedor + "";
    	let t60;
    	let t61;
    	let div18;
    	let h19;
    	let t63;
    	let p14;
    	let t64_value = /*selectedNote*/ ctx[1].produto + "";
    	let t64;
    	let t65;
    	let div19;
    	let h110;
    	let t67;
    	let p15;
    	let t68_value = /*selectedNote*/ ctx[1].caixas + "";
    	let t68;
    	let t69;
    	let div20;
    	let h111;
    	let t71;
    	let p16;
    	let t72_value = /*selectedNote*/ ctx[1].quantidade + "";
    	let t72;
    	let t73;
    	let div21;
    	let h112;
    	let t75;
    	let p17;
    	let t76_value = /*selectedNote*/ ctx[1].validade + "";
    	let t76;
    	let t77;
    	let div22;
    	let h113;
    	let t79;
    	let p18;
    	let t80_value = /*selectedNote*/ ctx[1].lote + "";
    	let t80;
    	let t81;
    	let div29;
    	let div25;
    	let h114;
    	let t83;
    	let div26;
    	let h115;
    	let t85;
    	let div27;
    	let h116;
    	let t87;
    	let div28;
    	let h117;
    	let t89;
    	let div33;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div34 = element("div");
    			div32 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "O caminhão com a encomenda passou pela verificação de entrada e está\n          prestes a chegar na doca.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Clique na carga para verificar se ela está de acordo com a nota fiscal\n          da encomenda.";
    			t4 = space();
    			p2 = element("p");
    			t5 = text("Selecione umas das notas na direita, caso ela corresponda com a nota\n          atual clique em ");
    			span0 = element("span");
    			span0.textContent = "Aprovar";
    			t7 = text(" caso\n          contrario clique em ");
    			span1 = element("span");
    			span1.textContent = "Trocar";
    			t9 = text(".");
    			t10 = space();
    			p3 = element("p");
    			p3.textContent = "Você precisa selecionar uma nota antes de aprovar.";
    			t12 = space();
    			p4 = element("p");
    			t13 = text("Esta nota não corresponde com a atual selecione outra nota clicando em ");
    			span2 = element("span");
    			span2.textContent = "Trocar";
    			t15 = text(".");
    			t16 = space();
    			p5 = element("p");
    			p5.textContent = "Selecione uma nota antes de clicar em trocar.";
    			t18 = space();
    			p6 = element("p");
    			t19 = text("Nota conferida com ");
    			span3 = element("span");
    			span3.textContent = "sucesso";
    			t21 = text(",\n          Continue verificando as notas.");
    			t22 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div1.textContent = "Trocar";
    			t24 = space();
    			div2 = element("div");
    			div2.textContent = "Aprovar";
    			t26 = space();
    			div3 = element("div");
    			div3.textContent = "Avançar";
    			t28 = space();
    			div6 = element("div");
    			t29 = space();
    			div31 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div7 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Nota atual";
    			t31 = space();
    			div8 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Fornecedor";
    			t33 = space();
    			p7 = element("p");
    			t34 = text(t34_value);
    			t35 = space();
    			div9 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Produto";
    			t37 = space();
    			p8 = element("p");
    			t38 = text(t38_value);
    			t39 = space();
    			div10 = element("div");
    			h13 = element("h1");
    			h13.textContent = "Caixas";
    			t41 = space();
    			p9 = element("p");
    			t42 = text(t42_value);
    			t43 = space();
    			div11 = element("div");
    			h14 = element("h1");
    			h14.textContent = "Quantidade";
    			t45 = space();
    			p10 = element("p");
    			t46 = text(t46_value);
    			t47 = space();
    			div12 = element("div");
    			h15 = element("h1");
    			h15.textContent = "Validade";
    			t49 = space();
    			p11 = element("p");
    			t50 = text(t50_value);
    			t51 = space();
    			div13 = element("div");
    			h16 = element("h1");
    			h16.textContent = "Lote";
    			t53 = space();
    			p12 = element("p");
    			t54 = text(t54_value);
    			t55 = space();
    			div30 = element("div");
    			div24 = element("div");
    			div23 = element("div");
    			div16 = element("div");
    			h17 = element("h1");
    			t56 = text(t56_value);
    			t57 = space();
    			div17 = element("div");
    			h18 = element("h1");
    			h18.textContent = "Fornecedor";
    			t59 = space();
    			p13 = element("p");
    			t60 = text(t60_value);
    			t61 = space();
    			div18 = element("div");
    			h19 = element("h1");
    			h19.textContent = "Produto";
    			t63 = space();
    			p14 = element("p");
    			t64 = text(t64_value);
    			t65 = space();
    			div19 = element("div");
    			h110 = element("h1");
    			h110.textContent = "Caixas";
    			t67 = space();
    			p15 = element("p");
    			t68 = text(t68_value);
    			t69 = space();
    			div20 = element("div");
    			h111 = element("h1");
    			h111.textContent = "Quantidade";
    			t71 = space();
    			p16 = element("p");
    			t72 = text(t72_value);
    			t73 = space();
    			div21 = element("div");
    			h112 = element("h1");
    			h112.textContent = "Validade";
    			t75 = space();
    			p17 = element("p");
    			t76 = text(t76_value);
    			t77 = space();
    			div22 = element("div");
    			h113 = element("h1");
    			h113.textContent = "Lote";
    			t79 = space();
    			p18 = element("p");
    			t80 = text(t80_value);
    			t81 = space();
    			div29 = element("div");
    			div25 = element("div");
    			h114 = element("h1");
    			h114.textContent = "Nota Fiscal 1";
    			t83 = space();
    			div26 = element("div");
    			h115 = element("h1");
    			h115.textContent = "Nota Fiscal 2";
    			t85 = space();
    			div27 = element("div");
    			h116 = element("h1");
    			h116.textContent = "Nota Fiscal 3";
    			t87 = space();
    			div28 = element("div");
    			h117 = element("h1");
    			h117.textContent = "Nota Fiscal 4";
    			t89 = space();
    			div33 = element("div");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/styles/recebimento.css");
    			add_location(link, file$4, 158, 2, 3851);
    			attr_dev(p0, "id", "p1");
    			set_style(p0, "display", "block");
    			add_location(p0, file$4, 165, 8, 4036);
    			attr_dev(p1, "id", "p2");
    			set_style(p1, "display", "none");
    			add_location(p1, file$4, 169, 8, 4207);
    			set_style(span0, "color", "green");
    			add_location(span0, file$4, 175, 26, 4507);
    			set_style(span1, "color", "dodgerblue");
    			add_location(span1, file$4, 176, 30, 4583);
    			attr_dev(p2, "id", "p3");
    			set_style(p2, "display", "none");
    			add_location(p2, file$4, 173, 8, 4368);
    			attr_dev(p3, "id", "p4");
    			set_style(p3, "display", "none");
    			add_location(p3, file$4, 178, 8, 4651);
    			set_style(span2, "color", "dodgerblue");
    			add_location(span2, file$4, 182, 81, 4882);
    			attr_dev(p4, "id", "p5");
    			set_style(p4, "display", "none");
    			add_location(p4, file$4, 181, 8, 4767);
    			attr_dev(p5, "id", "p6");
    			set_style(p5, "display", "none");
    			add_location(p5, file$4, 186, 8, 4973);
    			set_style(span3, "color", "green");
    			add_location(span3, file$4, 190, 29, 5147);
    			attr_dev(p6, "id", "p7");
    			set_style(p6, "display", "none");
    			add_location(p6, file$4, 189, 8, 5084);
    			attr_dev(div0, "id", "dialogueBox");
    			add_location(div0, file$4, 164, 6, 4005);
    			attr_dev(div1, "id", "changeBtn");
    			set_style(div1, "color", "white");
    			set_style(div1, "background", "dodgerblue");
    			set_style(div1, "display", "none");
    			add_location(div1, file$4, 196, 8, 5292);
    			attr_dev(div2, "id", "approveBtn");
    			set_style(div2, "color", "white");
    			set_style(div2, "background", "green");
    			set_style(div2, "display", "none");
    			add_location(div2, file$4, 205, 8, 5504);
    			attr_dev(div3, "id", "skipBtn");
    			add_location(div3, file$4, 214, 8, 5742);
    			attr_dev(div4, "id", "btnArea");
    			add_location(div4, file$4, 195, 6, 5265);
    			attr_dev(div5, "id", "dialogueArea");
    			add_location(div5, file$4, 163, 4, 3975);
    			attr_dev(div6, "id", "carga");
    			set_style(div6, "display", "none");
    			add_location(div6, file$4, 224, 4, 5922);
    			add_location(h10, file$4, 237, 28, 6304);
    			attr_dev(div7, "class", "nfID");
    			add_location(div7, file$4, 237, 10, 6286);
    			add_location(h11, file$4, 239, 12, 6374);
    			add_location(p7, file$4, 240, 12, 6406);
    			attr_dev(div8, "class", "encInfo");
    			add_location(div8, file$4, 238, 10, 6340);
    			add_location(h12, file$4, 243, 12, 6498);
    			add_location(p8, file$4, 244, 12, 6527);
    			attr_dev(div9, "class", "encInfo");
    			add_location(div9, file$4, 242, 10, 6464);
    			add_location(h13, file$4, 247, 12, 6616);
    			add_location(p9, file$4, 248, 12, 6644);
    			attr_dev(div10, "class", "encInfo");
    			add_location(div10, file$4, 246, 10, 6582);
    			add_location(h14, file$4, 251, 12, 6732);
    			add_location(p10, file$4, 252, 12, 6764);
    			attr_dev(div11, "class", "encInfo");
    			add_location(div11, file$4, 250, 10, 6698);
    			add_location(h15, file$4, 255, 12, 6856);
    			add_location(p11, file$4, 256, 12, 6886);
    			attr_dev(div12, "class", "encInfo");
    			add_location(div12, file$4, 254, 10, 6822);
    			add_location(h16, file$4, 259, 12, 6976);
    			add_location(p12, file$4, 260, 12, 7002);
    			attr_dev(div13, "class", "encInfo");
    			add_location(div13, file$4, 258, 10, 6942);
    			attr_dev(div14, "class", "notaEncomenda");
    			add_location(div14, file$4, 236, 8, 6248);
    			attr_dev(div15, "id", "encomendaArea");
    			add_location(div15, file$4, 235, 6, 6215);
    			add_location(h17, file$4, 267, 30, 7254);
    			attr_dev(div16, "class", "nfID");
    			add_location(div16, file$4, 267, 12, 7236);
    			add_location(h18, file$4, 269, 14, 7337);
    			add_location(p13, file$4, 270, 14, 7371);
    			attr_dev(div17, "class", "encInfo");
    			add_location(div17, file$4, 268, 12, 7301);
    			add_location(h19, file$4, 273, 14, 7471);
    			add_location(p14, file$4, 274, 14, 7502);
    			attr_dev(div18, "class", "encInfo");
    			add_location(div18, file$4, 272, 12, 7435);
    			add_location(h110, file$4, 277, 14, 7599);
    			add_location(p15, file$4, 278, 14, 7629);
    			attr_dev(div19, "class", "encInfo");
    			add_location(div19, file$4, 276, 12, 7563);
    			add_location(h111, file$4, 281, 14, 7725);
    			add_location(p16, file$4, 282, 14, 7759);
    			attr_dev(div20, "class", "encInfo");
    			add_location(div20, file$4, 280, 12, 7689);
    			add_location(h112, file$4, 285, 14, 7859);
    			add_location(p17, file$4, 286, 14, 7891);
    			attr_dev(div21, "class", "encInfo");
    			add_location(div21, file$4, 284, 12, 7823);
    			add_location(h113, file$4, 289, 14, 7989);
    			add_location(p18, file$4, 290, 14, 8017);
    			attr_dev(div22, "class", "encInfo");
    			add_location(div22, file$4, 288, 12, 7953);
    			attr_dev(div23, "class", "notaEncomenda");
    			attr_dev(div23, "id", "notaSelecionada");
    			set_style(div23, "display", "none");
    			add_location(div23, file$4, 266, 10, 7153);
    			attr_dev(div24, "id", "teste");
    			set_style(div24, "display", "none");
    			add_location(div24, file$4, 265, 8, 7104);
    			add_location(h114, file$4, 303, 12, 8315);
    			attr_dev(div25, "class", "nf");
    			attr_dev(div25, "id", "nf1");
    			add_location(div25, file$4, 296, 10, 8138);
    			add_location(h115, file$4, 312, 12, 8542);
    			attr_dev(div26, "class", "nf");
    			attr_dev(div26, "id", "nf2");
    			add_location(div26, file$4, 305, 10, 8365);
    			add_location(h116, file$4, 321, 12, 8769);
    			attr_dev(div27, "class", "nf");
    			attr_dev(div27, "id", "nf3");
    			add_location(div27, file$4, 314, 10, 8592);
    			add_location(h117, file$4, 330, 12, 8996);
    			attr_dev(div28, "class", "nf");
    			attr_dev(div28, "id", "nf4");
    			add_location(div28, file$4, 323, 10, 8819);
    			attr_dev(div29, "id", "notasFiscais");
    			add_location(div29, file$4, 295, 8, 8104);
    			attr_dev(div30, "id", "nfArea");
    			add_location(div30, file$4, 264, 6, 7078);
    			attr_dev(div31, "id", "recTask");
    			set_style(div31, "display", "none");
    			add_location(div31, file$4, 234, 4, 6167);
    			attr_dev(div32, "id", "recScreen");
    			add_location(div32, file$4, 162, 2, 3950);
    			attr_dev(div33, "id", "blackScreen");
    			set_style(div33, "display", "none");
    			add_location(div33, file$4, 336, 2, 9086);
    			attr_dev(div34, "id", "recContainer");
    			add_location(div34, file$4, 161, 0, 3924);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div34, anchor);
    			append_dev(div34, div32);
    			append_dev(div32, div5);
    			append_dev(div5, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(div0, t4);
    			append_dev(div0, p2);
    			append_dev(p2, t5);
    			append_dev(p2, span0);
    			append_dev(p2, t7);
    			append_dev(p2, span1);
    			append_dev(p2, t9);
    			append_dev(div0, t10);
    			append_dev(div0, p3);
    			append_dev(div0, t12);
    			append_dev(div0, p4);
    			append_dev(p4, t13);
    			append_dev(p4, span2);
    			append_dev(p4, t15);
    			append_dev(div0, t16);
    			append_dev(div0, p5);
    			append_dev(div0, t18);
    			append_dev(div0, p6);
    			append_dev(p6, t19);
    			append_dev(p6, span3);
    			append_dev(p6, t21);
    			append_dev(div5, t22);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div4, t24);
    			append_dev(div4, div2);
    			append_dev(div4, t26);
    			append_dev(div4, div3);
    			append_dev(div32, t28);
    			append_dev(div32, div6);
    			append_dev(div32, t29);
    			append_dev(div32, div31);
    			append_dev(div31, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div7);
    			append_dev(div7, h10);
    			append_dev(div14, t31);
    			append_dev(div14, div8);
    			append_dev(div8, h11);
    			append_dev(div8, t33);
    			append_dev(div8, p7);
    			append_dev(p7, t34);
    			append_dev(div14, t35);
    			append_dev(div14, div9);
    			append_dev(div9, h12);
    			append_dev(div9, t37);
    			append_dev(div9, p8);
    			append_dev(p8, t38);
    			append_dev(div14, t39);
    			append_dev(div14, div10);
    			append_dev(div10, h13);
    			append_dev(div10, t41);
    			append_dev(div10, p9);
    			append_dev(p9, t42);
    			append_dev(div14, t43);
    			append_dev(div14, div11);
    			append_dev(div11, h14);
    			append_dev(div11, t45);
    			append_dev(div11, p10);
    			append_dev(p10, t46);
    			append_dev(div14, t47);
    			append_dev(div14, div12);
    			append_dev(div12, h15);
    			append_dev(div12, t49);
    			append_dev(div12, p11);
    			append_dev(p11, t50);
    			append_dev(div14, t51);
    			append_dev(div14, div13);
    			append_dev(div13, h16);
    			append_dev(div13, t53);
    			append_dev(div13, p12);
    			append_dev(p12, t54);
    			append_dev(div31, t55);
    			append_dev(div31, div30);
    			append_dev(div30, div24);
    			append_dev(div24, div23);
    			append_dev(div23, div16);
    			append_dev(div16, h17);
    			append_dev(h17, t56);
    			append_dev(div23, t57);
    			append_dev(div23, div17);
    			append_dev(div17, h18);
    			append_dev(div17, t59);
    			append_dev(div17, p13);
    			append_dev(p13, t60);
    			append_dev(div23, t61);
    			append_dev(div23, div18);
    			append_dev(div18, h19);
    			append_dev(div18, t63);
    			append_dev(div18, p14);
    			append_dev(p14, t64);
    			append_dev(div23, t65);
    			append_dev(div23, div19);
    			append_dev(div19, h110);
    			append_dev(div19, t67);
    			append_dev(div19, p15);
    			append_dev(p15, t68);
    			append_dev(div23, t69);
    			append_dev(div23, div20);
    			append_dev(div20, h111);
    			append_dev(div20, t71);
    			append_dev(div20, p16);
    			append_dev(p16, t72);
    			append_dev(div23, t73);
    			append_dev(div23, div21);
    			append_dev(div21, h112);
    			append_dev(div21, t75);
    			append_dev(div21, p17);
    			append_dev(p17, t76);
    			append_dev(div23, t77);
    			append_dev(div23, div22);
    			append_dev(div22, h113);
    			append_dev(div22, t79);
    			append_dev(div22, p18);
    			append_dev(p18, t80);
    			append_dev(div30, t81);
    			append_dev(div30, div29);
    			append_dev(div29, div25);
    			append_dev(div25, h114);
    			append_dev(div29, t83);
    			append_dev(div29, div26);
    			append_dev(div26, h115);
    			append_dev(div29, t85);
    			append_dev(div29, div27);
    			append_dev(div27, h116);
    			append_dev(div29, t87);
    			append_dev(div29, div28);
    			append_dev(div28, h117);
    			append_dev(div34, t89);
    			append_dev(div34, div33);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(div2, "click", /*click_handler_1*/ ctx[7], false, false, false),
    					listen_dev(div3, "click", /*click_handler_2*/ ctx[8], false, false, false),
    					listen_dev(div6, "click", /*click_handler_3*/ ctx[9], false, false, false),
    					listen_dev(div25, "click", /*click_handler_4*/ ctx[10], false, false, false),
    					listen_dev(div26, "click", /*click_handler_5*/ ctx[11], false, false, false),
    					listen_dev(div27, "click", /*click_handler_6*/ ctx[12], false, false, false),
    					listen_dev(div28, "click", /*click_handler_7*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cargaAtual*/ 1 && t34_value !== (t34_value = /*cargaAtual*/ ctx[0].fornecedor + "")) set_data_dev(t34, t34_value);
    			if (dirty & /*cargaAtual*/ 1 && t38_value !== (t38_value = /*cargaAtual*/ ctx[0].produto + "")) set_data_dev(t38, t38_value);
    			if (dirty & /*cargaAtual*/ 1 && t42_value !== (t42_value = /*cargaAtual*/ ctx[0].caixas + "")) set_data_dev(t42, t42_value);
    			if (dirty & /*cargaAtual*/ 1 && t46_value !== (t46_value = /*cargaAtual*/ ctx[0].quantidade + "")) set_data_dev(t46, t46_value);
    			if (dirty & /*cargaAtual*/ 1 && t50_value !== (t50_value = /*cargaAtual*/ ctx[0].validade + "")) set_data_dev(t50, t50_value);
    			if (dirty & /*cargaAtual*/ 1 && t54_value !== (t54_value = /*cargaAtual*/ ctx[0].lote + "")) set_data_dev(t54, t54_value);
    			if (dirty & /*selectedNote*/ 2 && t56_value !== (t56_value = /*selectedNote*/ ctx[1].nota + "")) set_data_dev(t56, t56_value);
    			if (dirty & /*selectedNote*/ 2 && t60_value !== (t60_value = /*selectedNote*/ ctx[1].fornecedor + "")) set_data_dev(t60, t60_value);
    			if (dirty & /*selectedNote*/ 2 && t64_value !== (t64_value = /*selectedNote*/ ctx[1].produto + "")) set_data_dev(t64, t64_value);
    			if (dirty & /*selectedNote*/ 2 && t68_value !== (t68_value = /*selectedNote*/ ctx[1].caixas + "")) set_data_dev(t68, t68_value);
    			if (dirty & /*selectedNote*/ 2 && t72_value !== (t72_value = /*selectedNote*/ ctx[1].quantidade + "")) set_data_dev(t72, t72_value);
    			if (dirty & /*selectedNote*/ 2 && t76_value !== (t76_value = /*selectedNote*/ ctx[1].validade + "")) set_data_dev(t76, t76_value);
    			if (dirty & /*selectedNote*/ 2 && t80_value !== (t80_value = /*selectedNote*/ ctx[1].lote + "")) set_data_dev(t80, t80_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div34);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function changeDialogues(paragraph1, paragraph2) {
    	paragraph1 = document.getElementById(paragraph1);
    	paragraph2 = document.getElementById(paragraph2);

    	if (paragraph1.style.display === "block") {
    		paragraph1.style.display = "none";
    		paragraph2.style.display = "block";
    	}
    }

    function toggleElement(el) {
    	let element = document.getElementById(el);

    	if (element.style.display === "none") {
    		element.style.display = "flex";
    	} else {
    		element.style.display = "none";
    	}
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Recebimento', slots, []);
    	let docaFechada = true;

    	class notaFiscal {
    		constructor(nota, fornecedor, produto, caixas, quantidade, validade, lote) {
    			this.nota = nota;
    			this.fornecedor = fornecedor;
    			this.produto = produto;
    			this.caixas = caixas;
    			this.quantidade = quantidade;
    			this.validade = validade;
    			this.lote = lote;
    		}
    	}

    	let encomenda1 = new notaFiscal("Nota 1", "JP878L", "Produto1", 9, 170, "10/10/2023", "TP457LQ67");
    	let encomenda2 = new notaFiscal("Nota 2", "JP878L", "Produto2", 9, 135, "12/5/2023", "EL1P46S4B");
    	let encomenda3 = new notaFiscal("Nota 3", "JP878L", "Produto3", 9, 100, "1/5/2024", "YR8JK7B4T");
    	let encomenda4 = new notaFiscal("Nota 4", "JP878L", "Produto4", 9, 90, "15/5/2024", "ZQ4W7ERTY");
    	let nf = "";
    	let changeLock = false;
    	let approveLock = false;
    	let progresso = 4;
    	let cargaAtual = encomenda1;
    	let selectedNote = encomenda1;

    	function trocarCenario(el) {
    		let element = document.getElementById(el);
    		let screen = document.getElementById("blackScreen");

    		if (docaFechada) {
    			toggleElement("blackScreen");
    			screen.classList.add("opacityAnimation");

    			setTimeout(
    				() => {
    					element.style.backgroundImage = "url(/images/docaAberta768.png)";

    					setTimeout(
    						() => {
    							toggleElement("blackScreen");
    						},
    						3200
    					);

    					toggleElement("skipBtn");
    					toggleElement("carga");
    					changeDialogues("p1", "p2");
    				},
    				2000
    			);

    			docaFechada = false;
    		}
    	}

    	function selectNote(note) {
    		changeLock = !changeLock;
    		approveLock = !approveLock;

    		if (note === "nota1") {
    			$$invalidate(1, selectedNote = encomenda1);
    			nf = "nf1";
    		} else if (note === "nota2") {
    			$$invalidate(1, selectedNote = encomenda2);
    			nf = "nf2";
    		} else if (note === "nota3") {
    			$$invalidate(1, selectedNote = encomenda3);
    			nf = "nf3";
    		} else if (note = "nota4") {
    			$$invalidate(1, selectedNote = encomenda4);
    			nf = "nf4";
    		}

    		toggleElement("notaSelecionada");
    	}

    	function changeNf() {
    		if (changeLock) {
    			changeDialogues("p5", "p3");
    			changeLock = !changeLock;
    			approveLock = !approveLock;
    			toggleElement("teste");
    			toggleElement("notaSelecionada");
    		} else {
    			changeDialogues("p3", "p6");

    			setTimeout(
    				() => {
    					changeDialogues("p6", "p3");
    				},
    				2500
    			);
    		}
    	}

    	function verificarNota(currentNF, selectedNf) {
    		if (approveLock) {
    			if (currentNF === selectedNf) {
    				approveLock = !approveLock;
    				progresso--;
    				changeLock = !changeLock;
    				toggleElement(nf);
    				toggleElement("notaSelecionada");
    				changeDialogues("p3", "p7");

    				setTimeout(
    					() => {
    						toggleElement("teste");
    						changeDialogues("p7", "p3");
    					},
    					4500
    				);

    				if (progresso === 3) {
    					$$invalidate(0, cargaAtual = encomenda3);
    				} else if (progresso === 2) {
    					$$invalidate(0, cargaAtual = encomenda2);
    				} else if (progresso === 1) {
    					$$invalidate(0, cargaAtual = encomenda4);
    				}
    			} else {
    				changeDialogues("p3", "p5");
    			}
    		} else {
    			changeDialogues("p3", "p4");

    			setTimeout(
    				() => {
    					changeDialogues("p4", "p3");
    				},
    				3000
    			);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Recebimento> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		changeNf();
    	};

    	const click_handler_1 = () => {
    		verificarNota(cargaAtual, selectedNote);
    	};

    	const click_handler_2 = () => {
    		trocarCenario("recScreen");
    	};

    	const click_handler_3 = () => {
    		(toggleElement("recTask"), changeDialogues("p2", "p3"), toggleElement("approveBtn"), toggleElement("changeBtn"));
    	};

    	const click_handler_4 = () => {
    		(selectNote("nota1"), toggleElement("teste"));
    	};

    	const click_handler_5 = () => {
    		(selectNote("nota2"), toggleElement("teste"));
    	};

    	const click_handler_6 = () => {
    		(selectNote("nota3"), toggleElement("teste"));
    	};

    	const click_handler_7 = () => {
    		(selectNote("nota4"), toggleElement("teste"));
    	};

    	$$self.$capture_state = () => ({
    		docaFechada,
    		notaFiscal,
    		encomenda1,
    		encomenda2,
    		encomenda3,
    		encomenda4,
    		nf,
    		changeLock,
    		approveLock,
    		progresso,
    		cargaAtual,
    		selectedNote,
    		trocarCenario,
    		changeDialogues,
    		toggleElement,
    		selectNote,
    		changeNf,
    		verificarNota
    	});

    	$$self.$inject_state = $$props => {
    		if ('docaFechada' in $$props) docaFechada = $$props.docaFechada;
    		if ('encomenda1' in $$props) encomenda1 = $$props.encomenda1;
    		if ('encomenda2' in $$props) encomenda2 = $$props.encomenda2;
    		if ('encomenda3' in $$props) encomenda3 = $$props.encomenda3;
    		if ('encomenda4' in $$props) encomenda4 = $$props.encomenda4;
    		if ('nf' in $$props) nf = $$props.nf;
    		if ('changeLock' in $$props) changeLock = $$props.changeLock;
    		if ('approveLock' in $$props) approveLock = $$props.approveLock;
    		if ('progresso' in $$props) progresso = $$props.progresso;
    		if ('cargaAtual' in $$props) $$invalidate(0, cargaAtual = $$props.cargaAtual);
    		if ('selectedNote' in $$props) $$invalidate(1, selectedNote = $$props.selectedNote);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cargaAtual,
    		selectedNote,
    		trocarCenario,
    		selectNote,
    		changeNf,
    		verificarNota,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7
    	];
    }

    class Recebimento extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Recebimento",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/mapa1/firstMap.svelte generated by Svelte v3.50.0 */

    const { console: console_1 } = globals;
    const file$3 = "src/mapa1/firstMap.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let canvas_1;
    	let t0;
    	let h1;
    	let t1;
    	let t2;
    	let t3;
    	let epitask;
    	let t4;
    	let recebimento;
    	let t5;
    	let telateste;
    	let t6;
    	let telateste1;
    	let t7;
    	let telateste2;
    	let current;
    	epitask = new EpiTask({ $$inline: true });
    	recebimento = new Recebimento({ $$inline: true });
    	telateste = new TelaTeste({ $$inline: true });
    	telateste1 = new TelaTeste1({ $$inline: true });
    	telateste2 = new TelaTeste2({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			canvas_1 = element("canvas");
    			t0 = space();
    			h1 = element("h1");
    			t1 = text("Life: ");
    			t2 = text(/*$life*/ ctx[1]);
    			t3 = space();
    			create_component(epitask.$$.fragment);
    			t4 = space();
    			create_component(recebimento.$$.fragment);
    			t5 = space();
    			create_component(telateste.$$.fragment);
    			t6 = space();
    			create_component(telateste1.$$.fragment);
    			t7 = space();
    			create_component(telateste2.$$.fragment);
    			attr_dev(canvas_1, "class", "svelte-y45x6w");
    			add_location(canvas_1, file$3, 503, 6, 15789);
    			attr_dev(h1, "class", "svelte-y45x6w");
    			add_location(h1, file$3, 504, 6, 15825);
    			attr_dev(div0, "id", "tela1");
    			attr_dev(div0, "class", "svelte-y45x6w");
    			add_location(div0, file$3, 502, 4, 15766);
    			attr_dev(div1, "id", "game");
    			attr_dev(div1, "class", "svelte-y45x6w");
    			add_location(div1, file$3, 501, 2, 15746);
    			attr_dev(main, "class", "svelte-y45x6w");
    			add_location(main, file$3, 500, 0, 15737);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, canvas_1);
    			/*canvas_1_binding*/ ctx[2](canvas_1);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(main, t3);
    			mount_component(epitask, main, null);
    			append_dev(main, t4);
    			mount_component(recebimento, main, null);
    			append_dev(main, t5);
    			mount_component(telateste, main, null);
    			append_dev(main, t6);
    			mount_component(telateste1, main, null);
    			append_dev(main, t7);
    			mount_component(telateste2, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$life*/ 2) set_data_dev(t2, /*$life*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(epitask.$$.fragment, local);
    			transition_in(recebimento.$$.fragment, local);
    			transition_in(telateste.$$.fragment, local);
    			transition_in(telateste1.$$.fragment, local);
    			transition_in(telateste2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(epitask.$$.fragment, local);
    			transition_out(recebimento.$$.fragment, local);
    			transition_out(telateste.$$.fragment, local);
    			transition_out(telateste1.$$.fragment, local);
    			transition_out(telateste2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*canvas_1_binding*/ ctx[2](null);
    			destroy_component(epitask);
    			destroy_component(recebimento);
    			destroy_component(telateste);
    			destroy_component(telateste1);
    			destroy_component(telateste2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $walk;
    	let $collision;
    	let $Task2;
    	let $Task1;
    	let $Task0;
    	let $life;
    	validate_store(walk, 'walk');
    	component_subscribe($$self, walk, $$value => $$invalidate(3, $walk = $$value));
    	validate_store(collision, 'collision');
    	component_subscribe($$self, collision, $$value => $$invalidate(4, $collision = $$value));
    	validate_store(Task2, 'Task2');
    	component_subscribe($$self, Task2, $$value => $$invalidate(5, $Task2 = $$value));
    	validate_store(Task1, 'Task1');
    	component_subscribe($$self, Task1, $$value => $$invalidate(6, $Task1 = $$value));
    	validate_store(Task0, 'Task0');
    	component_subscribe($$self, Task0, $$value => $$invalidate(7, $Task0 = $$value));
    	validate_store(life, 'life');
    	component_subscribe($$self, life, $$value => $$invalidate(1, $life = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FirstMap', slots, []);
    	let canvas;

    	onMount(() => {
    		// declaração da função onMount para poder usar o canvas dentro do SVELTE
    		// declarando o tamanho do canvas na tela
    		$$invalidate(0, canvas.width = 780, canvas);

    		$$invalidate(0, canvas.height = 520, canvas);
    		const c = canvas.getContext("2d"); // constexto 2d do canvas

    		// classe base para a criação das fronteiras de colisão do código
    		class Boundary {
    			constructor({ position }) {
    				this.position = position; // recebe um objeto de posião x e y
    				(this.width = 54); // a largura do objeto de fronteira é a operação de 170% de 32 (que é o tamanho do tiled em pixel)
    				(this.height = 54); // o mesmo para a altura
    			}

    			draw() {
    				// função de desenho
    				c.fillStyle = "rgba(255, 0, 0, 0)";

    				c.fillRect(this.position.x, this.position.y, this.width, this.height);
    			}

    			draw2() {
    				// função de desenho
    				c.fillStyle = "rgba(0, 0, 255, 0)";

    				c.fillRect(this.position.x, this.position.y, this.width, this.height);
    			}
    		}

    		const offset = { x: -1620, y: -250 };

    		// Area de testes  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    		const arrTask0 = [];

    		$Task0.forEach((el, i) => {
    			el.forEach((ment, j) => {
    				if (ment === 1) {
    					arrTask0.push(new Boundary({
    							position: {
    								x: j * 54.4 + offset.x,
    								y: i * 54.4 + offset.y
    							}
    						}));
    				}
    			});
    		});

    		const arrTask1 = [];

    		$Task1.forEach((el, i) => {
    			el.forEach((ment, j) => {
    				if (ment === 1) {
    					arrTask1.push(new Boundary({
    							position: {
    								x: j * 54.4 + offset.x,
    								y: i * 54.4 + offset.y
    							}
    						}));
    				}
    			});
    		});

    		const arrTask2 = [];

    		$Task2.forEach((el, i) => {
    			el.forEach((ment, j) => {
    				if (ment === 1) {
    					arrTask2.push(new Boundary({
    							position: {
    								x: j * 54.4 + offset.x,
    								y: i * 54.4 + offset.y
    							}
    						}));
    				}
    			});
    		});

    		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    		// constante vazia que para guardar a posição dos objetos
    		const arrBoundaries = [];

    		//metodo que percorre o array importado que para cada elemento de elemento cria um novo objeto boundary e coloca dentro do arrBoundaries com sua posição
    		$collision.forEach((element, i) => {
    			element.forEach((row, j) => {
    				if (row === 1) {
    					arrBoundaries.push(new Boundary({
    							position: {
    								x: j * 54.4 + offset.x,
    								y: i * 54.4 + offset.y
    							}
    						}));
    				}
    			});
    		});

    		//declarando as imagens do game
    		const mapa = new Image();

    		mapa.src = "./images/ProjetoMapa1.png";
    		const spriteDown = new Image();
    		spriteDown.src = "./images/redSpriteDOWN.png";
    		const spriteUp = new Image();
    		spriteUp.src = "./images/redSpriteUP.png";
    		const spriteLeft = new Image();
    		spriteLeft.src = "./images/redSpriteLEFT.png";
    		const spriteRight = new Image();
    		spriteRight.src = "./images/redSpriteRIGHT.png";

    		// a imagem do sprite tem 256 px de largura, isso dividido por 4 é igual a 64
    		//teste de para iniciar task
    		let jorge = { rod: false, life: true };

    		// molde que para criar objetos com propriedades de local na tela para poder movimentar alterando esses parametros
    		class SpriteMoviment {
    			constructor({ position, image, frames = { max: 1 }, sprites }) {
    				this.position = position;
    				this.image = image;
    				this.frames = { ...frames, val: 0, elapsed: 0 };

    				this.image.onload = () => {
    					this.width = this.image.width / this.frames.max;
    					this.height = this.image.height;
    				};

    				this.moving = false;
    				this.sprites = sprites;
    			}

    			//metodo que desenha dentro do objeto para facilitar o processo em outros obejtos
    			draw() {
    				c.drawImage(
    					this.image,
    					//cropping
    					this.frames.val * this.width,
    					0,
    					this.image.width / this.frames.max,
    					this.image.height,
    					//position
    					this.position.x,
    					this.position.y,
    					this.image.width / this.frames.max,
    					this.image.height
    				); // inicio do x da imagem
    				// inicio do y da imagem
    				// fim do x
    				// fim do y
    				// inicio do x da imagem
    				// inicio do y da imagem
    				// fim do x
    				// fim do y

    				if (!this.moving) return;

    				if (this.frames.max > 1) {
    					this.frames.elapsed++;
    				}

    				if (this.frames.elapsed % 10 === 0) {
    					if (this.frames.val < this.frames.max - 1) this.frames.val++; else this.frames.val = 0;
    				}
    			}
    		}

    		// Objeto que gera o personagem no mapa
    		const player = new SpriteMoviment({
    				position: {
    					x: canvas.width / 2 - 256 / 4 / 2,
    					y: canvas.height / 2 - 68 / 2
    				},
    				image: spriteDown,
    				frames: { max: 4 },
    				sprites: {
    					up: spriteUp,
    					down: spriteDown,
    					left: spriteLeft,
    					rigth: spriteRight
    				}
    			});

    		// objeto criado a partir da class SpriteMoviment com objetivo de guardar as iformações do eixo x e y da imagem do mapa para poder ser alterado e criar a ilusão de movimento
    		const background = new SpriteMoviment({
    				position: { x: offset.x, y: offset.y },
    				image: mapa
    			});

    		// prototype object criado para setar informações na mesma constante e não ter que criar varias constantes diferentes
    		// tem como objetivo ser alterado quando o keydonw da letra especifica for pressionado, sendo transformado em true
    		const keys = {
    			w: { pressed: false },
    			a: { pressed: false },
    			s: { pressed: false },
    			d: { pressed: false }
    		};

    		// array de objeto que vao ser movimentados, alterando as posições de x e y dos dois ao "mesmo tempo"
    		const movebles = [background, ...arrBoundaries, ...arrTask0, ...arrTask1, ...arrTask2];

    		// função que verifica se o personagem ta no mesmo lugar que as fronteiras
    		function rectungularCollision({ rectung1, rectung2 }) {
    			return rectung1.position.x + rectung1.width - 15 >= rectung2.position.x && rectung1.position.x + 15 <= rectung2.position.x + rectung2.width && rectung1.position.y + 15 <= rectung2.position.y + rectung2.height && rectung1.position.y + rectung1.height >= rectung2.position.y;
    		}

    		// função recursiva que chama a si propria em relação a movimentação da janela do canvas
    		function animate() {
    			window.requestAnimationFrame(animate); // chamada da função dentro da função

    			// desenhando as imagens dentro do canvas em um loop infinito para causar a ilusão de movimento
    			background.draw();

    			player.draw();

    			// forEach que fica passando to todos os objetos dentro de arrBoundary e gerando eles no mapa
    			arrBoundaries.forEach(element => {
    				element.draw();
    			});

    			//objeto que gera as areas de tasks
    			// Task 0
    			arrTask0.forEach(el => {
    				el.draw2();
    			});

    			// Task 1
    			arrTask1.forEach(el => {
    				el.draw2();
    			});

    			// Task 2
    			arrTask2.forEach(el => {
    				el.draw2();
    			});

    			let moving = true;
    			player.moving = false;

    			// consdicionais que caso o parametro for true almenta ou diminue a posição da imagem do mapa
    			if ($walk) {
    				if (keys.w.pressed && lastKey === "w") {
    					player.moving = true;
    					player.image = player.sprites.up;

    					// esse for tem como objetivo prever a colisão entre o personagem e a frotneira quando a tecla é apertada, quando isso acontece ele transforma a varaivel booleana em false e para o movimento
    					for (let i = 0; i < arrBoundaries.length; i++) {
    						const element = arrBoundaries[i];

    						if (rectungularCollision({
    							rectung1: player,
    							rectung2: {
    								...element,
    								position: {
    									x: element.position.x,
    									y: element.position.y + 25
    								}
    							}
    						})) {
    							console.log("colidiu");
    							moving = false;
    							break;
    						}
    					}

    					if (moving) movebles.forEach(element => {
    						element.position.y += 1.7;
    					});
    				} else if (keys.a.pressed && lastKey === "a") {
    					player.moving = true;
    					player.image = player.sprites.left;

    					// esse for tem como objetivo prever a colisão entre o personagem e a frotneira quando a tecla é apertada, quando isso acontece ele transforma a varaivel booleana em false e para o movimento
    					for (let i = 0; i < arrBoundaries.length; i++) {
    						const element = arrBoundaries[i];

    						if (rectungularCollision({
    							rectung1: player,
    							rectung2: {
    								...element,
    								position: {
    									x: element.position.x + 3,
    									y: element.position.y
    								}
    							}
    						})) {
    							console.log("colidiu");
    							moving = false;
    							break;
    						}
    					}

    					if (moving) movebles.forEach(element => {
    						element.position.x += 1.7;
    					});
    				} else if (keys.s.pressed && lastKey === "s") {
    					player.moving = true;
    					player.image = player.sprites.down;

    					// esse for tem como objetivo prever a colisão entre o personagem e a frotneira quando a tecla é apertada, quando isso acontece ele transforma a varaivel booleana em false e para o movimento
    					for (let i = 0; i < arrBoundaries.length; i++) {
    						const element = arrBoundaries[i];

    						if (rectungularCollision({
    							rectung1: player,
    							rectung2: {
    								...element,
    								position: {
    									x: element.position.x,
    									y: element.position.y - 3
    								}
    							}
    						})) {
    							console.log("colidiu");
    							moving = false;
    							break;
    						}
    					}

    					if (moving) movebles.forEach(element => {
    						element.position.y -= 1.7;
    					});
    				} else if (keys.d.pressed && lastKey === "d") {
    					player.moving = true;
    					player.image = player.sprites.rigth;

    					// esse for tem como objetivo prever a colisão entre o personagem e a frotneira quando a tecla é apertada, quando isso acontece ele transforma a varaivel booleana em false e para o movimento
    					for (let i = 0; i < arrBoundaries.length; i++) {
    						const element = arrBoundaries[i];

    						if (rectungularCollision({
    							rectung1: player,
    							rectung2: {
    								...element,
    								position: {
    									x: element.position.x - 3,
    									y: element.position.y
    								}
    							}
    						})) {
    							console.log("colidiu");
    							moving = false;
    							break;
    						}
    					}

    					if (moving) movebles.forEach(element => {
    						element.position.x -= 1.7;
    					});
    				}
    			}

    			// test de iniciação de task
    			if (jorge.rod) {
    				// rtoda vez que aperti espaço transforam jorge.rod em true e quando solto volta a ser false
    				// console.log('basbabsdba')
    				arrTask0.forEach(el => {
    					// esse loop via passar por todas as aeras de tasks e verificar se o player esta dentro
    					if (rectungularCollision({ rectung1: player, rectung2: { ...el } })) {
    						console.log("task 0");
    						epiScreen.style.display = "flex";
    						game.style.display = "none";
    						set_store_value(walk, $walk = false, $walk);
    					}
    				});

    				arrTask1.forEach(el => {
    					// esse loop via passar por todas as aeras de tasks e verificar se o player esta dentro
    					if (rectungularCollision({ rectung1: player, rectung2: { ...el } })) {
    						console.log("task 1");
    						recContainer.style.display = "flex";
    						game.style.display = "none";
    						set_store_value(walk, $walk = false, $walk);
    					}
    				});

    				arrTask2.forEach(el => {
    					// esse loop via passar por todas as aeras de tasks e verificar se o player esta dentro
    					if (rectungularCollision({ rectung1: player, rectung2: { ...el } })) {
    						console.log("task 2");
    						task2.style.display = "flex";
    						game.style.display = "none";
    						set_store_value(walk, $walk = false, $walk);
    					}
    				});
    			}
    		}

    		animate();

    		// variavel criada para comportar uma string com a ultima tecla pressionada, fazendo com que o personagem não fique preso em uma unica direção
    		let lastKey = "";

    		// metodo que analisa os eventos na tela da aplicação
    		// em espeficico as teclas pressionadas (keydown)
    		window.addEventListener("keydown", e => {
    			// console.log(e)
    			switch (e.key.toLocaleLowerCase()) {
    				case " ":
    					jorge.rod = true;
    					jorge.life = true;
    					// console.log(jorge.rod)
    					break;
    				case "w":
    					keys.w.pressed = true;
    					lastKey = "w";
    					break;
    				case "a":
    					keys.a.pressed = true;
    					lastKey = "a";
    					break;
    				case "s":
    					keys.s.pressed = true;
    					lastKey = "s";
    					break;
    				case "d":
    					keys.d.pressed = true;
    					lastKey = "d";
    					break;
    			}
    		});

    		// esse evento faz o contrario do keydown, quando a tecla é solta ele volta a ser false
    		window.addEventListener("keyup", e => {
    			switch (e.key.toLocaleLowerCase()) {
    				case " ":
    					jorge.rod = false;
    					jorge.life = false;
    					// console.log(jorge.rod)
    					break;
    				case "w":
    					keys.w.pressed = false;
    					break;
    				case "a":
    					keys.a.pressed = false;
    					break;
    				case "s":
    					keys.s.pressed = false;
    					break;
    				case "d":
    					keys.d.pressed = false;
    					break;
    			}
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<FirstMap> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(0, canvas);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		collision,
    		TelaTeste,
    		TelaTeste1,
    		TelaTeste2,
    		estado,
    		trocarEstadoDoJogo,
    		Task0,
    		Task1,
    		Task2,
    		life,
    		walk,
    		EpiTask,
    		Recebimento,
    		canvas,
    		$walk,
    		$collision,
    		$Task2,
    		$Task1,
    		$Task0,
    		$life
    	});

    	$$self.$inject_state = $$props => {
    		if ('canvas' in $$props) $$invalidate(0, canvas = $$props.canvas);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [canvas, $life, canvas_1_binding];
    }

    class FirstMap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FirstMap",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/tools/Ranking.svelte generated by Svelte v3.50.0 */
    const file$2 = "src/tools/Ranking.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (30:24) {#if i < 10}
    function create_if_block(ctx) {
    	let td0;
    	let t0_value = /*i*/ ctx[4] + 1 + "º" + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*el*/ ctx[2].Nome + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*el*/ ctx[2].pontos + "";
    	let t4;

    	const block = {
    		c: function create() {
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			attr_dev(td0, "class", "svelte-1culu0c");
    			add_location(td0, file$2, 30, 24, 925);
    			attr_dev(td1, "class", "svelte-1culu0c");
    			add_location(td1, file$2, 31, 24, 973);
    			attr_dev(td2, "class", "svelte-1culu0c");
    			add_location(td2, file$2, 32, 24, 1016);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td0, anchor);
    			append_dev(td0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, td1, anchor);
    			append_dev(td1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, td2, anchor);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*leitor*/ 1 && t2_value !== (t2_value = /*el*/ ctx[2].Nome + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*leitor*/ 1 && t4_value !== (t4_value = /*el*/ ctx[2].pontos + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(td1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(td2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(30:24) {#if i < 10}",
    		ctx
    	});

    	return block;
    }

    // (28:16) {#each leitor as el, i }
    function create_each_block(ctx) {
    	let tr;
    	let t;
    	let if_block = /*i*/ ctx[4] < 10 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			if (if_block) if_block.c();
    			t = space();
    			add_location(tr, file$2, 28, 20, 859);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			if (if_block) if_block.m(tr, null);
    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*i*/ ctx[4] < 10) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(28:16) {#each leitor as el, i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let body;
    	let div2;
    	let div0;
    	let h1;
    	let t1;
    	let div1;
    	let table;
    	let tr;
    	let td0;
    	let t3;
    	let td1;
    	let t5;
    	let td2;
    	let t7;
    	let each_value = /*leitor*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Ranking";
    			t1 = space();
    			div1 = element("div");
    			table = element("table");
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "Colocação";
    			t3 = space();
    			td1 = element("td");
    			td1.textContent = "Nome";
    			t5 = space();
    			td2 = element("td");
    			td2.textContent = "Pontos";
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$2, 19, 28, 559);
    			attr_dev(div0, "class", "titulo svelte-1culu0c");
    			add_location(div0, file$2, 19, 8, 539);
    			attr_dev(td0, "class", "svelte-1culu0c");
    			add_location(td0, file$2, 23, 24, 675);
    			attr_dev(td1, "class", "svelte-1culu0c");
    			add_location(td1, file$2, 24, 24, 718);
    			attr_dev(td2, "class", "svelte-1culu0c");
    			add_location(td2, file$2, 25, 24, 756);
    			add_location(tr, file$2, 22, 20, 646);
    			attr_dev(table, "class", "svelte-1culu0c");
    			add_location(table, file$2, 21, 12, 618);
    			attr_dev(div1, "class", "c svelte-1culu0c");
    			add_location(div1, file$2, 20, 8, 590);
    			attr_dev(div2, "id", "tela");
    			attr_dev(div2, "class", "svelte-1culu0c");
    			add_location(div2, file$2, 18, 4, 515);
    			attr_dev(body, "class", "svelte-1culu0c");
    			add_location(body, file$2, 17, 2, 504);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, table);
    			append_dev(table, tr);
    			append_dev(tr, td0);
    			append_dev(tr, t3);
    			append_dev(tr, td1);
    			append_dev(tr, t5);
    			append_dev(tr, td2);
    			append_dev(table, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*leitor*/ 1) {
    				each_value = /*leitor*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ranking', slots, []);
    	let leitor = [];

    	async function loadRanking() {
    		let resposta = await fetch('http://localhost:8001/ler_banco.php');
    		let texto = await resposta.text();
    		let json = JSON.parse(texto);
    		$$invalidate(0, leitor = json);
    	} // console.log(leitor)

    	onMount(async () => {
    		await loadRanking();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Ranking> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, leitor, loadRanking });

    	$$self.$inject_state = $$props => {
    		if ('leitor' in $$props) $$invalidate(0, leitor = $$props.leitor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [leitor];
    }

    class Ranking extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ranking",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/tools/Menu.svelte generated by Svelte v3.50.0 */

    const file$1 = "src/tools/Menu.svelte";

    function create_fragment$1(ctx) {
    	let link;
    	let t0;
    	let header;
    	let nav;
    	let div1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let h1;
    	let span;
    	let t4;
    	let ul;
    	let img2;
    	let img2_src_value;
    	let t5;
    	let img3;
    	let img3_src_value;
    	let t6;
    	let img4;
    	let img4_src_value;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			header = element("header");
    			nav = element("nav");
    			div1 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t1 = space();
    			img1 = element("img");
    			t2 = space();
    			h1 = element("h1");
    			span = element("span");
    			span.textContent = "LOGISTICA";
    			t4 = space();
    			ul = element("ul");
    			img2 = element("img");
    			t5 = space();
    			img3 = element("img");
    			t6 = space();
    			img4 = element("img");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "./styles/menu.css");
    			add_location(link, file$1, 1, 2, 16);
    			attr_dev(img0, "id", "logo");
    			if (!src_url_equal(img0.src, img0_src_value = "./images/worker.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "trabalhador");
    			add_location(img0, file$1, 31, 10, 945);
    			attr_dev(img1, "id", "att");
    			if (!src_url_equal(img1.src, img1_src_value = "./images/checklist.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Lista de atividades");
    			add_location(img1, file$1, 32, 10, 1016);
    			attr_dev(div0, "id", "icones");
    			add_location(div0, file$1, 30, 8, 917);
    			add_location(span, file$1, 34, 14, 1115);
    			add_location(h1, file$1, 34, 10, 1111);
    			attr_dev(img2, "class", "som");
    			if (!src_url_equal(img2.src, img2_src_value = "./images/ranking.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Placar");
    			add_location(img2, file$1, 36, 10, 1169);
    			attr_dev(img3, "class", "som");
    			if (!src_url_equal(img3.src, img3_src_value = "./images/comoJogar.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Como Jogar");
    			add_location(img3, file$1, 37, 10, 1238);
    			attr_dev(img4, "class", "som");
    			if (!src_url_equal(img4.src, img4_src_value = "./images/sobre.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Sobre");
    			add_location(img4, file$1, 38, 10, 1313);
    			add_location(ul, file$1, 35, 8, 1154);
    			attr_dev(div1, "class", "nav-container");
    			add_location(div1, file$1, 29, 6, 881);
    			add_location(nav, file$1, 28, 4, 869);
    			add_location(header, file$1, 27, 2, 856);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t1);
    			append_dev(div0, img1);
    			append_dev(div1, t2);
    			append_dev(div1, h1);
    			append_dev(h1, span);
    			append_dev(div1, t4);
    			append_dev(div1, ul);
    			append_dev(ul, img2);
    			append_dev(ul, t5);
    			append_dev(ul, img3);
    			append_dev(ul, t6);
    			append_dev(ul, img4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.50.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let link;
    	let t0;
    	let main;
    	let div2;
    	let header;
    	let nav;
    	let div1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let h1;
    	let span;
    	let t4;
    	let ul;
    	let img2;
    	let img2_src_value;
    	let t5;
    	let img3;
    	let img3_src_value;
    	let t6;
    	let img4;
    	let img4_src_value;
    	let t7;
    	let firstmap;
    	let current;
    	firstmap = new FirstMap({ $$inline: true });

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			main = element("main");
    			div2 = element("div");
    			header = element("header");
    			nav = element("nav");
    			div1 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t1 = space();
    			img1 = element("img");
    			t2 = space();
    			h1 = element("h1");
    			span = element("span");
    			span.textContent = "LOGISTICA";
    			t4 = space();
    			ul = element("ul");
    			img2 = element("img");
    			t5 = space();
    			img3 = element("img");
    			t6 = space();
    			img4 = element("img");
    			t7 = space();
    			create_component(firstmap.$$.fragment);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "./styles/global.css");
    			add_location(link, file, 11, 2, 238);
    			attr_dev(img0, "id", "logo");
    			if (!src_url_equal(img0.src, img0_src_value = "./images/worker.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "trabalhador");
    			add_location(img0, file, 20, 12, 433);
    			attr_dev(img1, "id", "att");
    			if (!src_url_equal(img1.src, img1_src_value = "./images/checklist.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Lista de atividades");
    			add_location(img1, file, 21, 12, 507);
    			attr_dev(div0, "id", "icones");
    			add_location(div0, file, 19, 10, 403);
    			add_location(span, file, 27, 14, 664);
    			add_location(h1, file, 27, 10, 660);
    			attr_dev(img2, "class", "som");
    			if (!src_url_equal(img2.src, img2_src_value = "./images/ranking.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Placar");
    			add_location(img2, file, 29, 12, 719);
    			attr_dev(img3, "class", "som");
    			if (!src_url_equal(img3.src, img3_src_value = "./images/comoJogar.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Como Jogar");
    			add_location(img3, file, 30, 12, 791);
    			attr_dev(img4, "class", "som");
    			if (!src_url_equal(img4.src, img4_src_value = "./images/sobre.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Sobre");
    			add_location(img4, file, 31, 12, 869);
    			add_location(ul, file, 28, 10, 702);
    			attr_dev(div1, "class", "nav-container");
    			add_location(div1, file, 18, 8, 365);
    			add_location(nav, file, 17, 6, 351);
    			add_location(header, file, 16, 4, 336);
    			attr_dev(div2, "id", "tela");
    			add_location(div2, file, 15, 2, 316);
    			add_location(main, file, 14, 0, 307);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, header);
    			append_dev(header, nav);
    			append_dev(nav, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t1);
    			append_dev(div0, img1);
    			append_dev(div1, t2);
    			append_dev(div1, h1);
    			append_dev(h1, span);
    			append_dev(div1, t4);
    			append_dev(div1, ul);
    			append_dev(ul, img2);
    			append_dev(ul, t5);
    			append_dev(ul, img3);
    			append_dev(ul, t6);
    			append_dev(ul, img4);
    			append_dev(div2, t7);
    			mount_component(firstmap, div2, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(firstmap.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(firstmap.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(firstmap);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let a = "Beta2.0";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ FirstMap, estado, Ranking, Menu, a });

    	$$self.$inject_state = $$props => {
    		if ('a' in $$props) a = $$props.a;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
