
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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

    // o estado do jogo guarda a informação sobre a tela questamos no momento
    let estado = writable('menu');

    function trocarEstadoDoJogo(novoEstado) {
    	estado.set(novoEstado);
    }

    /* src/tools/Ranking.svelte generated by Svelte v3.50.0 */
    const file$f = "src/tools/Ranking.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (29:24) {#if i < 15}
    function create_if_block$2(ctx) {
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
    			attr_dev(td0, "class", "svelte-1ii4e85");
    			add_location(td0, file$f, 29, 24, 923);
    			attr_dev(td1, "class", "svelte-1ii4e85");
    			add_location(td1, file$f, 30, 24, 971);
    			attr_dev(td2, "class", "svelte-1ii4e85");
    			add_location(td2, file$f, 31, 24, 1014);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(29:24) {#if i < 15}",
    		ctx
    	});

    	return block;
    }

    // (27:16) {#each leitor as el, i }
    function create_each_block$2(ctx) {
    	let tr;
    	let t;
    	let if_block = /*i*/ ctx[4] < 15 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			if (if_block) if_block.c();
    			t = space();
    			add_location(tr, file$f, 27, 20, 857);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			if (if_block) if_block.m(tr, null);
    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*i*/ ctx[4] < 15) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(27:16) {#each leitor as el, i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
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
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
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

    			add_location(h1, file$f, 18, 28, 557);
    			attr_dev(div0, "class", "titulo svelte-1ii4e85");
    			add_location(div0, file$f, 18, 8, 537);
    			attr_dev(td0, "class", "svelte-1ii4e85");
    			add_location(td0, file$f, 22, 24, 673);
    			attr_dev(td1, "class", "svelte-1ii4e85");
    			add_location(td1, file$f, 23, 24, 716);
    			attr_dev(td2, "class", "svelte-1ii4e85");
    			add_location(td2, file$f, 24, 24, 754);
    			add_location(tr, file$f, 21, 20, 644);
    			attr_dev(table, "class", "svelte-1ii4e85");
    			add_location(table, file$f, 20, 12, 616);
    			attr_dev(div1, "class", "c svelte-1ii4e85");
    			add_location(div1, file$f, 19, 8, 588);
    			attr_dev(div2, "id", "telaRanking");
    			attr_dev(div2, "class", "svelte-1ii4e85");
    			add_location(div2, file$f, 17, 4, 506);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
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
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ranking",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    let collisionAlpha = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    let wall = [];

    for(let i = 0; i < collisionAlpha.length; i += 70){
        wall.push(collisionAlpha.slice(i, 70 + i));
    }

    const alphaTask0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const task0 = [];
    for(let i = 0; i < alphaTask0.length; i += 70){
        task0.push(alphaTask0.slice(i, 70 + i));
    }


    const alphaTask1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const task1$1 = [];
    for(let i = 0; i < alphaTask1.length; i += 70){
        task1$1.push(alphaTask1.slice(i, 70 + i));
    }

    const alphaTask2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const task2$1 = [];
    for(let i = 0; i < alphaTask2.length; i += 70){
        task2$1.push(alphaTask2.slice(i, 70 + i));
    }

    const alphaInformation = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const information = [];
    for(let i = 0; i < alphaInformation.length; i += 70){
        information.push(alphaInformation.slice(i, 70 + i));
    }

    const alphaDanger = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const danger = [];
    for(let i = 0; i < alphaDanger.length; i += 70){
        danger.push(alphaDanger.slice(i, 70 + i));
    }

    const collision = writable(wall);
    const Task0 = writable(task0);
    const Task1 = writable(task1$1);
    const Task2 = writable(task2$1);
    const Info = writable(information);
    const Danger = writable(danger);

    const walk = writable(false);

    let life = writable(100);

    const ranking = writable([]);

    const infoTasks0 = writable("INCOMPLETO!");
    const infoTasks1 = writable("INCOMPLETO!");
    const infoTasks2 = writable("INCOMPLETO!");

    const Nome = writable("");
    const totalPoints = writable(0);
    const taskOrder = writable({
        t0: true,
        t1: false,
        t2: false
    });     


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
    const file$e = "src/Tasks/telaTeste.svelte";

    function create_fragment$e(ctx) {
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
    			add_location(h1, file$e, 11, 2, 199);
    			add_location(button, file$e, 12, 2, 217);
    			attr_dev(div, "id", "task0");
    			attr_dev(div, "class", "svelte-u0f1xo");
    			add_location(div, file$e, 10, 0, 180);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TelaTeste",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/Tasks/telaTeste1.svelte generated by Svelte v3.50.0 */
    const file$d = "src/Tasks/telaTeste1.svelte";

    function create_fragment$d(ctx) {
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
    			add_location(h1, file$d, 12, 8, 225);
    			add_location(button, file$d, 13, 8, 249);
    			attr_dev(div, "id", "task1");
    			attr_dev(div, "class", "svelte-1x4bmmt");
    			add_location(div, file$d, 11, 0, 200);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TelaTeste1",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/Tasks/telaTeste2.svelte generated by Svelte v3.50.0 */
    const file$c = "src/Tasks/telaTeste2.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let button0;
    	let t3;
    	let p0;
    	let t4;
    	let t5;
    	let p1;
    	let t6;
    	let t7;
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
    			p0 = element("p");
    			t4 = text(/*$Nome*/ ctx[1]);
    			t5 = space();
    			p1 = element("p");
    			t6 = text(/*$totalPoints*/ ctx[0]);
    			t7 = space();
    			button1 = element("button");
    			button1.textContent = "Teste";
    			add_location(h1, file$c, 31, 8, 621);
    			add_location(button0, file$c, 32, 8, 645);
    			add_location(p0, file$c, 33, 8, 706);
    			add_location(p1, file$c, 34, 8, 729);
    			add_location(button1, file$c, 35, 8, 759);
    			attr_dev(div, "id", "task2");
    			attr_dev(div, "class", "svelte-cs8bcy");
    			add_location(div, file$c, 30, 0, 596);
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
    			append_dev(div, p0);
    			append_dev(p0, t4);
    			append_dev(div, t5);
    			append_dev(div, p1);
    			append_dev(p1, t6);
    			append_dev(div, t7);
    			append_dev(div, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$Nome*/ 2) set_data_dev(t4, /*$Nome*/ ctx[1]);
    			if (dirty & /*$totalPoints*/ 1) set_data_dev(t6, /*$totalPoints*/ ctx[0]);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $ranking;
    	let $totalPoints;
    	let $Nome;
    	let $walk;
    	validate_store(ranking, 'ranking');
    	component_subscribe($$self, ranking, $$value => $$invalidate(7, $ranking = $$value));
    	validate_store(totalPoints, 'totalPoints');
    	component_subscribe($$self, totalPoints, $$value => $$invalidate(0, $totalPoints = $$value));
    	validate_store(Nome, 'Nome');
    	component_subscribe($$self, Nome, $$value => $$invalidate(1, $Nome = $$value));
    	validate_store(walk, 'walk');
    	component_subscribe($$self, walk, $$value => $$invalidate(8, $walk = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TelaTeste2', slots, []);

    	function backToLobby() {
    		game.style.display = "flex";
    		task2.style.display = "none";
    		set_store_value(walk, $walk = true, $walk);
    	}

    	const form = { nome: "", pontos: 0 };

    	const addranking = () => {
    		form.nome = $Nome;
    		form.pontos = $totalPoints;
    		set_store_value(ranking, $ranking = $ranking.concat({ nome: form.nome, pontos: form.pontos }), $ranking);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TelaTeste2> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => backToLobby();
    	const click_handler_1 = () => addranking();

    	$$self.$capture_state = () => ({
    		walk,
    		ranking,
    		Nome,
    		totalPoints,
    		backToLobby,
    		form,
    		addranking,
    		$ranking,
    		$totalPoints,
    		$Nome,
    		$walk
    	});

    	return [$totalPoints, $Nome, backToLobby, addranking, click_handler, click_handler_1];
    }

    class TelaTeste2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TelaTeste2",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/Tasks/Recebimento.svelte generated by Svelte v3.50.0 */

    const { console: console_1$2, document: document_1$1 } = globals;
    const file$b = "src/Tasks/Recebimento.svelte";

    function create_fragment$b(ctx) {
    	let link;
    	let t0;
    	let div35;
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
    	let p7;
    	let t24;
    	let div4;
    	let div1;
    	let t26;
    	let div2;
    	let t28;
    	let div3;
    	let t30;
    	let div6;
    	let t31;
    	let div31;
    	let div15;
    	let div14;
    	let div7;
    	let h10;
    	let t33;
    	let div8;
    	let h11;
    	let t35;
    	let p8;
    	let t36_value = /*cargaAtual*/ ctx[1].fornecedor + "";
    	let t36;
    	let t37;
    	let div9;
    	let h12;
    	let t39;
    	let p9;
    	let t40_value = /*cargaAtual*/ ctx[1].produto + "";
    	let t40;
    	let t41;
    	let div10;
    	let h13;
    	let t43;
    	let p10;
    	let t44_value = /*cargaAtual*/ ctx[1].caixas + "";
    	let t44;
    	let t45;
    	let div11;
    	let h14;
    	let t47;
    	let p11;
    	let t48_value = /*cargaAtual*/ ctx[1].quantidade + "";
    	let t48;
    	let t49;
    	let div12;
    	let h15;
    	let t51;
    	let p12;
    	let t52_value = /*cargaAtual*/ ctx[1].validade + "";
    	let t52;
    	let t53;
    	let div13;
    	let h16;
    	let t55;
    	let p13;
    	let t56_value = /*cargaAtual*/ ctx[1].lote + "";
    	let t56;
    	let t57;
    	let div30;
    	let div24;
    	let div23;
    	let div16;
    	let h17;
    	let t58_value = /*selectedNote*/ ctx[2].nota + "";
    	let t58;
    	let t59;
    	let div17;
    	let h18;
    	let t61;
    	let p14;
    	let t62_value = /*selectedNote*/ ctx[2].lote + "";
    	let t62;
    	let t63;
    	let div18;
    	let h19;
    	let t65;
    	let p15;
    	let t66_value = /*selectedNote*/ ctx[2].fornecedor + "";
    	let t66;
    	let t67;
    	let div19;
    	let h110;
    	let t69;
    	let p16;
    	let t70_value = /*selectedNote*/ ctx[2].produto + "";
    	let t70;
    	let t71;
    	let div20;
    	let h111;
    	let t73;
    	let p17;
    	let t74_value = /*selectedNote*/ ctx[2].validade + "";
    	let t74;
    	let t75;
    	let div21;
    	let h112;
    	let t77;
    	let p18;
    	let t78_value = /*selectedNote*/ ctx[2].quantidade + "";
    	let t78;
    	let t79;
    	let div22;
    	let h113;
    	let t81;
    	let p19;
    	let t82_value = /*selectedNote*/ ctx[2].caixas + "";
    	let t82;
    	let t83;
    	let div29;
    	let div25;
    	let h114;
    	let t85;
    	let div26;
    	let h115;
    	let t87;
    	let div27;
    	let h116;
    	let t89;
    	let div28;
    	let h117;
    	let t91;
    	let div32;
    	let t92;
    	let div34;
    	let h118;
    	let t94;
    	let h2;
    	let t95;
    	let t96;
    	let t97;
    	let div33;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div35 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "O caminhão com a carga passou pela verificação de entrada e está prestes a chegar na doca.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Clique na carga para verificar se ela está de acordo com a nota fiscal da encomenda.";
    			t4 = space();
    			p2 = element("p");
    			t5 = text("Selecione umas das notas na direita, caso ela corresponda com a nota atual clique em ");
    			span0 = element("span");
    			span0.textContent = "Aprovar";
    			t7 = text(" caso contrario clique em ");
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
    			t21 = text(", Continue verificando as notas.");
    			t22 = space();
    			p7 = element("p");
    			p7.textContent = "Todas as notas foram conferidas com sucesso";
    			t24 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div1.textContent = "Trocar";
    			t26 = space();
    			div2 = element("div");
    			div2.textContent = "Aprovar";
    			t28 = space();
    			div3 = element("div");
    			div3.textContent = "Avançar";
    			t30 = space();
    			div6 = element("div");
    			t31 = space();
    			div31 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div7 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Nota atual";
    			t33 = space();
    			div8 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Fornecedor";
    			t35 = space();
    			p8 = element("p");
    			t36 = text(t36_value);
    			t37 = space();
    			div9 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Produto";
    			t39 = space();
    			p9 = element("p");
    			t40 = text(t40_value);
    			t41 = space();
    			div10 = element("div");
    			h13 = element("h1");
    			h13.textContent = "Caixas";
    			t43 = space();
    			p10 = element("p");
    			t44 = text(t44_value);
    			t45 = space();
    			div11 = element("div");
    			h14 = element("h1");
    			h14.textContent = "Quantidade";
    			t47 = space();
    			p11 = element("p");
    			t48 = text(t48_value);
    			t49 = space();
    			div12 = element("div");
    			h15 = element("h1");
    			h15.textContent = "Validade";
    			t51 = space();
    			p12 = element("p");
    			t52 = text(t52_value);
    			t53 = space();
    			div13 = element("div");
    			h16 = element("h1");
    			h16.textContent = "Lote";
    			t55 = space();
    			p13 = element("p");
    			t56 = text(t56_value);
    			t57 = space();
    			div30 = element("div");
    			div24 = element("div");
    			div23 = element("div");
    			div16 = element("div");
    			h17 = element("h1");
    			t58 = text(t58_value);
    			t59 = space();
    			div17 = element("div");
    			h18 = element("h1");
    			h18.textContent = "Lote";
    			t61 = space();
    			p14 = element("p");
    			t62 = text(t62_value);
    			t63 = space();
    			div18 = element("div");
    			h19 = element("h1");
    			h19.textContent = "Fornecedor";
    			t65 = space();
    			p15 = element("p");
    			t66 = text(t66_value);
    			t67 = space();
    			div19 = element("div");
    			h110 = element("h1");
    			h110.textContent = "Produto";
    			t69 = space();
    			p16 = element("p");
    			t70 = text(t70_value);
    			t71 = space();
    			div20 = element("div");
    			h111 = element("h1");
    			h111.textContent = "Validade";
    			t73 = space();
    			p17 = element("p");
    			t74 = text(t74_value);
    			t75 = space();
    			div21 = element("div");
    			h112 = element("h1");
    			h112.textContent = "Quantidade";
    			t77 = space();
    			p18 = element("p");
    			t78 = text(t78_value);
    			t79 = space();
    			div22 = element("div");
    			h113 = element("h1");
    			h113.textContent = "Caixas";
    			t81 = space();
    			p19 = element("p");
    			t82 = text(t82_value);
    			t83 = space();
    			div29 = element("div");
    			div25 = element("div");
    			h114 = element("h1");
    			h114.textContent = "Nota Fiscal 1";
    			t85 = space();
    			div26 = element("div");
    			h115 = element("h1");
    			h115.textContent = "Nota Fiscal 2";
    			t87 = space();
    			div27 = element("div");
    			h116 = element("h1");
    			h116.textContent = "Nota Fiscal 3";
    			t89 = space();
    			div28 = element("div");
    			h117 = element("h1");
    			h117.textContent = "Nota Fiscal 4";
    			t91 = space();
    			div32 = element("div");
    			t92 = space();
    			div34 = element("div");
    			h118 = element("h1");
    			h118.textContent = "Missão concluida";
    			t94 = space();
    			h2 = element("h2");
    			t95 = text("Pontuação Final: ");
    			t96 = text(/*recPoints*/ ctx[0]);
    			t97 = space();
    			div33 = element("div");
    			div33.textContent = "Continuar";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/styles/recebimento.css");
    			add_location(link, file$b, 1, 4, 18);
    			attr_dev(p0, "id", "p1");
    			set_style(p0, "display", "block");
    			add_location(p0, file$b, 8, 12, 194);
    			attr_dev(p1, "id", "p2");
    			set_style(p1, "display", "none");
    			add_location(p1, file$b, 11, 12, 365);
    			set_style(span0, "color", "green");
    			add_location(span0, file$b, 15, 101, 665);
    			set_style(span1, "color", "dodgerblue");
    			add_location(span1, file$b, 15, 167, 731);
    			attr_dev(p2, "id", "p3");
    			set_style(p2, "display", "none");
    			add_location(p2, file$b, 14, 12, 530);
    			attr_dev(p3, "id", "p4");
    			set_style(p3, "display", "none");
    			add_location(p3, file$b, 17, 12, 807);
    			set_style(span2, "color", "dodgerblue");
    			add_location(span2, file$b, 21, 87, 1058);
    			attr_dev(p4, "id", "p5");
    			set_style(p4, "display", "none");
    			add_location(p4, file$b, 20, 12, 937);
    			attr_dev(p5, "id", "p6");
    			set_style(p5, "display", "none");
    			add_location(p5, file$b, 23, 12, 1134);
    			set_style(span3, "color", "green");
    			add_location(span3, file$b, 27, 35, 1328);
    			attr_dev(p6, "id", "p7");
    			set_style(p6, "display", "none");
    			add_location(p6, file$b, 26, 12, 1259);
    			attr_dev(p7, "id", "p8");
    			set_style(p7, "display", "none");
    			add_location(p7, file$b, 29, 12, 1432);
    			attr_dev(div0, "id", "dialogueBox");
    			add_location(div0, file$b, 7, 8, 159);
    			attr_dev(div1, "id", "changeBtn");
    			set_style(div1, "color", "white");
    			set_style(div1, "background", "dodgerblue");
    			set_style(div1, "display", "none");
    			add_location(div1, file$b, 34, 12, 1577);
    			attr_dev(div2, "id", "approveBtn");
    			set_style(div2, "color", "white");
    			set_style(div2, "background", "green");
    			set_style(div2, "display", "none");
    			add_location(div2, file$b, 35, 12, 1707);
    			attr_dev(div3, "id", "skipBtn");
    			add_location(div3, file$b, 36, 12, 1931);
    			attr_dev(div4, "id", "btnArea");
    			add_location(div4, file$b, 33, 8, 1546);
    			attr_dev(div5, "id", "dialogueArea");
    			add_location(div5, file$b, 6, 4, 115);
    			attr_dev(div6, "id", "carga");
    			set_style(div6, "display", "none");
    			add_location(div6, file$b, 39, 4, 2129);
    			add_location(h10, file$b, 43, 34, 2571);
    			attr_dev(div7, "class", "nfID");
    			add_location(div7, file$b, 43, 16, 2553);
    			add_location(h11, file$b, 45, 20, 2655);
    			add_location(p8, file$b, 46, 20, 2695);
    			attr_dev(div8, "class", "encInfo");
    			add_location(div8, file$b, 44, 16, 2613);
    			add_location(h12, file$b, 49, 20, 2807);
    			add_location(p9, file$b, 50, 20, 2844);
    			attr_dev(div9, "class", "encInfo");
    			add_location(div9, file$b, 48, 16, 2765);
    			add_location(h13, file$b, 53, 20, 2953);
    			add_location(p10, file$b, 54, 20, 2989);
    			attr_dev(div10, "class", "encInfo");
    			add_location(div10, file$b, 52, 16, 2911);
    			add_location(h14, file$b, 57, 20, 3097);
    			add_location(p11, file$b, 58, 20, 3137);
    			attr_dev(div11, "class", "encInfo");
    			add_location(div11, file$b, 56, 16, 3055);
    			add_location(h15, file$b, 61, 20, 3249);
    			add_location(p12, file$b, 62, 20, 3287);
    			attr_dev(div12, "class", "encInfo");
    			add_location(div12, file$b, 60, 16, 3207);
    			add_location(h16, file$b, 65, 20, 3397);
    			add_location(p13, file$b, 66, 20, 3431);
    			attr_dev(div13, "class", "encInfo");
    			add_location(div13, file$b, 64, 16, 3355);
    			attr_dev(div14, "class", "notaEncomenda");
    			add_location(div14, file$b, 42, 12, 2509);
    			attr_dev(div15, "id", "encomendaArea");
    			add_location(div15, file$b, 41, 8, 2472);
    			add_location(h17, file$b, 74, 38, 3728);
    			attr_dev(div16, "class", "nfID");
    			add_location(div16, file$b, 74, 20, 3710);
    			add_location(h18, file$b, 76, 24, 3829);
    			add_location(p14, file$b, 77, 24, 3867);
    			attr_dev(div17, "class", "encInfo");
    			add_location(div17, file$b, 75, 20, 3783);
    			add_location(h19, file$b, 80, 24, 3987);
    			add_location(p15, file$b, 81, 24, 4031);
    			attr_dev(div18, "class", "encInfo");
    			add_location(div18, file$b, 79, 20, 3941);
    			add_location(h110, file$b, 84, 24, 4157);
    			add_location(p16, file$b, 85, 24, 4198);
    			attr_dev(div19, "class", "encInfo");
    			add_location(div19, file$b, 83, 20, 4111);
    			add_location(h111, file$b, 88, 24, 4321);
    			add_location(p17, file$b, 89, 24, 4363);
    			attr_dev(div20, "class", "encInfo");
    			add_location(div20, file$b, 87, 20, 4275);
    			add_location(h112, file$b, 92, 24, 4487);
    			add_location(p18, file$b, 93, 24, 4531);
    			attr_dev(div21, "class", "encInfo");
    			add_location(div21, file$b, 91, 20, 4441);
    			add_location(h113, file$b, 96, 24, 4657);
    			add_location(p19, file$b, 97, 24, 4697);
    			attr_dev(div22, "class", "encInfo");
    			add_location(div22, file$b, 95, 20, 4611);
    			attr_dev(div23, "class", "notaEncomenda");
    			attr_dev(div23, "id", "notaSelecionada");
    			set_style(div23, "display", "none");
    			add_location(div23, file$b, 73, 16, 3619);
    			attr_dev(div24, "id", "teste");
    			set_style(div24, "display", "none");
    			add_location(div24, file$b, 72, 12, 3564);
    			add_location(h114, file$b, 103, 101, 4933);
    			attr_dev(div25, "class", "nf");
    			attr_dev(div25, "id", "nf1");
    			add_location(div25, file$b, 103, 16, 4848);
    			add_location(h115, file$b, 104, 101, 5063);
    			attr_dev(div26, "class", "nf");
    			attr_dev(div26, "id", "nf2");
    			add_location(div26, file$b, 104, 16, 4978);
    			add_location(h116, file$b, 105, 101, 5193);
    			attr_dev(div27, "class", "nf");
    			attr_dev(div27, "id", "nf3");
    			add_location(div27, file$b, 105, 16, 5108);
    			add_location(h117, file$b, 106, 101, 5323);
    			attr_dev(div28, "class", "nf");
    			attr_dev(div28, "id", "nf4");
    			add_location(div28, file$b, 106, 16, 5238);
    			attr_dev(div29, "id", "notasFiscais");
    			add_location(div29, file$b, 102, 12, 4808);
    			attr_dev(div30, "id", "nfArea");
    			add_location(div30, file$b, 70, 8, 3521);
    			attr_dev(div31, "id", "recTask");
    			set_style(div31, "display", "none");
    			add_location(div31, file$b, 40, 4, 2422);
    			attr_dev(div32, "id", "blackScreen");
    			set_style(div32, "display", "none");
    			add_location(div32, file$b, 111, 4, 5406);
    			add_location(h118, file$b, 113, 8, 5513);
    			add_location(h2, file$b, 114, 8, 5547);
    			attr_dev(div33, "id", "backToLobby");
    			add_location(div33, file$b, 115, 8, 5593);
    			attr_dev(div34, "id", "endScreen");
    			set_style(div34, "display", "none");
    			add_location(div34, file$b, 112, 4, 5462);
    			attr_dev(div35, "id", "recScreen");
    			add_location(div35, file$b, 5, 0, 90);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1$1.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div35, anchor);
    			append_dev(div35, div5);
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
    			append_dev(div0, t22);
    			append_dev(div0, p7);
    			append_dev(div5, t24);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div4, t26);
    			append_dev(div4, div2);
    			append_dev(div4, t28);
    			append_dev(div4, div3);
    			append_dev(div35, t30);
    			append_dev(div35, div6);
    			append_dev(div35, t31);
    			append_dev(div35, div31);
    			append_dev(div31, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div7);
    			append_dev(div7, h10);
    			append_dev(div14, t33);
    			append_dev(div14, div8);
    			append_dev(div8, h11);
    			append_dev(div8, t35);
    			append_dev(div8, p8);
    			append_dev(p8, t36);
    			append_dev(div14, t37);
    			append_dev(div14, div9);
    			append_dev(div9, h12);
    			append_dev(div9, t39);
    			append_dev(div9, p9);
    			append_dev(p9, t40);
    			append_dev(div14, t41);
    			append_dev(div14, div10);
    			append_dev(div10, h13);
    			append_dev(div10, t43);
    			append_dev(div10, p10);
    			append_dev(p10, t44);
    			append_dev(div14, t45);
    			append_dev(div14, div11);
    			append_dev(div11, h14);
    			append_dev(div11, t47);
    			append_dev(div11, p11);
    			append_dev(p11, t48);
    			append_dev(div14, t49);
    			append_dev(div14, div12);
    			append_dev(div12, h15);
    			append_dev(div12, t51);
    			append_dev(div12, p12);
    			append_dev(p12, t52);
    			append_dev(div14, t53);
    			append_dev(div14, div13);
    			append_dev(div13, h16);
    			append_dev(div13, t55);
    			append_dev(div13, p13);
    			append_dev(p13, t56);
    			append_dev(div31, t57);
    			append_dev(div31, div30);
    			append_dev(div30, div24);
    			append_dev(div24, div23);
    			append_dev(div23, div16);
    			append_dev(div16, h17);
    			append_dev(h17, t58);
    			append_dev(div23, t59);
    			append_dev(div23, div17);
    			append_dev(div17, h18);
    			append_dev(div17, t61);
    			append_dev(div17, p14);
    			append_dev(p14, t62);
    			append_dev(div23, t63);
    			append_dev(div23, div18);
    			append_dev(div18, h19);
    			append_dev(div18, t65);
    			append_dev(div18, p15);
    			append_dev(p15, t66);
    			append_dev(div23, t67);
    			append_dev(div23, div19);
    			append_dev(div19, h110);
    			append_dev(div19, t69);
    			append_dev(div19, p16);
    			append_dev(p16, t70);
    			append_dev(div23, t71);
    			append_dev(div23, div20);
    			append_dev(div20, h111);
    			append_dev(div20, t73);
    			append_dev(div20, p17);
    			append_dev(p17, t74);
    			append_dev(div23, t75);
    			append_dev(div23, div21);
    			append_dev(div21, h112);
    			append_dev(div21, t77);
    			append_dev(div21, p18);
    			append_dev(p18, t78);
    			append_dev(div23, t79);
    			append_dev(div23, div22);
    			append_dev(div22, h113);
    			append_dev(div22, t81);
    			append_dev(div22, p19);
    			append_dev(p19, t82);
    			append_dev(div30, t83);
    			append_dev(div30, div29);
    			append_dev(div29, div25);
    			append_dev(div25, h114);
    			append_dev(div29, t85);
    			append_dev(div29, div26);
    			append_dev(div26, h115);
    			append_dev(div29, t87);
    			append_dev(div29, div27);
    			append_dev(div27, h116);
    			append_dev(div29, t89);
    			append_dev(div29, div28);
    			append_dev(div28, h117);
    			append_dev(div35, t91);
    			append_dev(div35, div32);
    			append_dev(div35, t92);
    			append_dev(div35, div34);
    			append_dev(div34, h118);
    			append_dev(div34, t94);
    			append_dev(div34, h2);
    			append_dev(h2, t95);
    			append_dev(h2, t96);
    			append_dev(div34, t97);
    			append_dev(div34, div33);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(div2, "click", /*click_handler_1*/ ctx[8], false, false, false),
    					listen_dev(div3, "click", /*click_handler_2*/ ctx[9], false, false, false),
    					listen_dev(div6, "click", /*click_handler_3*/ ctx[10], false, false, false),
    					listen_dev(div25, "click", /*click_handler_4*/ ctx[11], false, false, false),
    					listen_dev(div26, "click", /*click_handler_5*/ ctx[12], false, false, false),
    					listen_dev(div27, "click", /*click_handler_6*/ ctx[13], false, false, false),
    					listen_dev(div28, "click", /*click_handler_7*/ ctx[14], false, false, false),
    					listen_dev(div33, "click", /*click_handler_8*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cargaAtual*/ 2 && t36_value !== (t36_value = /*cargaAtual*/ ctx[1].fornecedor + "")) set_data_dev(t36, t36_value);
    			if (dirty & /*cargaAtual*/ 2 && t40_value !== (t40_value = /*cargaAtual*/ ctx[1].produto + "")) set_data_dev(t40, t40_value);
    			if (dirty & /*cargaAtual*/ 2 && t44_value !== (t44_value = /*cargaAtual*/ ctx[1].caixas + "")) set_data_dev(t44, t44_value);
    			if (dirty & /*cargaAtual*/ 2 && t48_value !== (t48_value = /*cargaAtual*/ ctx[1].quantidade + "")) set_data_dev(t48, t48_value);
    			if (dirty & /*cargaAtual*/ 2 && t52_value !== (t52_value = /*cargaAtual*/ ctx[1].validade + "")) set_data_dev(t52, t52_value);
    			if (dirty & /*cargaAtual*/ 2 && t56_value !== (t56_value = /*cargaAtual*/ ctx[1].lote + "")) set_data_dev(t56, t56_value);
    			if (dirty & /*selectedNote*/ 4 && t58_value !== (t58_value = /*selectedNote*/ ctx[2].nota + "")) set_data_dev(t58, t58_value);
    			if (dirty & /*selectedNote*/ 4 && t62_value !== (t62_value = /*selectedNote*/ ctx[2].lote + "")) set_data_dev(t62, t62_value);
    			if (dirty & /*selectedNote*/ 4 && t66_value !== (t66_value = /*selectedNote*/ ctx[2].fornecedor + "")) set_data_dev(t66, t66_value);
    			if (dirty & /*selectedNote*/ 4 && t70_value !== (t70_value = /*selectedNote*/ ctx[2].produto + "")) set_data_dev(t70, t70_value);
    			if (dirty & /*selectedNote*/ 4 && t74_value !== (t74_value = /*selectedNote*/ ctx[2].validade + "")) set_data_dev(t74, t74_value);
    			if (dirty & /*selectedNote*/ 4 && t78_value !== (t78_value = /*selectedNote*/ ctx[2].quantidade + "")) set_data_dev(t78, t78_value);
    			if (dirty & /*selectedNote*/ 4 && t82_value !== (t82_value = /*selectedNote*/ ctx[2].caixas + "")) set_data_dev(t82, t82_value);
    			if (dirty & /*recPoints*/ 1) set_data_dev(t96, /*recPoints*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div35);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function trocarCenario(el) {
    	// Função Que Troca o Cenário do Jogo.
    	let element = document.getElementById(el); // Define o Elemento a Ser Alterado.

    	let screen = document.getElementById("blackScreen"); // Tela Para Transição do Cenário.
    	toggleElement("blackScreen"); // Deixado Visivel a Tela Preta de Transição.
    	screen.classList.add("opacityAnimation"); // Adicionando Classe Com Animação de Opacidade na Tela Preta.

    	setTimeout(
    		() => {
    			element.style.backgroundImage = "url(/images/docaAberta768.png)"; // Trocando a Imagem de Fundo.

    			setTimeout(
    				() => {
    					toggleElement("blackScreen"); // Removendo a Visibilidade da Tela Preta.
    				},
    				3200
    			);

    			toggleElement("skipBtn"); // Removendo a Visibilidade do Botão de Avançar.
    			toggleElement("carga"); // Deixando a visivel o Elemento Clicavel Para Iniciar a Conferir.
    			changeDialogues$1("p1", "p2"); // Trocando do Dialogo 1 para o 2
    		},
    		2000
    	);
    }

    function changeDialogues$1(paragraph1, paragraph2) {
    	// Função Que Troca Os Dialogos do Jogo.
    	paragraph1 = document.getElementById(paragraph1); // Definindo Dialogo 1

    	paragraph2 = document.getElementById(paragraph2); // Definindo Dialogo 2

    	if (paragraph1.style.display === "block") {
    		// Se Dialogo 1 Está Visivel...
    		paragraph1.style.display = "none"; // Remover Visibilidade do Dialogo 1

    		paragraph2.style.display = "block"; // Deixar Visivel o Dialogo 2
    	}
    }

    function toggleElement(el) {
    	// Funcão Que Altera o Display Dos Elementos Para Desaparecer e Ficar Visiveis
    	let element = document.getElementById(el);

    	if (element.style.display === "none") {
    		element.style.display = "flex";
    	} else {
    		element.style.display = "none";
    	}
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $taskOrder;
    	let $infoTasks1;
    	let $walk;
    	let $totalPoints;
    	validate_store(taskOrder, 'taskOrder');
    	component_subscribe($$self, taskOrder, $$value => $$invalidate(20, $taskOrder = $$value));
    	validate_store(infoTasks1, 'infoTasks1');
    	component_subscribe($$self, infoTasks1, $$value => $$invalidate(21, $infoTasks1 = $$value));
    	validate_store(walk, 'walk');
    	component_subscribe($$self, walk, $$value => $$invalidate(22, $walk = $$value));
    	validate_store(totalPoints, 'totalPoints');
    	component_subscribe($$self, totalPoints, $$value => $$invalidate(23, $totalPoints = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Recebimento', slots, []);

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
    	let recPoints = 0;
    	let changeLock = false; // Variavel Que Bloqueia a Função de Trocar Nota.
    	let approveLock = false; // Variavel Que Bloqueia a Função de Aprovar Nota.
    	let progresso = 4; // Variavel Com a Quantidade Restante de Notas.
    	let cargaAtual = encomenda1; // Variavel com a Carga atual
    	let selectedNote = encomenda1; // Variavel Que Recebe a Carga Selecionada. 
    	let nf = ""; // Recebe ID do Elemento clicado na Seleção da Nota.

    	function selectNote(note) {
    		// Função Que Seleciona a Nota Fiscal Que Vai Ser Verificada.
    		changeLock = !changeLock; // Desbloqueia a Função do Botão de Trocar Nota.

    		approveLock = !approveLock; // Desbloqueia a Função do Botão de Aprovar Nota.

    		if (note === "nota1") {
    			$$invalidate(2, selectedNote = encomenda1);
    			nf = "nf1";
    		} else if (note === "nota2") {
    			$$invalidate(2, selectedNote = encomenda2);
    			nf = "nf2";
    		} else if (note === "nota3") {
    			$$invalidate(2, selectedNote = encomenda3);
    			nf = "nf3";
    		} else if (note = "nota4") {
    			$$invalidate(2, selectedNote = encomenda4);
    			nf = "nf4";
    		}

    		toggleElement("notaSelecionada");
    		console.log(selectedNote);
    	}

    	function changeNf() {
    		if (changeLock) {
    			changeDialogues$1("p5", "p3");
    			changeLock = !changeLock;
    			approveLock = !approveLock;
    			toggleElement("teste");
    			toggleElement("notaSelecionada");
    		} else {
    			changeDialogues$1("p3", "p6");

    			setTimeout(
    				() => {
    					changeDialogues$1("p6", "p3");
    				},
    				2500
    			);
    		}
    	}

    	function verificarNota(currentNF, selectedNf) {
    		// Função Que Verifica a Nota Atual Com a Nota Selecionada.
    		if (approveLock) {
    			// Verifica a Nota Apenas Quando a Existe Uma Nota Selecionada.
    			if (currentNF === selectedNf) {
    				console.log("certa");
    				changeLock = !changeLock;
    				progresso--;
    				approveLock = !approveLock;
    				$$invalidate(0, recPoints += 100);

    				if (progresso == 0) {
    					changeDialogues$1("p3", "p8");
    					toggleElement("recTask");
    					toggleElement("approveBtn");
    					toggleElement("changeBtn");

    					setTimeout(
    						() => {
    							toggleElement("endScreen");
    						},
    						2000
    					);
    				} else {
    					changeDialogues$1("p3", "p7");

    					setTimeout(
    						() => {
    							changeDialogues$1("p7", "p3");
    							toggleElement("teste");
    						},
    						2500
    					);
    				}

    				toggleElement("notaSelecionada");
    				toggleElement(nf); // Remove a Visibilidade da Nota Aprovada

    				if (progresso === 3) {
    					$$invalidate(1, cargaAtual = encomenda3); // Altera a Carga Que Vai Ser Verificada.
    				} else if (progresso === 2) {
    					$$invalidate(1, cargaAtual = encomenda2); // Altera a Carga Que Vai Ser Verificada.
    				} else if (progresso === 1) {
    					$$invalidate(1, cargaAtual = encomenda4); // Altera a Carga Que Vai Ser Verificada.
    				}
    			} else {
    				changeDialogues$1("p3", "p5");
    				$$invalidate(0, recPoints -= 19);
    			}
    		} else {
    			// Alerta Que Não Possui Nota selecionada 
    			changeDialogues$1("p3", "p4");

    			setTimeout(
    				() => {
    					changeDialogues$1("p4", "p3");
    				},
    				3000
    			);
    		}
    	}

    	function backToLobbyRec() {
    		console.log("backToLobbyRec");
    		set_store_value(totalPoints, $totalPoints += recPoints, $totalPoints);
    		set_store_value(walk, $walk = true, $walk);
    		game.style.display = "flex";
    		recScreen.style.display = "none";
    		set_store_value(infoTasks1, $infoTasks1 = "COMPLETO!", $infoTasks1);
    		set_store_value(taskOrder, $taskOrder.t1 = false, $taskOrder);
    		set_store_value(taskOrder, $taskOrder.t2 = true, $taskOrder);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Recebimento> was created with unknown prop '${key}'`);
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
    		(toggleElement("recTask"), changeDialogues$1("p2", "p3"), toggleElement("approveBtn"), toggleElement("changeBtn"));
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

    	const click_handler_8 = () => backToLobbyRec();

    	$$self.$capture_state = () => ({
    		infoTasks1,
    		taskOrder,
    		totalPoints,
    		walk,
    		notaFiscal,
    		encomenda1,
    		encomenda2,
    		encomenda3,
    		encomenda4,
    		recPoints,
    		changeLock,
    		approveLock,
    		progresso,
    		cargaAtual,
    		selectedNote,
    		nf,
    		trocarCenario,
    		changeDialogues: changeDialogues$1,
    		toggleElement,
    		selectNote,
    		changeNf,
    		verificarNota,
    		backToLobbyRec,
    		$taskOrder,
    		$infoTasks1,
    		$walk,
    		$totalPoints
    	});

    	$$self.$inject_state = $$props => {
    		if ('encomenda1' in $$props) encomenda1 = $$props.encomenda1;
    		if ('encomenda2' in $$props) encomenda2 = $$props.encomenda2;
    		if ('encomenda3' in $$props) encomenda3 = $$props.encomenda3;
    		if ('encomenda4' in $$props) encomenda4 = $$props.encomenda4;
    		if ('recPoints' in $$props) $$invalidate(0, recPoints = $$props.recPoints);
    		if ('changeLock' in $$props) changeLock = $$props.changeLock;
    		if ('approveLock' in $$props) approveLock = $$props.approveLock;
    		if ('progresso' in $$props) progresso = $$props.progresso;
    		if ('cargaAtual' in $$props) $$invalidate(1, cargaAtual = $$props.cargaAtual);
    		if ('selectedNote' in $$props) $$invalidate(2, selectedNote = $$props.selectedNote);
    		if ('nf' in $$props) nf = $$props.nf;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		recPoints,
    		cargaAtual,
    		selectedNote,
    		selectNote,
    		changeNf,
    		verificarNota,
    		backToLobbyRec,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8
    	];
    }

    class Recebimento extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Recebimento",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/Tasks/EpiTask.svelte generated by Svelte v3.50.0 */

    const { document: document_1 } = globals;
    const file$a = "src/Tasks/EpiTask.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	return child_ctx;
    }

    // (261:12) {#each cards as card}
    function create_each_block$1(ctx) {
    	let div6;
    	let div0;
    	let h10;
    	let t0_value = /*card*/ ctx[45].item_name + "";
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
    	let t5_value = /*card*/ ctx[45].item_info + "";
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
    		return /*click_handler_17*/ ctx[26](/*card*/ ctx[45]);
    	}

    	function click_handler_18() {
    		return /*click_handler_18*/ ctx[27](/*card*/ ctx[45]);
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
    			add_location(h10, file$a, 263, 20, 14412);
    			attr_dev(div0, "class", "item_Name");
    			add_location(div0, file$a, 262, 16, 14368);
    			if (!src_url_equal(img.src, img_src_value = /*card*/ ctx[45].item_image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*card*/ ctx[45].item_name);
    			add_location(img, file$a, 266, 20, 14520);
    			attr_dev(div1, "class", "cardInfo");
    			add_location(div1, file$a, 265, 16, 14477);
    			add_location(h11, file$a, 269, 20, 14659);
    			add_location(p, file$a, 270, 20, 14706);
    			attr_dev(div2, "class", "item_description");
    			add_location(div2, file$a, 268, 16, 14608);
    			attr_dev(div3, "class", "returnBtn");
    			add_location(div3, file$a, 273, 20, 14811);
    			attr_dev(div4, "class", "confirmBtn");
    			add_location(div4, file$a, 274, 20, 14927);
    			attr_dev(div5, "class", "btnArea");
    			add_location(div5, file$a, 272, 16, 14769);
    			attr_dev(div6, "class", "card");
    			attr_dev(div6, "id", /*card*/ ctx[45].item);
    			set_style(div6, "display", "none");
    			add_location(div6, file$a, 261, 12, 14295);
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
    		source: "(261:12) {#each cards as card}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
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
    	let t20;
    	let t21;
    	let t22;
    	let t23;
    	let div19;
    	let t25;
    	let div22;
    	let p1;
    	let t27;
    	let div21;
    	let t29;
    	let div28;
    	let p2;
    	let t31;
    	let div26;
    	let div23;
    	let span0;
    	let span1;
    	let t34;
    	let div24;
    	let span2;
    	let span3;
    	let t37;
    	let div25;
    	let span4;
    	let span5;
    	let t40;
    	let div27;
    	let t42;
    	let div30;
    	let p3;
    	let t44;
    	let div29;
    	let t46;
    	let div36;
    	let p4;
    	let t47;
    	let t48;
    	let br;
    	let t49;
    	let t50;
    	let t51;
    	let div34;
    	let div31;
    	let span6;
    	let span7;
    	let t54;
    	let div32;
    	let span8;
    	let span9;
    	let t57;
    	let div33;
    	let span10;
    	let span11;
    	let t60;
    	let div35;
    	let t62;
    	let div42;
    	let p5;
    	let t64;
    	let div40;
    	let div37;
    	let span12;
    	let span13;
    	let t67;
    	let div38;
    	let span14;
    	let span15;
    	let t70;
    	let div39;
    	let span16;
    	let span17;
    	let t73;
    	let div41;
    	let t75;
    	let div44;
    	let t76;
    	let div45;
    	let t77;
    	let div47;
    	let h11;
    	let t79;
    	let h2;
    	let t80;
    	let t81;
    	let t82;
    	let div46;
    	let mounted;
    	let dispose;
    	let each_value = /*cards*/ ctx[5];
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
    			t20 = text("Óla ");
    			t21 = text(/*$Nome*/ ctx[4]);
    			t22 = text(" em nossa empresa é extremamente importante garantir a sua segurança enquando atua em nossas dependências.");
    			t23 = space();
    			div19 = element("div");
    			div19.textContent = "Avançar";
    			t25 = space();
    			div22 = element("div");
    			p1 = element("p");
    			p1.textContent = "Tendo isso em mente nós disponibilizamos os equipamentos de proteção essenciais para a realização segura do seu trabalho, assim que estiver pronto clique no armário para iniciar a missão.";
    			t27 = space();
    			div21 = element("div");
    			div21.textContent = "Estou pronto";
    			t29 = space();
    			div28 = element("div");
    			p2 = element("p");
    			p2.textContent = "Para que você possa trabalhar com segurança é necessário ter equipado os seguintes equipamentos.";
    			t31 = space();
    			div26 = element("div");
    			div23 = element("div");
    			span0 = element("span");
    			span0.textContent = "Capacete de segurança";
    			span1 = element("span");
    			span1.textContent = "Óculos de proteção";
    			t34 = space();
    			div24 = element("div");
    			span2 = element("span");
    			span2.textContent = "Colete Refletivo";
    			span3 = element("span");
    			span3.textContent = "Protetor de ouvidos";
    			t37 = space();
    			div25 = element("div");
    			span4 = element("span");
    			span4.textContent = "Botas com biqueira";
    			span5 = element("span");
    			span5.textContent = "Luvas de proteção";
    			t40 = space();
    			div27 = element("div");
    			div27.textContent = "Avançar";
    			t42 = space();
    			div30 = element("div");
    			p3 = element("p");
    			p3.textContent = "Agora que você sabe quais os itens necessários selecione os equipamentos corretos para avançar para a proxima fase";
    			t44 = space();
    			div29 = element("div");
    			div29.textContent = "Selecionar itens";
    			t46 = space();
    			div36 = element("div");
    			p4 = element("p");
    			t47 = text(/*equipedItem*/ ctx[1]);
    			t48 = text(" com Sucesso. ");
    			br = element("br");
    			t49 = text("Equipamentos restantes: ");
    			t50 = text(/*equipCont*/ ctx[2]);
    			t51 = space();
    			div34 = element("div");
    			div31 = element("div");
    			span6 = element("span");
    			span6.textContent = "Capacete de segurança";
    			span7 = element("span");
    			span7.textContent = "Óculos de proteção";
    			t54 = space();
    			div32 = element("div");
    			span8 = element("span");
    			span8.textContent = "Colete Refletivo";
    			span9 = element("span");
    			span9.textContent = "Protetor de ouvidos";
    			t57 = space();
    			div33 = element("div");
    			span10 = element("span");
    			span10.textContent = "Botas com biqueira";
    			span11 = element("span");
    			span11.textContent = "Luvas de proteção";
    			t60 = space();
    			div35 = element("div");
    			div35.textContent = "Continuar";
    			t62 = space();
    			div42 = element("div");
    			p5 = element("p");
    			p5.textContent = "Este item não corresponde com os requesitos de segurança selecione outro item.";
    			t64 = space();
    			div40 = element("div");
    			div37 = element("div");
    			span12 = element("span");
    			span12.textContent = "Capacete de segurança";
    			span13 = element("span");
    			span13.textContent = "Óculos de proteção";
    			t67 = space();
    			div38 = element("div");
    			span14 = element("span");
    			span14.textContent = "Colete Refletivo";
    			span15 = element("span");
    			span15.textContent = "Protetor de ouvidos";
    			t70 = space();
    			div39 = element("div");
    			span16 = element("span");
    			span16.textContent = "Botas com biqueira";
    			span17 = element("span");
    			span17.textContent = "Luvas de proteção";
    			t73 = space();
    			div41 = element("div");
    			div41.textContent = "Continuar selecionando";
    			t75 = space();
    			div44 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t76 = space();
    			div45 = element("div");
    			t77 = space();
    			div47 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Missão Concluida";
    			t79 = space();
    			h2 = element("h2");
    			t80 = text("Pontuação da missão: ");
    			t81 = text(/*pointsEpi*/ ctx[0]);
    			t82 = space();
    			div46 = element("div");
    			div46.textContent = "Voltar ao mapa";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/styles/epi.css");
    			add_location(link, file$a, 1, 4, 18);
    			attr_dev(div0, "id", "locker");
    			add_location(div0, file$a, 177, 8, 7248);
    			add_location(h10, file$a, 179, 12, 7407);
    			attr_dev(img0, "id", "helmet_img");
    			if (!src_url_equal(img0.src, img0_src_value = "/images/helmet.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "helmet");
    			add_location(img0, file$a, 181, 35, 7502);
    			attr_dev(div1, "class", "slots");
    			add_location(div1, file$a, 181, 16, 7483);
    			attr_dev(img1, "id", "boot2_img");
    			if (!src_url_equal(img1.src, img1_src_value = "/images/botabalanceiada.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "bota");
    			add_location(img1, file$a, 182, 35, 7665);
    			attr_dev(div2, "class", "slots");
    			add_location(div2, file$a, 182, 16, 7646);
    			attr_dev(div3, "class", "slots");
    			add_location(div3, file$a, 183, 16, 7811);
    			attr_dev(div4, "class", "slots");
    			add_location(div4, file$a, 184, 16, 7853);
    			attr_dev(img2, "id", "glasses_img");
    			if (!src_url_equal(img2.src, img2_src_value = "/images/glasses.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "glasses");
    			add_location(img2, file$a, 185, 35, 7914);
    			attr_dev(div5, "class", "slots");
    			add_location(div5, file$a, 185, 16, 7895);
    			attr_dev(div6, "class", "slots");
    			add_location(div6, file$a, 186, 16, 8061);
    			attr_dev(div7, "class", "slots");
    			add_location(div7, file$a, 187, 16, 8103);
    			attr_dev(img3, "id", "machado_img");
    			if (!src_url_equal(img3.src, img3_src_value = "/images/machado.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "machado");
    			add_location(img3, file$a, 188, 35, 8164);
    			attr_dev(div8, "class", "slots");
    			add_location(div8, file$a, 188, 16, 8145);
    			attr_dev(img4, "id", "colete_img");
    			if (!src_url_equal(img4.src, img4_src_value = "/images/colete.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "colete");
    			add_location(img4, file$a, 189, 35, 8324);
    			attr_dev(div9, "class", "slots");
    			add_location(div9, file$a, 189, 16, 8305);
    			attr_dev(img5, "id", "helmet2_img");
    			if (!src_url_equal(img5.src, img5_src_value = "/images/capacetedanificado.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			add_location(img5, file$a, 190, 35, 8484);
    			attr_dev(div10, "class", "slots");
    			add_location(div10, file$a, 190, 16, 8465);
    			attr_dev(div11, "class", "slots");
    			add_location(div11, file$a, 191, 16, 8633);
    			attr_dev(img6, "id", "boot_img");
    			if (!src_url_equal(img6.src, img6_src_value = "/images/BotaEpii.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "bota de segurança");
    			add_location(img6, file$a, 192, 35, 8695);
    			attr_dev(div12, "class", "slots");
    			add_location(div12, file$a, 192, 16, 8676);
    			attr_dev(img7, "id", "glove_img");
    			if (!src_url_equal(img7.src, img7_src_value = "/images/glove.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "glove");
    			add_location(img7, file$a, 193, 35, 8864);
    			attr_dev(div13, "class", "slots");
    			add_location(div13, file$a, 193, 16, 8845);
    			attr_dev(img8, "id", "protetor_img");
    			if (!src_url_equal(img8.src, img8_src_value = "/images/Protetor.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$a, 194, 35, 9023);
    			attr_dev(div14, "class", "slots");
    			add_location(div14, file$a, 194, 16, 9004);
    			attr_dev(img9, "id", "desentupidor_img");
    			if (!src_url_equal(img9.src, img9_src_value = "/images/Desentupidor.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "desentupidor");
    			add_location(img9, file$a, 195, 35, 9185);
    			attr_dev(div15, "class", "slots");
    			add_location(div15, file$a, 195, 16, 9166);
    			attr_dev(div16, "class", "slots");
    			add_location(div16, file$a, 196, 16, 9351);
    			attr_dev(div17, "id", "itens");
    			add_location(div17, file$a, 180, 12, 7450);
    			attr_dev(div18, "id", "epiStorage");
    			set_style(div18, "display", "none");
    			add_location(div18, file$a, 178, 8, 7350);
    			add_location(p0, file$a, 201, 16, 9538);
    			attr_dev(div19, "class", "skipBtn");
    			add_location(div19, file$a, 202, 16, 9679);
    			set_style(div20, "display", "flex");
    			attr_dev(div20, "class", "dialogue");
    			attr_dev(div20, "id", "dialogue-1");
    			add_location(div20, file$a, 200, 12, 9460);
    			add_location(p1, file$a, 205, 16, 9881);
    			attr_dev(div21, "class", "skipBtn");
    			add_location(div21, file$a, 206, 16, 10093);
    			set_style(div22, "display", "none");
    			attr_dev(div22, "class", "dialogue");
    			attr_dev(div22, "id", "dialogue-2");
    			add_location(div22, file$a, 204, 12, 9804);
    			add_location(p2, file$a, 209, 16, 10354);
    			attr_dev(span0, "class", "unequipped");
    			add_location(span0, file$a, 212, 24, 10543);
    			attr_dev(span1, "class", "unequipped");
    			add_location(span1, file$a, 212, 77, 10596);
    			add_location(div23, file$a, 211, 20, 10513);
    			attr_dev(span2, "class", "unequipped");
    			add_location(span2, file$a, 215, 24, 10724);
    			attr_dev(span3, "class", "unequipped");
    			add_location(span3, file$a, 215, 72, 10772);
    			add_location(div24, file$a, 214, 20, 10694);
    			attr_dev(span4, "class", "unequipped");
    			add_location(span4, file$a, 218, 24, 10901);
    			attr_dev(span5, "class", "unequipped");
    			add_location(span5, file$a, 218, 74, 10951);
    			add_location(div25, file$a, 217, 20, 10871);
    			attr_dev(div26, "class", "Epis");
    			add_location(div26, file$a, 210, 16, 10474);
    			attr_dev(div27, "class", "skipBtn");
    			add_location(div27, file$a, 221, 16, 11067);
    			set_style(div28, "display", "none");
    			set_style(div28, "flex-direction", "column");
    			attr_dev(div28, "class", "dialogue");
    			attr_dev(div28, "id", "dialogue-3");
    			add_location(div28, file$a, 208, 12, 10254);
    			add_location(p3, file$a, 224, 16, 11270);
    			attr_dev(div29, "class", "skipBtn");
    			add_location(div29, file$a, 225, 16, 11408);
    			set_style(div30, "display", "none");
    			attr_dev(div30, "class", "dialogue");
    			attr_dev(div30, "id", "dialogue-4");
    			add_location(div30, file$a, 223, 12, 11193);
    			add_location(br, file$a, 228, 46, 11703);
    			add_location(p4, file$a, 228, 16, 11673);
    			toggle_class(span6, "unequipped", /*worker*/ ctx[3].helmet == false);
    			toggle_class(span6, "equipped", /*worker*/ ctx[3].helmet == true);
    			add_location(span6, file$a, 231, 24, 11832);
    			toggle_class(span7, "unequipped", /*worker*/ ctx[3].glasses == false);
    			toggle_class(span7, "equipped", /*worker*/ ctx[3].glasses == true);
    			add_location(span7, file$a, 231, 139, 11947);
    			add_location(div31, file$a, 230, 20, 11802);
    			toggle_class(span8, "unequipped", /*worker*/ ctx[3].vest == false);
    			toggle_class(span8, "equipped", /*worker*/ ctx[3].vest == true);
    			add_location(span8, file$a, 234, 24, 12139);
    			toggle_class(span9, "unequipped", /*worker*/ ctx[3].headphone == false);
    			toggle_class(span9, "equipped", /*worker*/ ctx[3].headphone == true);
    			add_location(span9, file$a, 234, 130, 12245);
    			add_location(div32, file$a, 233, 20, 12109);
    			toggle_class(span10, "unequipped", /*worker*/ ctx[3].boot == false);
    			toggle_class(span10, "equipped", /*worker*/ ctx[3].boot == true);
    			add_location(span10, file$a, 237, 24, 12442);
    			toggle_class(span11, "unequipped", /*worker*/ ctx[3].glove == false);
    			toggle_class(span11, "equipped", /*worker*/ ctx[3].glove == true);
    			add_location(span11, file$a, 237, 132, 12550);
    			add_location(div33, file$a, 236, 20, 12412);
    			attr_dev(div34, "class", "Epis");
    			add_location(div34, file$a, 229, 16, 11763);
    			attr_dev(div35, "class", "skipBtn");
    			add_location(div35, file$a, 240, 16, 12726);
    			set_style(div36, "display", "none");
    			set_style(div36, "flex-direction", "column");
    			attr_dev(div36, "class", "dialogue");
    			attr_dev(div36, "id", "dialogue-5");
    			add_location(div36, file$a, 227, 12, 11573);
    			add_location(p5, file$a, 243, 16, 12956);
    			toggle_class(span12, "unequipped", /*worker*/ ctx[3].helmet == false);
    			toggle_class(span12, "equipped", /*worker*/ ctx[3].helmet == true);
    			add_location(span12, file$a, 246, 24, 13128);
    			toggle_class(span13, "unequipped", /*worker*/ ctx[3].glasses == false);
    			toggle_class(span13, "equipped", /*worker*/ ctx[3].glasses == true);
    			add_location(span13, file$a, 246, 139, 13243);
    			add_location(div37, file$a, 245, 20, 13098);
    			toggle_class(span14, "unequipped", /*worker*/ ctx[3].vest == false);
    			toggle_class(span14, "equipped", /*worker*/ ctx[3].vest == true);
    			add_location(span14, file$a, 249, 24, 13435);
    			toggle_class(span15, "unequipped", /*worker*/ ctx[3].headphone == false);
    			toggle_class(span15, "equipped", /*worker*/ ctx[3].headphone == true);
    			add_location(span15, file$a, 249, 130, 13541);
    			add_location(div38, file$a, 248, 20, 13405);
    			toggle_class(span16, "unequipped", /*worker*/ ctx[3].boot == false);
    			toggle_class(span16, "equipped", /*worker*/ ctx[3].boot == true);
    			add_location(span16, file$a, 252, 24, 13738);
    			toggle_class(span17, "unequipped", /*worker*/ ctx[3].glove == false);
    			toggle_class(span17, "equipped", /*worker*/ ctx[3].glove == true);
    			add_location(span17, file$a, 252, 132, 13846);
    			add_location(div39, file$a, 251, 20, 13708);
    			attr_dev(div40, "class", "Epis");
    			add_location(div40, file$a, 244, 16, 13059);
    			attr_dev(div41, "class", "skipBtn");
    			add_location(div41, file$a, 255, 16, 14022);
    			set_style(div42, "display", "none");
    			set_style(div42, "flex-direction", "column");
    			attr_dev(div42, "class", "dialogue");
    			attr_dev(div42, "id", "dialogue-6");
    			add_location(div42, file$a, 242, 12, 12856);
    			attr_dev(div43, "id", "dialogueContainer");
    			add_location(div43, file$a, 199, 8, 9419);
    			attr_dev(div44, "id", "cardHolder");
    			set_style(div44, "display", "none");
    			add_location(div44, file$a, 258, 8, 14204);
    			attr_dev(div45, "id", "cardHolder");
    			set_style(div45, "display", "none");
    			add_location(div45, file$a, 279, 8, 15101);
    			add_location(h11, file$a, 281, 12, 15216);
    			add_location(h2, file$a, 282, 12, 15254);
    			attr_dev(div46, "id", "backToMap");
    			add_location(div46, file$a, 283, 12, 15308);
    			attr_dev(div47, "id", "EndScreen");
    			set_style(div47, "display", "none");
    			add_location(div47, file$a, 280, 8, 15160);
    			attr_dev(div48, "id", "epiScreen");
    			add_location(div48, file$a, 176, 4, 7219);
    			attr_dev(div49, "id", "epiContainer");
    			add_location(div49, file$a, 175, 0, 7191);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, link);
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
    			append_dev(p0, t20);
    			append_dev(p0, t21);
    			append_dev(p0, t22);
    			append_dev(div20, t23);
    			append_dev(div20, div19);
    			append_dev(div43, t25);
    			append_dev(div43, div22);
    			append_dev(div22, p1);
    			append_dev(div22, t27);
    			append_dev(div22, div21);
    			append_dev(div43, t29);
    			append_dev(div43, div28);
    			append_dev(div28, p2);
    			append_dev(div28, t31);
    			append_dev(div28, div26);
    			append_dev(div26, div23);
    			append_dev(div23, span0);
    			append_dev(div23, span1);
    			append_dev(div26, t34);
    			append_dev(div26, div24);
    			append_dev(div24, span2);
    			append_dev(div24, span3);
    			append_dev(div26, t37);
    			append_dev(div26, div25);
    			append_dev(div25, span4);
    			append_dev(div25, span5);
    			append_dev(div28, t40);
    			append_dev(div28, div27);
    			append_dev(div43, t42);
    			append_dev(div43, div30);
    			append_dev(div30, p3);
    			append_dev(div30, t44);
    			append_dev(div30, div29);
    			append_dev(div43, t46);
    			append_dev(div43, div36);
    			append_dev(div36, p4);
    			append_dev(p4, t47);
    			append_dev(p4, t48);
    			append_dev(p4, br);
    			append_dev(p4, t49);
    			append_dev(p4, t50);
    			append_dev(div36, t51);
    			append_dev(div36, div34);
    			append_dev(div34, div31);
    			append_dev(div31, span6);
    			append_dev(div31, span7);
    			append_dev(div34, t54);
    			append_dev(div34, div32);
    			append_dev(div32, span8);
    			append_dev(div32, span9);
    			append_dev(div34, t57);
    			append_dev(div34, div33);
    			append_dev(div33, span10);
    			append_dev(div33, span11);
    			append_dev(div36, t60);
    			append_dev(div36, div35);
    			append_dev(div43, t62);
    			append_dev(div43, div42);
    			append_dev(div42, p5);
    			append_dev(div42, t64);
    			append_dev(div42, div40);
    			append_dev(div40, div37);
    			append_dev(div37, span12);
    			append_dev(div37, span13);
    			append_dev(div40, t67);
    			append_dev(div40, div38);
    			append_dev(div38, span14);
    			append_dev(div38, span15);
    			append_dev(div40, t70);
    			append_dev(div40, div39);
    			append_dev(div39, span16);
    			append_dev(div39, span17);
    			append_dev(div42, t73);
    			append_dev(div42, div41);
    			append_dev(div48, t75);
    			append_dev(div48, div44);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div44, null);
    			}

    			append_dev(div48, t76);
    			append_dev(div48, div45);
    			append_dev(div48, t77);
    			append_dev(div48, div47);
    			append_dev(div47, h11);
    			append_dev(div47, t79);
    			append_dev(div47, h2);
    			append_dev(h2, t80);
    			append_dev(h2, t81);
    			append_dev(div47, t82);
    			append_dev(div47, div46);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(img0, "click", /*click_handler_1*/ ctx[10], false, false, false),
    					listen_dev(img1, "click", /*click_handler_2*/ ctx[11], false, false, false),
    					listen_dev(img2, "click", /*click_handler_3*/ ctx[12], false, false, false),
    					listen_dev(img3, "click", /*click_handler_4*/ ctx[13], false, false, false),
    					listen_dev(img4, "click", /*click_handler_5*/ ctx[14], false, false, false),
    					listen_dev(img5, "click", /*click_handler_6*/ ctx[15], false, false, false),
    					listen_dev(img6, "click", /*click_handler_7*/ ctx[16], false, false, false),
    					listen_dev(img7, "click", /*click_handler_8*/ ctx[17], false, false, false),
    					listen_dev(img8, "click", /*click_handler_9*/ ctx[18], false, false, false),
    					listen_dev(img9, "click", /*click_handler_10*/ ctx[19], false, false, false),
    					listen_dev(div19, "click", /*click_handler_11*/ ctx[20], false, false, false),
    					listen_dev(div21, "click", /*click_handler_12*/ ctx[21], false, false, false),
    					listen_dev(div27, "click", /*click_handler_13*/ ctx[22], false, false, false),
    					listen_dev(div29, "click", /*click_handler_14*/ ctx[23], false, false, false),
    					listen_dev(div35, "click", /*click_handler_15*/ ctx[24], false, false, false),
    					listen_dev(div41, "click", /*click_handler_16*/ ctx[25], false, false, false),
    					listen_dev(div46, "click", /*backToLobbyEpi*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$Nome*/ 16) set_data_dev(t21, /*$Nome*/ ctx[4]);
    			if (dirty[0] & /*equipedItem*/ 2) set_data_dev(t47, /*equipedItem*/ ctx[1]);
    			if (dirty[0] & /*equipCont*/ 4) set_data_dev(t50, /*equipCont*/ ctx[2]);

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

    			if (dirty[0] & /*cards, equipItem*/ 96) {
    				each_value = /*cards*/ ctx[5];
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

    			if (dirty[0] & /*pointsEpi*/ 1) set_data_dev(t81, /*pointsEpi*/ ctx[0]);
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
    		id: create_fragment$a.name,
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

    function changeDialogues(paragraph1, paragraph2) {
    	let paragraph = document.getElementById(paragraph1);

    	if (paragraph.style.display === "flex") {
    		openItem(paragraph1);
    		openItem(paragraph2);
    	}
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $taskOrder;
    	let $infoTasks0;
    	let $walk;
    	let $totalPoints;
    	let $Nome;
    	validate_store(taskOrder, 'taskOrder');
    	component_subscribe($$self, taskOrder, $$value => $$invalidate(29, $taskOrder = $$value));
    	validate_store(infoTasks0, 'infoTasks0');
    	component_subscribe($$self, infoTasks0, $$value => $$invalidate(30, $infoTasks0 = $$value));
    	validate_store(walk, 'walk');
    	component_subscribe($$self, walk, $$value => $$invalidate(31, $walk = $$value));
    	validate_store(totalPoints, 'totalPoints');
    	component_subscribe($$self, totalPoints, $$value => $$invalidate(32, $totalPoints = $$value));
    	validate_store(Nome, 'Nome');
    	component_subscribe($$self, Nome, $$value => $$invalidate(4, $Nome = $$value));
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

    	let pointsEpi = 0;
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
    						$$invalidate(0, pointsEpi += 25);
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
    						$$invalidate(0, pointsEpi += 25);
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
    						$$invalidate(0, pointsEpi += 25);
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
    						$$invalidate(0, pointsEpi += 25);
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
    						$$invalidate(0, pointsEpi += 25);
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
    						$$invalidate(0, pointsEpi += 25);
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
    						$$invalidate(0, pointsEpi -= 10);
    						changeDialogues("dialogue-5", "dialogue-6");

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

    	function backToLobbyEpi() {
    		set_store_value(totalPoints, $totalPoints += pointsEpi, $totalPoints);
    		set_store_value(walk, $walk = true, $walk);
    		game.style.display = "flex";
    		epiScreen.style.display = "none";
    		set_store_value(infoTasks0, $infoTasks0 = "COMPLETO!", $infoTasks0);
    		set_store_value(taskOrder, $taskOrder.t0 = false, $taskOrder);
    		set_store_value(taskOrder, $taskOrder.t1 = true, $taskOrder);
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

    	const click_handler_11 = () => changeDialogues("dialogue-1", "dialogue-2");

    	const click_handler_12 = () => {
    		(openItem("dialogueContainer"), changeDialogues("dialogue-2", "dialogue-3"));
    	};

    	const click_handler_13 = () => {
    		changeDialogues("dialogue-3", "dialogue-4");
    	};

    	const click_handler_14 = () => {
    		(openItem("dialogueContainer"), changeDialogues("dialogue-4", "dialogue-5"));
    	};

    	const click_handler_15 = () => {
    		(openItem("dialogueContainer"), taskFInished());
    	};

    	const click_handler_16 = () => {
    		(openItem("dialogueContainer"), changeDialogues("dialogue-6", "dialogue-5"));
    	};

    	const click_handler_17 = card => {
    		(openItem(card.item), openItem("cardHolder"));
    	};

    	const click_handler_18 = card => {
    		equipItem(card.item, card.img_ref);
    	};

    	$$self.$capture_state = () => ({
    		taskOrder,
    		walk,
    		infoTasks0,
    		totalPoints,
    		Nome,
    		EpiCard,
    		PlayerEpi,
    		pointsEpi,
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
    		changeDialogues,
    		taskFInished,
    		backToLobbyEpi,
    		$taskOrder,
    		$infoTasks0,
    		$walk,
    		$totalPoints,
    		$Nome
    	});

    	$$self.$inject_state = $$props => {
    		if ('pointsEpi' in $$props) $$invalidate(0, pointsEpi = $$props.pointsEpi);
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
    		if ('cards' in $$props) $$invalidate(5, cards = $$props.cards);
    		if ('worker' in $$props) $$invalidate(3, worker = $$props.worker);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pointsEpi,
    		equipedItem,
    		equipCont,
    		worker,
    		$Nome,
    		cards,
    		equipItem,
    		taskFInished,
    		backToLobbyEpi,
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EpiTask",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/tools/DangerPag.svelte generated by Svelte v3.50.0 */

    const file$9 = "src/tools/DangerPag.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Perigo - Mantenha-se na faixa de movimentação em amarelo";
    			if (!src_url_equal(img.src, img_src_value = "./images/faixaPerigo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "faixaPerigo");
    			attr_dev(img, "class", "svelte-hfmlq7");
    			add_location(img, file$9, 5, 4, 50);
    			attr_dev(h1, "class", "svelte-hfmlq7");
    			add_location(h1, file$9, 6, 4, 109);
    			attr_dev(div, "id", "dangerBox");
    			attr_dev(div, "class", "svelte-hfmlq7");
    			add_location(div, file$9, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DangerPag', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DangerPag> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class DangerPag extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DangerPag",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/tools/infoPag.svelte generated by Svelte v3.50.0 */
    const file$8 = "src/tools/infoPag.svelte";

    function create_fragment$8(ctx) {
    	let div7;
    	let div0;
    	let h1;
    	let t1;
    	let div6;
    	let div1;
    	let h20;
    	let t2;
    	let t3_value = (/*$Nome*/ ctx[0] === "" ? "Dustry" : /*$Nome*/ ctx[0]) + "";
    	let t3;
    	let t4;
    	let div2;
    	let h21;
    	let t6;
    	let h22;
    	let t7;
    	let t8;
    	let div3;
    	let h23;
    	let t10;
    	let h24;
    	let t11;
    	let t12;
    	let div4;
    	let h25;
    	let t14;
    	let h26;
    	let t15;
    	let t16;
    	let div5;
    	let h27;
    	let t18;
    	let h28;
    	let t19;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "INFO";
    			t1 = space();
    			div6 = element("div");
    			div1 = element("div");
    			h20 = element("h2");
    			t2 = text("Nome: ");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Equipamento";
    			t6 = space();
    			h22 = element("h2");
    			t7 = text(/*$infoTasks0*/ ctx[1]);
    			t8 = space();
    			div3 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Recebimento";
    			t10 = space();
    			h24 = element("h2");
    			t11 = text(/*$infoTasks1*/ ctx[2]);
    			t12 = space();
    			div4 = element("div");
    			h25 = element("h2");
    			h25.textContent = "Empilhadeira";
    			t14 = space();
    			h26 = element("h2");
    			t15 = text(/*$infoTasks2*/ ctx[3]);
    			t16 = space();
    			div5 = element("div");
    			h27 = element("h2");
    			h27.textContent = "Pontuação";
    			t18 = space();
    			h28 = element("h2");
    			t19 = text(/*$totalPoints*/ ctx[4]);
    			add_location(h1, file$8, 16, 4, 364);
    			attr_dev(div0, "class", "info-tittle svelte-mwuvif");
    			add_location(div0, file$8, 15, 2, 334);
    			attr_dev(h20, "class", "svelte-mwuvif");
    			add_location(h20, file$8, 20, 6, 444);
    			attr_dev(div1, "class", "info-item svelte-mwuvif");
    			add_location(div1, file$8, 19, 4, 414);
    			attr_dev(h21, "class", "svelte-mwuvif");
    			add_location(h21, file$8, 24, 6, 539);
    			attr_dev(h22, "class", "task-progress svelte-mwuvif");
    			toggle_class(h22, "finalizada", /*$infoTasks0*/ ctx[1] === "COMPLETO!");
    			toggle_class(h22, "nao", /*$infoTasks0*/ ctx[1] === "INCOMPLETO!");
    			add_location(h22, file$8, 24, 27, 560);
    			attr_dev(div2, "class", "info-item svelte-mwuvif");
    			add_location(div2, file$8, 23, 4, 509);
    			attr_dev(h23, "class", "svelte-mwuvif");
    			add_location(h23, file$8, 28, 6, 740);
    			attr_dev(h24, "class", "task-progress svelte-mwuvif");
    			toggle_class(h24, "finalizada", /*$infoTasks1*/ ctx[2] === "COMPLETO!");
    			toggle_class(h24, "nao", /*$infoTasks1*/ ctx[2] === "INCOMPLETO!");
    			add_location(h24, file$8, 28, 27, 761);
    			attr_dev(div3, "class", "info-item svelte-mwuvif");
    			add_location(div3, file$8, 27, 4, 710);
    			attr_dev(h25, "class", "svelte-mwuvif");
    			add_location(h25, file$8, 32, 6, 942);
    			attr_dev(h26, "class", "task-progress svelte-mwuvif");
    			toggle_class(h26, "finalizada", /*$infoTasks2*/ ctx[3] === "COMPLETO!");
    			toggle_class(h26, "nao", /*$infoTasks2*/ ctx[3] === "INCOMPLETO!");
    			add_location(h26, file$8, 32, 28, 964);
    			attr_dev(div4, "class", "info-item svelte-mwuvif");
    			add_location(div4, file$8, 31, 4, 912);
    			attr_dev(h27, "class", "svelte-mwuvif");
    			add_location(h27, file$8, 36, 6, 1144);
    			attr_dev(h28, "class", "task-progress svelte-mwuvif");
    			add_location(h28, file$8, 36, 25, 1163);
    			attr_dev(div5, "class", "info-item svelte-mwuvif");
    			add_location(div5, file$8, 35, 4, 1114);
    			attr_dev(div6, "id", "info-text");
    			attr_dev(div6, "class", "svelte-mwuvif");
    			add_location(div6, file$8, 18, 2, 389);
    			attr_dev(div7, "id", "infoBox");
    			attr_dev(div7, "class", "svelte-mwuvif");
    			add_location(div7, file$8, 14, 0, 313);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div0);
    			append_dev(div0, h1);
    			append_dev(div7, t1);
    			append_dev(div7, div6);
    			append_dev(div6, div1);
    			append_dev(div1, h20);
    			append_dev(h20, t2);
    			append_dev(h20, t3);
    			append_dev(div6, t4);
    			append_dev(div6, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t6);
    			append_dev(div2, h22);
    			append_dev(h22, t7);
    			append_dev(div6, t8);
    			append_dev(div6, div3);
    			append_dev(div3, h23);
    			append_dev(div3, t10);
    			append_dev(div3, h24);
    			append_dev(h24, t11);
    			append_dev(div6, t12);
    			append_dev(div6, div4);
    			append_dev(div4, h25);
    			append_dev(div4, t14);
    			append_dev(div4, h26);
    			append_dev(h26, t15);
    			append_dev(div6, t16);
    			append_dev(div6, div5);
    			append_dev(div5, h27);
    			append_dev(div5, t18);
    			append_dev(div5, h28);
    			append_dev(h28, t19);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$Nome*/ 1 && t3_value !== (t3_value = (/*$Nome*/ ctx[0] === "" ? "Dustry" : /*$Nome*/ ctx[0]) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$infoTasks0*/ 2) set_data_dev(t7, /*$infoTasks0*/ ctx[1]);

    			if (dirty & /*$infoTasks0*/ 2) {
    				toggle_class(h22, "finalizada", /*$infoTasks0*/ ctx[1] === "COMPLETO!");
    			}

    			if (dirty & /*$infoTasks0*/ 2) {
    				toggle_class(h22, "nao", /*$infoTasks0*/ ctx[1] === "INCOMPLETO!");
    			}

    			if (dirty & /*$infoTasks1*/ 4) set_data_dev(t11, /*$infoTasks1*/ ctx[2]);

    			if (dirty & /*$infoTasks1*/ 4) {
    				toggle_class(h24, "finalizada", /*$infoTasks1*/ ctx[2] === "COMPLETO!");
    			}

    			if (dirty & /*$infoTasks1*/ 4) {
    				toggle_class(h24, "nao", /*$infoTasks1*/ ctx[2] === "INCOMPLETO!");
    			}

    			if (dirty & /*$infoTasks2*/ 8) set_data_dev(t15, /*$infoTasks2*/ ctx[3]);

    			if (dirty & /*$infoTasks2*/ 8) {
    				toggle_class(h26, "finalizada", /*$infoTasks2*/ ctx[3] === "COMPLETO!");
    			}

    			if (dirty & /*$infoTasks2*/ 8) {
    				toggle_class(h26, "nao", /*$infoTasks2*/ ctx[3] === "INCOMPLETO!");
    			}

    			if (dirty & /*$totalPoints*/ 16) set_data_dev(t19, /*$totalPoints*/ ctx[4]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
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
    	let $Nome;
    	let $infoTasks0;
    	let $infoTasks1;
    	let $infoTasks2;
    	let $totalPoints;
    	validate_store(Nome, 'Nome');
    	component_subscribe($$self, Nome, $$value => $$invalidate(0, $Nome = $$value));
    	validate_store(infoTasks0, 'infoTasks0');
    	component_subscribe($$self, infoTasks0, $$value => $$invalidate(1, $infoTasks0 = $$value));
    	validate_store(infoTasks1, 'infoTasks1');
    	component_subscribe($$self, infoTasks1, $$value => $$invalidate(2, $infoTasks1 = $$value));
    	validate_store(infoTasks2, 'infoTasks2');
    	component_subscribe($$self, infoTasks2, $$value => $$invalidate(3, $infoTasks2 = $$value));
    	validate_store(totalPoints, 'totalPoints');
    	component_subscribe($$self, totalPoints, $$value => $$invalidate(4, $totalPoints = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('InfoPag', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<InfoPag> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		infoTasks0,
    		infoTasks1,
    		infoTasks2,
    		Nome,
    		totalPoints,
    		$Nome,
    		$infoTasks0,
    		$infoTasks1,
    		$infoTasks2,
    		$totalPoints
    	});

    	return [$Nome, $infoTasks0, $infoTasks1, $infoTasks2, $totalPoints];
    }

    class InfoPag extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InfoPag",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/tools/chat.svelte generated by Svelte v3.50.0 */
    const file$7 = "src/tools/chat.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let h1;
    	let t0_value = /*arrChat*/ ctx[1][/*chatCount*/ ctx[0]] + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			attr_dev(h1, "class", "svelte-14ysv6n");
    			add_location(h1, file$7, 29, 4, 966);
    			if (!src_url_equal(img.src, img_src_value = "./images/seta.gif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "seta");
    			attr_dev(img, "class", "svelte-14ysv6n");
    			add_location(img, file$7, 30, 4, 1000);
    			attr_dev(div, "id", "chatBox");
    			attr_dev(div, "class", "svelte-14ysv6n");
    			add_location(div, file$7, 28, 0, 943);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*chatLogic*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*chatCount*/ 1 && t0_value !== (t0_value = /*arrChat*/ ctx[1][/*chatCount*/ ctx[0]] + "")) set_data_dev(t0, t0_value);
    		},
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
    	let $Nome;
    	let $walk;
    	validate_store(Nome, 'Nome');
    	component_subscribe($$self, Nome, $$value => $$invalidate(3, $Nome = $$value));
    	validate_store(walk, 'walk');
    	component_subscribe($$self, walk, $$value => $$invalidate(4, $walk = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chat', slots, []);

    	const chatHidden = () => {
    		chatBox.style.display = "none";
    		set_store_value(walk, $walk = true, $walk);
    	};

    	const arrChat = [
    		`Bem vindo, ${!$Nome ? "Dustry" : $Nome}, esse é o Dustry. (Use o mouse para clicar na seta e seguir)`,
    		"O Dustry está em seu primeiro dia de trabalho em uma fábrica e precisa da sua ajuda.",
    		"Siga o mapa em direção aos locais com uma placa escrita \"!\", nesses locais há tasks a serem feitas.",
    		"Essas Tasks o ajudaram a entender melhor os processos Logisticos e de Segurança do Trabalho enquanto se diverte.",
    		"Mas tenha atenção, permaneça nas areas seguras, destacadas em amarelo, para sua segurança.",
    		"Divirta-se"
    	];

    	let chatCount = 0;

    	const chatLogic = () => {
    		if (chatCount < arrChat.length - 1) {
    			$$invalidate(0, chatCount++, chatCount);
    		} else {
    			chatHidden();
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Chat> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		walk,
    		Nome,
    		chatHidden,
    		arrChat,
    		chatCount,
    		chatLogic,
    		$Nome,
    		$walk
    	});

    	$$self.$inject_state = $$props => {
    		if ('chatCount' in $$props) $$invalidate(0, chatCount = $$props.chatCount);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [chatCount, arrChat, chatLogic];
    }

    class Chat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chat",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/tools/HeartBar.svelte generated by Svelte v3.50.0 */

    const file$6 = "src/tools/HeartBar.svelte";

    function create_fragment$6(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			img = element("img");
    			attr_dev(div0, "id", "barGreen");
    			attr_dev(div0, "class", "svelte-60wtrc");
    			add_location(div0, file$6, 6, 8, 72);
    			attr_dev(div1, "id", "barLife");
    			attr_dev(div1, "class", "svelte-60wtrc");
    			add_location(div1, file$6, 5, 4, 45);
    			if (!src_url_equal(img.src, img_src_value = "./images/barra-de-vida.gif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "fff");
    			attr_dev(img, "class", "svelte-60wtrc");
    			add_location(img, file$6, 8, 4, 113);
    			attr_dev(div2, "id", "HeartBox");
    			attr_dev(div2, "class", "svelte-60wtrc");
    			add_location(div2, file$6, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div2, t);
    			append_dev(div2, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
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

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HeartBar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HeartBar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class HeartBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeartBar",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/mapa1/FirstMap.svelte generated by Svelte v3.50.0 */

    const { console: console_1$1 } = globals;
    const file$5 = "src/mapa1/FirstMap.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let canvas_1;
    	let t0;
    	let dangerpag;
    	let t1;
    	let chatpag;
    	let t2;
    	let infopag;
    	let t3;
    	let heartbar;
    	let t4;
    	let epitask;
    	let t5;
    	let recebimento;
    	let t6;
    	let telateste;
    	let t7;
    	let telateste1;
    	let t8;
    	let telateste2;
    	let current;
    	dangerpag = new DangerPag({ $$inline: true });
    	chatpag = new Chat({ $$inline: true });
    	infopag = new InfoPag({ $$inline: true });
    	heartbar = new HeartBar({ $$inline: true });
    	epitask = new EpiTask({ $$inline: true });
    	recebimento = new Recebimento({ $$inline: true });
    	telateste = new TelaTeste({ $$inline: true });
    	telateste1 = new TelaTeste1({ $$inline: true });
    	telateste2 = new TelaTeste2({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			canvas_1 = element("canvas");
    			t0 = space();
    			create_component(dangerpag.$$.fragment);
    			t1 = space();
    			create_component(chatpag.$$.fragment);
    			t2 = space();
    			create_component(infopag.$$.fragment);
    			t3 = space();
    			create_component(heartbar.$$.fragment);
    			t4 = space();
    			create_component(epitask.$$.fragment);
    			t5 = space();
    			create_component(recebimento.$$.fragment);
    			t6 = space();
    			create_component(telateste.$$.fragment);
    			t7 = space();
    			create_component(telateste1.$$.fragment);
    			t8 = space();
    			create_component(telateste2.$$.fragment);
    			attr_dev(canvas_1, "class", "svelte-1hxoy17");
    			add_location(canvas_1, file$5, 644, 4, 19955);
    			attr_dev(div0, "id", "tela1");
    			attr_dev(div0, "class", "svelte-1hxoy17");
    			add_location(div0, file$5, 643, 2, 19934);
    			attr_dev(div1, "id", "game");
    			attr_dev(div1, "class", "svelte-1hxoy17");
    			add_location(div1, file$5, 642, 0, 19916);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, canvas_1);
    			/*canvas_1_binding*/ ctx[1](canvas_1);
    			append_dev(div0, t0);
    			mount_component(dangerpag, div0, null);
    			append_dev(div0, t1);
    			mount_component(chatpag, div0, null);
    			append_dev(div1, t2);
    			mount_component(infopag, div1, null);
    			append_dev(div1, t3);
    			mount_component(heartbar, div1, null);
    			insert_dev(target, t4, anchor);
    			mount_component(epitask, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(recebimento, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(telateste, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(telateste1, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(telateste2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dangerpag.$$.fragment, local);
    			transition_in(chatpag.$$.fragment, local);
    			transition_in(infopag.$$.fragment, local);
    			transition_in(heartbar.$$.fragment, local);
    			transition_in(epitask.$$.fragment, local);
    			transition_in(recebimento.$$.fragment, local);
    			transition_in(telateste.$$.fragment, local);
    			transition_in(telateste1.$$.fragment, local);
    			transition_in(telateste2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dangerpag.$$.fragment, local);
    			transition_out(chatpag.$$.fragment, local);
    			transition_out(infopag.$$.fragment, local);
    			transition_out(heartbar.$$.fragment, local);
    			transition_out(epitask.$$.fragment, local);
    			transition_out(recebimento.$$.fragment, local);
    			transition_out(telateste.$$.fragment, local);
    			transition_out(telateste1.$$.fragment, local);
    			transition_out(telateste2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*canvas_1_binding*/ ctx[1](null);
    			destroy_component(dangerpag);
    			destroy_component(chatpag);
    			destroy_component(infopag);
    			destroy_component(heartbar);
    			if (detaching) detach_dev(t4);
    			destroy_component(epitask, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(recebimento, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(telateste, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(telateste1, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(telateste2, detaching);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let $walk;
    	let $taskOrder;
    	let $collision;
    	let $Danger;
    	let $Info;
    	let $Task2;
    	let $Task1;
    	let $Task0;
    	validate_store(walk, 'walk');
    	component_subscribe($$self, walk, $$value => $$invalidate(2, $walk = $$value));
    	validate_store(taskOrder, 'taskOrder');
    	component_subscribe($$self, taskOrder, $$value => $$invalidate(3, $taskOrder = $$value));
    	validate_store(collision, 'collision');
    	component_subscribe($$self, collision, $$value => $$invalidate(4, $collision = $$value));
    	validate_store(Danger, 'Danger');
    	component_subscribe($$self, Danger, $$value => $$invalidate(5, $Danger = $$value));
    	validate_store(Info, 'Info');
    	component_subscribe($$self, Info, $$value => $$invalidate(6, $Info = $$value));
    	validate_store(Task2, 'Task2');
    	component_subscribe($$self, Task2, $$value => $$invalidate(7, $Task2 = $$value));
    	validate_store(Task1, 'Task1');
    	component_subscribe($$self, Task1, $$value => $$invalidate(8, $Task1 = $$value));
    	validate_store(Task0, 'Task0');
    	component_subscribe($$self, Task0, $$value => $$invalidate(9, $Task0 = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FirstMap', slots, []);
    	let canvas;
    	let reator = new Audio("./images/reator.m4a");

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

    			draw3() {
    				c.fillStyle = "rgba(0, 255, 0, 0)";
    				c.fillRect(this.position.x, this.position.y, this.width, this.height);
    			}

    			draw4() {
    				c.fillStyle = "rgba(255, 165, 0, 0)";
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

    		const arrInfo = [];

    		$Info.forEach((el, i) => {
    			el.forEach((ment, j) => {
    				if (ment === 1) {
    					arrInfo.push(new Boundary({
    							position: {
    								x: j * 54.4 + offset.x,
    								y: i * 54.4 + offset.y
    							}
    						}));
    				}
    			});
    		});

    		const arrDanger = [];

    		$Danger.forEach((el, i) => {
    			el.forEach((ment, j) => {
    				if (ment === 1) {
    					arrDanger.push(new Boundary({
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
    		/// Mapas ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    		// const mapaFull = new Image();
    		// mapaFull.src = "./images/Mapa(Aviso-Full).png";
    		const mapaAviso0 = new Image();

    		mapaAviso0.src = "./images/Mapa(Aviso0).png";
    		const mapaAviso1 = new Image();
    		mapaAviso1.src = "./images/Mapa(Aviso-1).png";
    		const mapaAviso2 = new Image();
    		mapaAviso2.src = "./images/Mapa(Aviso-2).png";
    		const mapaFinal = new Image();
    		mapaFinal.src = "./images/Mapa(Base).png";

    		/// Sprite //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    			constructor({ position, image, frames = { max: 1 }, sprites, swImages }) {
    				this.position = position;
    				this.image = image;
    				this.frames = { ...frames, val: 0, elapsed: 0 };

    				this.image.onload = () => {
    					this.width = this.image.width / this.frames.max;
    					this.height = this.image.height;
    				};

    				this.moving = false;
    				this.sprites = sprites;
    				this.swImages = swImages;
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
    				image: mapaAviso0,
    				swImages: {
    					av0: mapaAviso0,
    					av1: mapaAviso1,
    					av2: mapaAviso2,
    					final: mapaFinal
    				}
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
    		const movebles = [
    			background,
    			...arrBoundaries,
    			...arrTask0,
    			...arrTask1,
    			...arrTask2,
    			...arrInfo,
    			...arrDanger
    		];

    		// função que verifica se o personagem ta no mesmo lugar que as fronteiras
    		function rectungularCollision({ rectung1, rectung2 }) {
    			return rectung1.position.x + rectung1.width - 15 >= rectung2.position.x && rectung1.position.x + 15 <= rectung2.position.x + rectung2.width && rectung1.position.y + 15 <= rectung2.position.y + rectung2.height && rectung1.position.y + rectung1.height >= rectung2.position.y;
    		}

    		let pointer = 0;
    		let hp = 80;

    		const damage = () => {
    			pointer++;

    			setTimeout(
    				() => {
    					if (pointer >= 50 && pointer < 300) {
    						hp -= 20;
    						pointer = 0;
    					} else if (pointer >= 300 && pointer < 600) {
    						hp -= 25;
    						pointer = 0;
    					} else if (pointer >= 700) {
    						hp -= 90;
    						pointer = 0;
    					} else {
    						pointer = 0;
    					}

    					console.log(hp);
    					if (hp > 0) barGreen.style.width = hp + "%"; else barGreen.style.width = "0%";
    				},
    				3000
    			);

    			setTimeout(
    				() => {
    					if (hp <= 0) trocarEstadoDoJogo("menu");
    				},
    				4000
    			);
    		};

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

    			//  Info
    			arrInfo.forEach(el => {
    				el.draw3();
    			});

    			// Danger Areas
    			arrDanger.forEach(el => {
    				el.draw4();
    			});

    			let moving = true;
    			player.moving = false;

    			// consdicionais que caso o parametro for true aumenta ou diminue a posição da imagem do mapa
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
    				// rtoda vez que aperta espaço transforam jorge.rod em true e quando solto volta a ser false
    				// console.log('basbabsdba')
    				arrTask0.forEach(el => {
    					// esse loop via passar por todas as aeras de tasks e verificar se o player esta dentro
    					if (rectungularCollision({ rectung1: player, rectung2: { ...el } })) {
    						if ($taskOrder.t0) {
    							console.log("task 0");
    							epiScreen.style.display = "flex";
    							game.style.display = "none";
    							set_store_value(walk, $walk = false, $walk);
    							background.image = background.swImages.av1;
    						}
    					}
    				});

    				arrTask1.forEach(el => {
    					// esse loop via passar por todas as aeras de tasks e verificar se o player esta dentro
    					if (rectungularCollision({ rectung1: player, rectung2: { ...el } })) {
    						if ($taskOrder.t1) {
    							console.log("task 1");
    							recScreen.style.display = "block";
    							game.style.display = "none";
    							set_store_value(walk, $walk = false, $walk);
    							background.image = background.swImages.av2;
    						}
    					}
    				});

    				arrTask2.forEach(el => {
    					// esse loop via passar por todas as aeras de tasks e verificar se o player esta dentro
    					if (rectungularCollision({ rectung1: player, rectung2: { ...el } })) {
    						if ($taskOrder.t2) {
    							console.log("task 2");
    							task2.style.display = "flex";
    							game.style.display = "none";
    							set_store_value(walk, $walk = false, $walk);
    							background.image = background.swImages.final;
    						}
    					}
    				});
    			}

    			infoBox.style.display = "none";

    			arrInfo.forEach(el => {
    				// esse loop via passar por todas as aeras de tasks e verificar se o player esta dentro
    				if (rectungularCollision({ rectung1: player, rectung2: { ...el } })) {
    					infoBox.style.display = "flex";
    				}
    			});

    			dangerBox.style.display = "none";

    			arrDanger.forEach(el => {
    				// esse loop via passar por todas as aeras de tasks e verificar se o player esta dentro
    				if (rectungularCollision({ rectung1: player, rectung2: { ...el } })) {
    					dangerBox.style.display = "flex";
    					reator.play();
    					damage();
    				} // $walk = false;
    			});
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<FirstMap> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(0, canvas);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		TelaTeste,
    		TelaTeste1,
    		TelaTeste2,
    		Recebimento,
    		EpiTask,
    		DangerPag,
    		InfoPag,
    		ChatPag: Chat,
    		HeartBar,
    		estado,
    		trocarEstadoDoJogo,
    		collision,
    		Task0,
    		taskOrder,
    		Task1,
    		Task2,
    		Info,
    		Danger,
    		life,
    		walk,
    		canvas,
    		reator,
    		$walk,
    		$taskOrder,
    		$collision,
    		$Danger,
    		$Info,
    		$Task2,
    		$Task1,
    		$Task0
    	});

    	$$self.$inject_state = $$props => {
    		if ('canvas' in $$props) $$invalidate(0, canvas = $$props.canvas);
    		if ('reator' in $$props) reator = $$props.reator;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [canvas, canvas_1_binding];
    }

    class FirstMap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FirstMap",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/tools/Sideranking.svelte generated by Svelte v3.50.0 */
    const file$4 = "src/tools/Sideranking.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (28:20) {#if i < 15}
    function create_if_block$1(ctx) {
    	let div0;
    	let h2;
    	let t0_value = /*i*/ ctx[4] + 1 + "º" + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*el*/ ctx[2].Nome + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*el*/ ctx[2].pontos + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			add_location(h2, file$4, 29, 28, 915);
    			attr_dev(div0, "class", "p-position flex-align-center svelte-1nir9oe");
    			add_location(div0, file$4, 28, 24, 844);
    			attr_dev(div1, "class", "p-name flex-align-center svelte-1nir9oe");
    			add_location(div1, file$4, 31, 24, 993);
    			attr_dev(div2, "class", "p-points flex-align-center svelte-1nir9oe");
    			add_location(div2, file$4, 32, 24, 1071);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*leitor*/ 1 && t2_value !== (t2_value = /*el*/ ctx[2].Nome + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*leitor*/ 1 && t4_value !== (t4_value = /*el*/ ctx[2].pontos + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(28:20) {#if i < 15}",
    		ctx
    	});

    	return block;
    }

    // (21:12) {#each leitor as el, i}
    function create_each_block(ctx) {
    	let div;
    	let t;
    	let if_block = /*i*/ ctx[4] < 15 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			attr_dev(div, "class", "player svelte-1nir9oe");
    			toggle_class(div, "first", /*i*/ ctx[4] == 0);
    			toggle_class(div, "second", /*i*/ ctx[4] == 1);
    			toggle_class(div, "third", /*i*/ ctx[4] == 2);
    			add_location(div, file$4, 21, 16, 605);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*i*/ ctx[4] < 15) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(21:12) {#each leitor as el, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let h1;
    	let t1;
    	let div1;
    	let each_value = /*leitor*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "RANKING";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$4, 17, 12, 491);
    			attr_dev(div0, "class", "ranking-tittle svelte-1nir9oe");
    			add_location(div0, file$4, 16, 8, 450);
    			attr_dev(div1, "class", "players svelte-1nir9oe");
    			add_location(div1, file$4, 19, 8, 531);
    			attr_dev(div2, "class", "tabela-de-ranking svelte-1nir9oe");
    			add_location(div2, file$4, 15, 4, 410);
    			attr_dev(div3, "class", "rankingarea flex-align-center svelte-1nir9oe");
    			add_location(div3, file$4, 14, 0, 362);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
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
    						each_blocks[i].m(div1, null);
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
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sideranking', slots, []);
    	let leitor = [];

    	async function loadRanking() {
    		let resposta = await fetch("http://localhost:8001/ler_banco.php");
    		let texto = await resposta.text();
    		let json = JSON.parse(texto);
    		$$invalidate(0, leitor = json);
    	}

    	onMount(async () => {
    		await loadRanking();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sideranking> was created with unknown prop '${key}'`);
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

    class Sideranking extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sideranking",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/tools/Inputname.svelte generated by Svelte v3.50.0 */
    const file$3 = "src/tools/Inputname.svelte";

    function create_fragment$3(ctx) {
    	let div3;
    	let div0;
    	let p;
    	let t1;
    	let div2;
    	let input;
    	let t2;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Antes de iniciar o jogo digite seu nome abaixo.";
    			t1 = space();
    			div2 = element("div");
    			input = element("input");
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "Enviar";
    			attr_dev(p, "class", "svelte-99366l");
    			add_location(p, file$3, 7, 8, 213);
    			attr_dev(div0, "class", "text-wrapper flex-align-center svelte-99366l");
    			add_location(div0, file$3, 6, 4, 160);
    			attr_dev(input, "id", "name-input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Digite seu nome");
    			attr_dev(input, "name", "Nome");
    			attr_dev(input, "maxlength", "24");
    			attr_dev(input, "class", "svelte-99366l");
    			add_location(input, file$3, 10, 8, 319);
    			attr_dev(div1, "id", "input-btn");
    			attr_dev(div1, "class", "svelte-99366l");
    			add_location(div1, file$3, 11, 8, 441);
    			attr_dev(div2, "class", "input-wrapper svelte-99366l");
    			add_location(div2, file$3, 9, 4, 283);
    			attr_dev(div3, "class", "input-content flex-align-center svelte-99366l");
    			add_location(div3, file$3, 5, 0, 110);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, p);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, input);
    			set_input_value(input, /*$Nome*/ ctx[0]);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[1]),
    					listen_dev(div1, "click", /*click_handler*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$Nome*/ 1 && input.value !== /*$Nome*/ ctx[0]) {
    				set_input_value(input, /*$Nome*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
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
    	let $Nome;
    	validate_store(Nome, 'Nome');
    	component_subscribe($$self, Nome, $$value => $$invalidate(0, $Nome = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Inputname', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Inputname> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		$Nome = this.value;
    		Nome.set($Nome);
    	}

    	const click_handler = () => trocarEstadoDoJogo("game");
    	$$self.$capture_state = () => ({ trocarEstadoDoJogo, Nome, $Nome });
    	return [$Nome, input_input_handler, click_handler];
    }

    class Inputname extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Inputname",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/tools/Menu.svelte generated by Svelte v3.50.0 */

    const { console: console_1 } = globals;
    const file$2 = "src/tools/Menu.svelte";

    // (51:35) 
    function create_if_block_3(ctx) {
    	let firstmap;
    	let current;
    	firstmap = new FirstMap({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(firstmap.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(firstmap, target, anchor);
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
    			destroy_component(firstmap, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(51:35) ",
    		ctx
    	});

    	return block;
    }

    // (49:35) 
    function create_if_block_2(ctx) {
    	let inputname;
    	let current;
    	inputname = new Inputname({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(inputname.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(inputname, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputname.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputname.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(inputname, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(49:35) ",
    		ctx
    	});

    	return block;
    }

    // (41:6) {#if $estado === "menu"}
    function create_if_block_1(ctx) {
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "JOGAR";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "SOBRE";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "AJUDA";
    			attr_dev(div0, "class", "menu-btn svelte-1afxhxp");
    			add_location(div0, file$2, 42, 10, 1250);
    			attr_dev(div1, "class", "menu-btn svelte-1afxhxp");
    			add_location(div1, file$2, 45, 10, 1362);
    			attr_dev(div2, "class", "menu-btn svelte-1afxhxp");
    			add_location(div2, file$2, 46, 10, 1406);
    			attr_dev(div3, "class", "btn-wrapper flex-align-center svelte-1afxhxp");
    			add_location(div3, file$2, 41, 8, 1196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(
    						div2,
    						"click",
    						function () {
    							if (is_function(console.log(/*$Nome*/ ctx[1]))) console.log(/*$Nome*/ ctx[1]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:6) {#if $estado === \\\"menu\\\"}",
    		ctx
    	});

    	return block;
    }

    // (55:6) {#if $estado === "game"}
    function create_if_block(ctx) {
    	let sideranking;
    	let current;
    	sideranking = new Sideranking({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(sideranking.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sideranking, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sideranking.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sideranking.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sideranking, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(55:6) {#if $estado === \\\"game\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let section;
    	let div0;
    	let t0;
    	let div1;
    	let current_block_type_index;
    	let if_block0;
    	let t1;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$estado*/ ctx[0] === "menu") return 0;
    		if (/*$estado*/ ctx[0] === "nome") return 1;
    		if (/*$estado*/ ctx[0] === "game") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = /*$estado*/ ctx[0] === "game" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			section = element("section");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "info1 flex-align-center  svelte-1afxhxp");
    			add_location(div0, file$2, 33, 4, 882);
    			attr_dev(div1, "class", "area-jogo flex-align-center svelte-1afxhxp");
    			add_location(div1, file$2, 39, 4, 1115);
    			attr_dev(section, "class", "svelte-1afxhxp");
    			add_location(section, file$2, 32, 2, 868);
    			attr_dev(div2, "class", "menu-wrapper svelte-1afxhxp");
    			add_location(div2, file$2, 31, 0, 839);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, section);
    			append_dev(section, div0);
    			append_dev(section, t0);
    			append_dev(section, div1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div1, null);
    			}

    			append_dev(section, t1);
    			if (if_block1) if_block1.m(section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					} else {
    						if_block0.p(ctx, dirty);
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(div1, null);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (/*$estado*/ ctx[0] === "game") {
    				if (if_block1) {
    					if (dirty & /*$estado*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(section, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block1) if_block1.d();
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
    	let $estado;
    	let $Nome;
    	validate_store(estado, 'estado');
    	component_subscribe($$self, estado, $$value => $$invalidate(0, $estado = $$value));
    	validate_store(Nome, 'Nome');
    	component_subscribe($$self, Nome, $$value => $$invalidate(1, $Nome = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);

    	const hiddenName = () => {
    		inputName.style.display = "none";
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => trocarEstadoDoJogo("nome");

    	$$self.$capture_state = () => ({
    		trocarEstadoDoJogo,
    		FirstMap,
    		estado,
    		Nome,
    		Sideranking,
    		Inputname,
    		hiddenName,
    		$estado,
    		$Nome
    	});

    	return [$estado, $Nome, click_handler];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/tools/HowtoPlay.svelte generated by Svelte v3.50.0 */

    const file$1 = "src/tools/HowtoPlay.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Nem tudo o que reluz é ouro,\n        Nem todos os que vagueiam estão perdidos;\n        O velho que é forte não murcha,\n        Raízes profundas não são atingidas pela geada.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Das cinzas um fogo deve ser acordado,\n        Uma luz das sombras brotará;\n        Renovada será a lâmina que estava quebrada,\n        O sem coroa novamente será rei";
    			attr_dev(p0, "class", "svelte-1b1ko0f");
    			add_location(p0, file$1, 4, 4, 43);
    			attr_dev(p1, "class", "svelte-1b1ko0f");
    			add_location(p1, file$1, 10, 4, 242);
    			attr_dev(div, "id", "boxPlay");
    			attr_dev(div, "class", "svelte-1b1ko0f");
    			add_location(div, file$1, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	validate_slots('HowtoPlay', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HowtoPlay> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class HowtoPlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HowtoPlay",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.50.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let header;
    	let div4;
    	let nav;
    	let div3;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div1;
    	let h1;
    	let t3;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let img3;
    	let img3_src_value;
    	let t5;
    	let img4;
    	let img4_src_value;
    	let t6;
    	let main;
    	let menu;
    	let current;
    	let mounted;
    	let dispose;
    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			div4 = element("div");
    			nav = element("nav");
    			div3 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "DUSTRY";
    			t3 = space();
    			div2 = element("div");
    			img2 = element("img");
    			t4 = space();
    			img3 = element("img");
    			t5 = space();
    			img4 = element("img");
    			t6 = space();
    			main = element("main");
    			create_component(menu.$$.fragment);
    			attr_dev(img0, "class", "icons svelte-ho3l0");
    			if (!src_url_equal(img0.src, img0_src_value = "./images/worker.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "trabalhador");
    			add_location(img0, file, 64, 10, 1763);
    			attr_dev(img1, "class", "icons svelte-ho3l0");
    			if (!src_url_equal(img1.src, img1_src_value = "./images/checklist.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Lista de atividades");
    			add_location(img1, file, 65, 10, 1838);
    			attr_dev(div0, "class", "logo-wrapper flex-center-align svelte-ho3l0");
    			add_location(div0, file, 63, 8, 1708);
    			attr_dev(h1, "class", "svelte-ho3l0");
    			add_location(h1, file, 68, 10, 1997);
    			attr_dev(div1, "class", "logo-name-wrapper flex-center-align svelte-ho3l0");
    			add_location(div1, file, 67, 8, 1937);
    			attr_dev(img2, "class", "icons svelte-ho3l0");
    			if (!src_url_equal(img2.src, img2_src_value = "./images/ranking.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Placar");
    			add_location(img2, file, 71, 10, 2092);
    			attr_dev(img3, "class", "icons svelte-ho3l0");
    			if (!src_url_equal(img3.src, img3_src_value = "./images/comoJogar.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Como Jogar");
    			add_location(img3, file, 72, 10, 2196);
    			attr_dev(img4, "class", "icons svelte-ho3l0");
    			if (!src_url_equal(img4.src, img4_src_value = "./images/sobre.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Sobre");
    			add_location(img4, file, 73, 10, 2308);
    			attr_dev(div2, "class", "click-wrapper flex-center-align svelte-ho3l0");
    			add_location(div2, file, 70, 8, 2036);
    			attr_dev(div3, "class", "nav-content svelte-ho3l0");
    			add_location(div3, file, 62, 6, 1674);
    			attr_dev(nav, "class", "nav-bar svelte-ho3l0");
    			add_location(nav, file, 61, 4, 1646);
    			attr_dev(div4, "class", "nav-wrapper svelte-ho3l0");
    			add_location(div4, file, 60, 2, 1616);
    			attr_dev(header, "class", "svelte-ho3l0");
    			add_location(header, file, 59, 0, 1605);
    			attr_dev(main, "class", "svelte-ho3l0");
    			add_location(main, file, 79, 0, 2424);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div4);
    			append_dev(div4, nav);
    			append_dev(nav, div3);
    			append_dev(div3, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, img1);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, h1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, img2);
    			append_dev(div2, t4);
    			append_dev(div2, img3);
    			append_dev(div2, t5);
    			append_dev(div2, img4);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(menu, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(img2, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(img3, "click", /*click_handler_1*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(main);
    			destroy_component(menu);
    			mounted = false;
    			run_all(dispose);
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
    	let booRanking = false;

    	const hiddenRanking = () => {
    		if (!booRanking) booRanking = true; else booRanking = false;
    		if (!booRanking) telaRanking.style.display = "none"; else telaRanking.style.display = "flex";
    	};

    	let booHTP = false;

    	const hiddenHowToPlay = () => {
    		if (!booHTP) booHTP = true; else booHTP = false;
    		if (!booHTP) boxPlay.style.display = "none"; else boxPlay.style.display = "block";
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => hiddenRanking();
    	const click_handler_1 = () => hiddenHowToPlay();

    	$$self.$capture_state = () => ({
    		estado,
    		Ranking,
    		Menu,
    		HowtoPlay,
    		a,
    		booRanking,
    		hiddenRanking,
    		booHTP,
    		hiddenHowToPlay
    	});

    	$$self.$inject_state = $$props => {
    		if ('a' in $$props) a = $$props.a;
    		if ('booRanking' in $$props) booRanking = $$props.booRanking;
    		if ('booHTP' in $$props) booHTP = $$props.booHTP;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [hiddenRanking, hiddenHowToPlay, click_handler, click_handler_1];
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
