class FocusFlow {
	hideAttr(node) {
		return node.setAttribute('hidden', '');
	}

	prevNode(target) {
		return node => node.closest(target);
	}

	hasAttr(attr) {
		return node => node.hasAttribute(attr);
	}

	setAttr(entry = {}) {
		return node => Object.assign(node, entry);
	}

	isKeyStroke(event) {
		return this.isTab(event); // Simplified: ! (false === this.isTab(event)) means this.isTab(event) must be true
	}

	canUse(value) {
		return value !== null && value !== undefined;
	}

	removeAttr(attr) {
		return node => this.hasAttr(attr)(node) && node.removeAttribute(attr);
	}

	isFocusable(event) {
		return this.queryFocusableAll().includes(event.target); // focusable elements
	}

	hideHelpers() {
		return event => {
			const helpers = [...this.nodelist.helpers];
			helpers.forEach(this.setAttr({ hidden: 'hidden' }));
		};
	}

	getHelpers() {
		const radio = [
			...document.querySelectorAll('[aria-required="true"] .helper-message')
		];
		const required = [...document.querySelectorAll('[required]')].map(
			node => node.parentElement.nextElementSibling
		);
		return [...radio, ...required];
	}

	showHelpers(required = true) {
		return event => {
			const helpers = [...this.nodelist.helpers];
			this.showNodes(helpers)(event);
		};
	}

	showNodes(nodelist) {
		return event => nodelist.forEach(this.removeAttr('hidden'));
	}

	isObject(obj) {
		// Simplified: obj !== undefined && typeof obj === 'object' && Array.isArray(obj) === false
		return obj !== undefined && typeof obj === 'object' && !Array.isArray(obj);
	}

	isTab(event) {
		// Simplified: (event.type === 'keyup') && (event.keyCode === 9)
		return event.type === 'keyup' && event.keyCode === 9;
	}

	isEnabled(activator = this.nodelist.activator) {
		// Simplified: (activator !== null) && (activator.checked === true)
		// Using optional chaining:
		return activator?.checked === true;
	}

	isArrows(event) {
		// Simplified: (event.type === 'keyup') && ([37, 38, 39, 40].includes(event.keyCode))
		return event.type === 'keyup' && [37, 38, 39, 40].includes(event.keyCode);
	}

	isRadio(node) {
		// Simplified: (node.tagName === 'INPUT') && (node.type === 'radio')
		return node.tagName === 'INPUT' && node.type === 'radio';
	}

	isCheckbox(node) {
		// Simplified: (node.tagName === 'INPUT') && (node.type === 'checkbox')
		return node.tagName === 'INPUT' && node.type === 'checkbox';
	}

	isApproved(event) {
		// Simplified: this.canUse(this.nodelist.flow) && this.isEnabled(this.nodelist.activator) && this.isTab(event) && this.isFocusable(event)
		return (
			this.canUse(this.nodelist.flow) &&
			this.isEnabled(this.nodelist.activator) &&
			this.isTab(event) &&
			this.isFocusable(event)
		);
	}

	convertToRem(numerator) {
		const root = document.documentElement;
		const font = getComputedStyle(root).fontSize;
		const denominator = parseFloat(font);
		return `${numerator / denominator}rem`;
	}

	enforceArray(value) {
		return !Array.isArray(value)
			? [value]
			: [...new Set(value)];
	}

	setObjValues(entries, fn) {
		return Object.entries(entries).reduce(this.curryReduce(fn), {});
	}

	curryReduce(fn) {
		return (cache, [key, value]) => ({
			...cache,
			[key]: fn(value)
		});
	}

	hideNodes(nodelist) {
		return event => {
			nodelist.forEach(this.hideAttr);
			event.preventDefault(); // TODO: Remove once ready
		};
	}

	getPosition(target) {
		const { top, left, width, height } = target.getBoundingClientRect();
		return { top, left, width, height };
	}

	excludeSelectors(exclude = [this.activator]) {
		return [
			'[disabled]',
			'[hidden]',
			'[aria-hidden="true"]',
			'[tabindex="-1"]',
			...exclude
		]
			.map(attr => `:not(${attr})`)
			.join('');
	}

	includeSelectors(excludes) {
		return ['button', 'input', 'textarea', 'select', 'details', 'a[href]']
			.map(name => name + excludes)
			.join(', ');
	}

	queryFocusableAll() {
		const excludes = this.excludeSelectors();
		const includes = this.includeSelectors(excludes);
		return [...document.querySelectorAll(includes)];
	}

	// eventFinished(adjusting) {
	// 	this.hideAttr(this.nodelist.flow);
	// 	return event => {
	// 		window.clearTimeout(adjusting);
	// 		adjusting = setTimeout(this.moveFlow, 66);
	// 	};
	// }

	appendTo() {
		this.nodelist.app.insertAdjacentHTML(
			'beforeend',
			`<div id="focus-flow" role="presentation" />`
		);
	}

	conceal(events = this.events.conceal) {
		const selected = [...document.querySelectorAll('[aria-selected="true"]')];
		selected.forEach(this.setAttr({ ariaSelected: 'false' }));
		return event => {
			this.enforceArray(events).includes(event.type) &&
				this.nodelist.flow.classList.remove('active');
			event.type === 'submit' && event.preventDefault();
		};
	}

	update(selectors) {
		this.create(selectors);
		return event => {
			let target = event.target;
			const ignore = [this.nodelist.activator, document.body];
			if (!this.enforceArray(ignore).includes(target) && this.isEnabled()) {
				target = !(target.tagName === 'BUTTON')
					? this.prevNode(this.selectors.inputWrapper)(target)
					: target;
				this.conceal([event.type])(event);
				this.setAttr({ ariaSelected: 'true' })(target);
				// TODO: const { borderRadius } = getComputedStyle(parent);
				const style = this.setObjValues(
					this.getPosition(target),
					this.convertToRem
				);
				const node = this.nodelist.flow;
				node.classList.add('active');
				this.setAttr({ ...style })(node.style);
			}
		};
	}

	create(options = {}) {
		this.selectors = options;
		const {
			insertAt,
			selector,
			activator,
			helperText,
			inputWrapper,
			radioClass,
			conceal
		} = this.selectors;
		this.events = {
			conceal
		};
		this.nodelist = {
			app: document.querySelector(insertAt),
			activator: document.querySelector(activator),
			flow: document.querySelector(selector),
			target: document.activeElement,
			helpers: document.querySelectorAll(helperText),
			wrappers: document.querySelectorAll(inputWrapper),
			radios: document.querySelectorAll(radioClass)
		};
		(this.nodelist.flow === null) && this.appendTo(this.nodelist.app);
		return this;
	}

	observe() {
		const watch = window.addEventListener;
		watch('keyup', this.update(this.selectors), false);
		watch(
			'submit',
			event => {
				this.conceal()(event);
				this.showHelpers()(event);
				event.preventDefault();
			},
			false
		);
		watch('reset', this.hideHelpers(), false);
		for (const event of this.events.conceal) {
			watch(event, this.conceal(), false);
		}
	}
}

export default new FocusFlow();
