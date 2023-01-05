
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function element(name) {
        return document.createElement(name);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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

    /* src/backup/mapTest.svelte generated by Svelte v3.50.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/backup/mapTest.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let div;
    	let canvas_1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			canvas_1 = element("canvas");
    			attr_dev(canvas_1, "class", "svelte-1yvhqep");
    			add_location(canvas_1, file$2, 427, 8, 16744);
    			attr_dev(div, "id", "desenho");
    			attr_dev(div, "class", "svelte-1yvhqep");
    			add_location(div, file$2, 426, 4, 16717);
    			attr_dev(main, "class", "svelte-1yvhqep");
    			add_location(main, file$2, 425, 0, 16706);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, canvas_1);
    			/*canvas_1_binding*/ ctx[1](canvas_1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*canvas_1_binding*/ ctx[1](null);
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
    	validate_slots('MapTest', slots, []);
    	let canvas; // declarando uma variavel para o canvas

    	const collisionsMap = [
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			4,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			5,
    			4,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			5,
    			5,
    			4,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		]
    	];

    	onMount(() => {
    		// chamando a função onde o canvas vai ser posto
    		$$invalidate(0, canvas.width = 1024, canvas); // tamanho da largura do canvas

    		$$invalidate(0, canvas.height = 720, canvas); // tamanho da altura do canvas
    		const c = canvas.getContext('2d'); // criando uma variavel e chamando o canvas para declarar o contexto 2D
    		let lastKey = '';

    		// Imagens usadas no codigo
    		const imageMap = new Image();

    		imageMap.src = './images/mini-mapa.png';
    		const imageDOWNPlayer = new Image();
    		imageDOWNPlayer.src = './images/redSpriteDOWN.png';
    		const imageUPPlayer = new Image();
    		imageUPPlayer.src = './images/redSpriteUP.png';
    		const imageLEFTPlayer = new Image();
    		imageLEFTPlayer.src = './images/redSpriteLEFT.png';
    		const imageRIGHTPlayer = new Image();
    		imageRIGHTPlayer.src = './images/redSpriteRIGHT.png';

    		// arrays que contem os objetos gerados no mapa
    		const boundariesObjets = [];

    		const tasksObjects = [];

    		// objeto que contem a posiçao do mapa
    		const offset = { x: -635, y: -370 };

    		const life = { base: 100, realTime: 100 };

    		//classes das imagens para gerar os movimentos
    		class Sprite {
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

    			draw() {
    				c.drawImage(this.image, this.frames.val * this.width, 0, this.image.width / this.frames.max, this.image.height, this.position.x, this.position.y, this.image.width / this.frames.max, this.image.height);
    				if (!this.moving) return;

    				if (this.frames.max > 1) {
    					this.frames.elapsed++;
    				}

    				if (this.frames.elapsed % 10 == 0) {
    					if (this.frames.val < this.frames.max - 1) this.frames.val++; else this.frames.val = 0;
    				}
    			}
    		}

    		class Boundary {
    			constructor({ position }) {
    				this.position = position;
    				this.width = 38.4;
    				this.height = 38.4;
    			}

    			draw() {
    				c.fillStyle = 'rgba(255, 0, 0, 0)';
    				c.fillRect(this.position.x, this.position.y, this.width, this.height);
    			}
    		}

    		collisionsMap.forEach((row, i) => {
    			row.forEach((symbol, j) => {
    				if (symbol == 5) {
    					boundariesObjets.push(new Boundary({
    							position: {
    								x: j * 38.4 + offset.x,
    								y: i * 38.4 + offset.y
    							}
    						}));
    				}
    			});
    		});

    		class Tasks {
    			constructor({ position }) {
    				this.position = position;
    				this.width = 38.4;
    				this.height = 38.4;
    				this.contato = false;
    			}

    			draw() {
    				c.fillStyle = 'rgba(0, 255, 0, 0.5)';
    				c.fillRect(this.position.x, this.position.y, this.width, this.height);
    			}
    		}

    		collisionsMap.forEach((jorge, i) => {
    			jorge.forEach((vasco, j) => {
    				if (vasco == 4) {
    					tasksObjects.push(new Tasks({
    							position: {
    								x: j * 38.4 + offset.x,
    								y: i * 38.4 + offset.y
    							}
    						}));
    				}
    			});
    		});

    		// console.log(boundariesObjets)
    		const player = new Sprite({
    				position: {
    					x: canvas.width / 2 - 256 / 4,
    					y: canvas.height / 2 - 256 / 4
    				},
    				image: imageDOWNPlayer,
    				frames: { max: 4 },
    				sprites: {
    					down: imageDOWNPlayer,
    					up: imageUPPlayer,
    					left: imageLEFTPlayer,
    					right: imageRIGHTPlayer
    				}
    			});

    		const background = new Sprite({
    				position: { x: offset.x, y: offset.y },
    				image: imageMap
    			});

    		const keys = {
    			w: { pressed: false },
    			a: { pressed: false },
    			s: { pressed: false },
    			d: { pressed: false },
    			o: { pressed: false }
    		};

    		const movables = [background, ...boundariesObjets, ...tasksObjects];

    		function rectangularCollision({ rectangle1, rectangle2 }) {
    			return rectangle1.position.x + rectangle1.width - 17 >= rectangle2.position.x && rectangle1.position.x + 17 <= rectangle2.position.x + rectangle2.width && rectangle1.position.y + rectangle1.height - 5 >= rectangle2.position.y && rectangle1.position.y + 13 <= rectangle2.position.y + rectangle2.height;
    		}

    		function animate() {
    			window.requestAnimationFrame(animate);
    			background.draw();

    			boundariesObjets.forEach(limitz => {
    				// gerar o array de fronteiras
    				limitz.draw();
    			});

    			tasksObjects.forEach(jorge => {
    				jorge.draw();
    			});

    			player.draw();

    			function taskColid() {
    				for (let i = 0; i < tasksObjects.length; i++) {
    					const jorge = tasksObjects[i];

    					if (rectangularCollision({ rectangle1: player, rectangle2: jorge })) {
    						if (keys.o.pressed) {
    							console.log("deu certo");
    						}

    						life.realTime -= 1;
    						console.log(life.realTime);
    						if (life.realTime <= 0) life.realTime = life.base;
    					}
    				}
    			}

    			let moving = true;
    			player.moving = false;

    			if (keys.w.pressed && lastKey === 'w') {
    				player.moving = true;
    				player.image = player.sprites.up;

    				for (let i = 0; i < boundariesObjets.length; i++) {
    					const limitz = boundariesObjets[i];

    					if (rectangularCollision({
    						rectangle1: player,
    						rectangle2: {
    							...limitz,
    							position: {
    								x: limitz.position.x,
    								y: limitz.position.y + 3
    							}
    						}
    					})) {
    						moving = false;
    						break;
    					}
    				}

    				if (moving) {
    					movables.forEach(movi => {
    						taskColid();
    						movi.position.y += 1.7;
    					});
    				}
    			} else if (keys.s.pressed && lastKey === 's') {
    				player.moving = true;
    				player.image = player.sprites.down;

    				for (let i = 0; i < boundariesObjets.length; i++) {
    					const limitz = boundariesObjets[i];

    					if (rectangularCollision({
    						rectangle1: player,
    						rectangle2: {
    							...limitz,
    							position: {
    								x: limitz.position.x,
    								y: limitz.position.y - 3
    							}
    						}
    					})) {
    						moving = false;
    						break;
    					}
    				}

    				if (moving) {
    					movables.forEach(jorge => {
    						taskColid();
    						jorge.position.y -= 1.7;
    					});
    				}
    			} else if (keys.a.pressed && lastKey === 'a') {
    				player.moving = true;
    				player.image = player.sprites.left;

    				for (let i = 0; i < boundariesObjets.length; i++) {
    					const limitz = boundariesObjets[i];

    					if (rectangularCollision({
    						rectangle1: player,
    						rectangle2: {
    							...limitz,
    							position: {
    								x: limitz.position.x + 3,
    								y: limitz.position.y
    							}
    						}
    					})) {
    						moving = false;
    						break;
    					}
    				}

    				if (moving) {
    					movables.forEach(jorge => {
    						jorge.position.x += 1.7;
    						taskColid();
    					});
    				}
    			} else if (keys.d.pressed && lastKey === 'd') {
    				player.moving = true;
    				player.image = player.sprites.right;

    				for (let i = 0; i < boundariesObjets.length; i++) {
    					const limitz = boundariesObjets[i];

    					if (rectangularCollision({
    						rectangle1: player,
    						rectangle2: {
    							...limitz,
    							position: {
    								x: limitz.position.x - 3,
    								y: limitz.position.y
    							}
    						}
    					})) {
    						moving = false;
    						break;
    					}
    				}

    				if (moving) {
    					movables.forEach(jorge => {
    						jorge.position.x -= 1.7;
    						taskColid();
    					});
    				}
    			}
    		}

    		animate();

    		window.addEventListener('keydown', e => {
    			// essa função faz com que toda vez que a seta para baixo seja apertada chama a arrow function
    			switch (e.key) {
    				case 'w':
    					keys.w.pressed = true;
    					lastKey = 'w';
    					break;
    				case 'a':
    					keys.a.pressed = true;
    					lastKey = 'a';
    					break;
    				case 's':
    					keys.s.pressed = true;
    					lastKey = 's';
    					break;
    				case 'd':
    					keys.d.pressed = true;
    					lastKey = 'd';
    					break;
    				case ' ':
    					keys.o.pressed = true;
    					break;
    			}
    		});

    		window.addEventListener('keyup', e => {
    			switch (e.key) {
    				case 'w':
    					keys.w.pressed = false;
    					break;
    				case 'a':
    					keys.a.pressed = false;
    					break;
    				case 's':
    					keys.s.pressed = false;
    					break;
    				case 'd':
    					keys.d.pressed = false;
    					break;
    				case ' ':
    					keys.o.pressed = false;
    					break;
    			}
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<MapTest> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(0, canvas);
    		});
    	}

    	$$self.$capture_state = () => ({ onMount, canvas, collisionsMap });

    	$$self.$inject_state = $$props => {
    		if ('canvas' in $$props) $$invalidate(0, canvas = $$props.canvas);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [canvas, canvas_1_binding];
    }

    class MapTest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MapTest",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/contents/map.svelte generated by Svelte v3.50.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/contents/map.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let div;
    	let canvas_1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			canvas_1 = element("canvas");
    			attr_dev(canvas_1, "class", "svelte-1yvhqep");
    			add_location(canvas_1, file$1, 384, 8, 15504);
    			attr_dev(div, "id", "desenho");
    			attr_dev(div, "class", "svelte-1yvhqep");
    			add_location(div, file$1, 383, 4, 15477);
    			attr_dev(main, "class", "svelte-1yvhqep");
    			add_location(main, file$1, 382, 0, 15466);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, canvas_1);
    			/*canvas_1_binding*/ ctx[1](canvas_1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*canvas_1_binding*/ ctx[1](null);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Map', slots, []);
    	let canvas; // declarando uma variavel para o canvas

    	const collisionsMap = [
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			5,
    			4,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			5,
    			5,
    			4,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			5,
    			5,
    			5,
    			5,
    			5,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		],
    		[
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0,
    			0
    		]
    	];

    	onMount(() => {
    		// chamando a função onde o canvas vai ser posto
    		$$invalidate(0, canvas.width = 1024, canvas); // tamanho da largura do canvas

    		$$invalidate(0, canvas.height = 720, canvas); // tamanho da altura do canvas
    		const c = canvas.getContext('2d'); // criando uma variavel e chamando o canvas para declarar o contexto 2D
    		let lastKey = '';

    		// Imagens usadas no codigo
    		const imageMap = new Image();

    		imageMap.src = './images/mini-mapa.png';
    		const imageDOWNPlayer = new Image();
    		imageDOWNPlayer.src = './images/redSpriteDOWN.png';
    		const imageUPPlayer = new Image();
    		imageUPPlayer.src = './images/redSpriteUP.png';
    		const imageLEFTPlayer = new Image();
    		imageLEFTPlayer.src = './images/redSpriteLEFT.png';
    		const imageRIGHTPlayer = new Image();
    		imageRIGHTPlayer.src = './images/redSpriteRIGHT.png';

    		// arrays que contem os objetos gerados no mapa
    		const boundariesObjets = [];

    		const tasksObjects = [];

    		// objeto que contem a posiçao do mapa
    		const offset = { x: -635, y: -370 };

    		//classes das imagens para gerar os movimentos
    		class Sprite {
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

    			draw() {
    				c.drawImage(this.image, this.frames.val * this.width, 0, this.image.width / this.frames.max, this.image.height, this.position.x, this.position.y, this.image.width / this.frames.max, this.image.height);
    				if (!this.moving) return;

    				if (this.frames.max > 1) {
    					this.frames.elapsed++;
    				}

    				if (this.frames.elapsed % 10 == 0) {
    					if (this.frames.val < this.frames.max - 1) this.frames.val++; else this.frames.val = 0;
    				}
    			}
    		}

    		class Boundary {
    			constructor({ position }) {
    				this.position = position;
    				this.width = 38.4;
    				this.height = 38.4;
    			}

    			draw() {
    				c.fillStyle = 'rgba(255, 0, 0, 0.2)';
    				c.fillRect(this.position.x, this.position.y, this.width, this.height);
    			}
    		}

    		collisionsMap.forEach((row, i) => {
    			row.forEach((symbol, j) => {
    				if (symbol == 5) {
    					boundariesObjets.push(new Boundary({
    							position: {
    								x: j * 38.4 + offset.x,
    								y: i * 38.4 + offset.y
    							}
    						}));
    				}
    			});
    		});

    		class Tasks {
    			constructor({ position }) {
    				this.position = position;
    				this.width = 38.4;
    				this.height = 38.4;
    			}

    			draw() {
    				c.fillStyle = 'rgba(0, 0, 255, 0.5)';
    				c.fillRect(this.position.x, this.position.y, this.width, this.height);
    			}

    			toVivo() {
    				console.log('to vivo');
    			}
    		}

    		collisionsMap.forEach((jorge, i) => {
    			jorge.forEach((vasco, j) => {
    				if (vasco == 4) {
    					tasksObjects.push(new Tasks({
    							position: {
    								x: j * 38.4 + offset.x,
    								y: i * 38.4 + offset.y
    							}
    						}));
    				}
    			});
    		});

    		// console.log(boundariesObjets)
    		const player = new Sprite({
    				position: {
    					x: canvas.width / 2 - 256 / 4,
    					y: canvas.height / 2 - 256 / 4
    				},
    				image: imageDOWNPlayer,
    				frames: { max: 4 },
    				sprites: {
    					down: imageDOWNPlayer,
    					up: imageUPPlayer,
    					left: imageLEFTPlayer,
    					right: imageRIGHTPlayer
    				}
    			});

    		const background = new Sprite({
    				position: { x: offset.x, y: offset.y },
    				image: imageMap
    			});

    		const keys = {
    			w: { pressed: false },
    			a: { pressed: false },
    			s: { pressed: false },
    			d: { pressed: false }
    		};

    		const movables = [background, ...boundariesObjets, ...tasksObjects];

    		function rectangularCollision({ rectangle1, rectangle2 }) {
    			return rectangle1.position.x + rectangle1.width - 17 >= rectangle2.position.x && rectangle1.position.x + 17 <= rectangle2.position.x + rectangle2.width && rectangle1.position.y + rectangle1.height - 5 >= rectangle2.position.y && rectangle1.position.y + 13 <= rectangle2.position.y + rectangle2.height;
    		}

    		function animate() {
    			window.requestAnimationFrame(animate);
    			background.draw();

    			boundariesObjets.forEach(limitz => {
    				// gerar o array de fronteiras
    				limitz.draw();
    			});

    			tasksObjects.forEach(jorge => {
    				jorge.draw();
    			});

    			player.draw();
    			let moving = true;
    			player.moving = false;

    			if (keys.w.pressed && lastKey === 'w') {
    				player.moving = true;
    				player.image = player.sprites.up;

    				for (let i = 0; i < boundariesObjets.length; i++) {
    					const limitz = boundariesObjets[i];

    					if (rectangularCollision({
    						rectangle1: player,
    						rectangle2: {
    							...limitz,
    							position: {
    								x: limitz.position.x,
    								y: limitz.position.y + 3
    							}
    						}
    					})) {
    						moving = false;
    						break;
    					}
    				}

    				if (moving) {
    					movables.forEach(jorge => {
    						jorge.position.y += 1.7;
    					});
    				}
    			} else if (keys.s.pressed && lastKey === 's') {
    				player.moving = true;
    				player.image = player.sprites.down;

    				for (let i = 0; i < boundariesObjets.length; i++) {
    					const limitz = boundariesObjets[i];

    					if (rectangularCollision({
    						rectangle1: player,
    						rectangle2: {
    							...limitz,
    							position: {
    								x: limitz.position.x,
    								y: limitz.position.y - 3
    							}
    						}
    					})) {
    						moving = false;
    						break;
    					}
    				}

    				if (moving) {
    					movables.forEach(jorge => {
    						jorge.position.y -= 1.7;
    					});
    				}
    			} else if (keys.a.pressed && lastKey === 'a') {
    				player.moving = true;
    				player.image = player.sprites.left;

    				for (let i = 0; i < boundariesObjets.length; i++) {
    					const limitz = boundariesObjets[i];

    					if (rectangularCollision({
    						rectangle1: player,
    						rectangle2: {
    							...limitz,
    							position: {
    								x: limitz.position.x + 3,
    								y: limitz.position.y
    							}
    						}
    					})) {
    						moving = false;
    						break;
    					}
    				}

    				if (moving) {
    					movables.forEach(jorge => {
    						jorge.position.x += 1.7;
    					});
    				}
    			} else if (keys.d.pressed && lastKey === 'd') {
    				player.moving = true;
    				player.image = player.sprites.right;

    				for (let i = 0; i < boundariesObjets.length; i++) {
    					const limitz = boundariesObjets[i];

    					if (rectangularCollision({
    						rectangle1: player,
    						rectangle2: {
    							...limitz,
    							position: {
    								x: limitz.position.x - 3,
    								y: limitz.position.y
    							}
    						}
    					})) {
    						moving = false;
    						break;
    					}
    				}

    				if (moving) {
    					movables.forEach(jorge => {
    						jorge.position.x -= 1.7;
    					});
    				}
    			}
    		}

    		animate();

    		window.addEventListener('keydown', e => {
    			// essa função faz com que toda vez que a seta para baixo seja apertada chama a arrow function
    			switch (e.key) {
    				case 'w':
    					keys.w.pressed = true;
    					lastKey = 'w';
    					break;
    				case 'a':
    					keys.a.pressed = true;
    					lastKey = 'a';
    					break;
    				case 's':
    					keys.s.pressed = true;
    					lastKey = 's';
    					break;
    				case 'd':
    					keys.d.pressed = true;
    					lastKey = 'd';
    					break;
    			}
    		});

    		window.addEventListener('keyup', e => {
    			switch (e.key) {
    				case 'w':
    					keys.w.pressed = false;
    					break;
    				case 'a':
    					keys.a.pressed = false;
    					break;
    				case 's':
    					keys.s.pressed = false;
    					break;
    				case 'd':
    					keys.d.pressed = false;
    					break;
    			}
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(0, canvas);
    		});
    	}

    	$$self.$capture_state = () => ({ onMount, canvas, collisionsMap });

    	$$self.$inject_state = $$props => {
    		if ('canvas' in $$props) $$invalidate(0, canvas = $$props.canvas);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [canvas, canvas_1_binding];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.50.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let maptest;
    	let current;
    	maptest = new MapTest({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(maptest.$$.fragment);
    			add_location(main, file, 5, 0, 109);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(maptest, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(maptest.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(maptest.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(maptest);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ MapTest, Map: Map$1 });
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
