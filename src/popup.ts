import { pageOffsetY, screenHeight, screenWidth } from "./constants";
import { obstacles, playerData } from "./game";

export const tickers = new Set<(delta: number) => void>();
export const waiters = new Set<{ time: number; cb: () => void }>();

let timeT = Date.now();

export const wait = (time: number) => new Promise(res => waiters.add({ time: Date.now() + time, cb: () => res(null) }));

export const createTempTicker = (tick: (time: number, stop: () => void) => void) => {
	return new Promise(res => {
		const startTime = Date.now();
		const ticker = () =>
			tick(Date.now() - startTime, () => {
				tickers.delete(ticker);
				res(null);
			});
		tickers.add(ticker);
	});
};

export const popupManager = {
	popups: new Set<Popup>(),
	create(x: number, y: number, width: number, height: number, options: Partial<PopupOptions> = {}): Promise<Popup> {
		const popup = new Popup(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height), options);
		this.popups.add(popup);
		return new Promise(res => {
			/*if (popup.win.document.readyState == "complete") res(popup);
			else popup.win.addEventListener("load", () => res(popup));*/
			res(popup);
		});
	},
	destroy(popup: Popup) {
		this.popups.delete(popup);
		clearInterval(popup.interval);
		const win = popup.win;
		win.moveTo(0, 0);
		win.resizeTo(1, 1);
		win.document.documentElement.innerHTML = `<html><head></head><body></body></html>`;
		popupCache.push(win);
		obstacles.delete(popup);
	},
};
let lastTick = Date.now();

const globalTicker = () => {
	const delta = Date.now() - lastTick;
	timeT += delta;
	if (delta < 50) return;
	lastTick = Date.now();
	for (const ticker of tickers) ticker(delta);
	for (const popup of popupManager.popups) popup.runTick(delta);
	if (playerData.health <= 0) return;
	for (const waiter of waiters)
		if (Date.now() > waiter.time) {
			waiter.cb();
			waiters.delete(waiter);
		}
};
export const setup = () => {
	setInterval(() => globalTicker(), 50);
};
const createPopup = (x: number, y: number, width: number, height: number) => {
	const win = open(
		"about:blank",
		"_blank",
		`popup,toolbar=no,resizable=no,resizeable=no,resize=no,menubar=no,left=${x},top=${y},width=${width},height=${height}`
	);
	if (!win) throw new Error("Popups not allowed");
	win.document.documentElement.innerHTML = `
	<body?></body?>`;
	return win;
};
export const popupCache: Window[] = [];
export const createCache = () => {
	for (let i = 0; i < 10; i++) popupCache.push(createPopup(0, 0, 1, 1));
};
interface PopupOptions {
	fixedSize: boolean;
	fixedPosition: boolean;
	showBackground: boolean;
	allowClose: boolean;
}
const defaultOptions: PopupOptions = {
	fixedSize: true,
	fixedPosition: true,
	showBackground: true,
	allowClose: false,
};
export class Popup {
	win!: Window;
	#x: number;
	#y: number;
	#width: number;
	#height: number;
	options: PopupOptions;
	interval!: number;
	#onSetup?: () => void;
	#onTick?: (delta: number) => void;
	#onClose?: () => void;
	constructor(x: number, y: number, width: number, height: number, options: Partial<PopupOptions> = {}) {
		this.options = { ...defaultOptions, ...options } as PopupOptions;
		this.#x = x;
		this.#y = y;
		this.#width = width;
		this.#height = height;
		this.setupWindow();
	}
	obstacle() {
		const makeAd = () => {
			const ads = [...document.getElementsByClassName("ad")] as HTMLTemplateElement[];
			this.win.document.body.append(ads[Math.floor(Math.random() * ads.length)].content.cloneNode(true));
			const colors = ["red", "yellow", "blue", "green", "purple", "white", "black"];
			const first = colors[Math.floor(Math.random() * colors.length)];
			const second = colors.filter(x => x !== first)[Math.floor(Math.random() * (colors.length - 1))];
			this.win.document.body.style.color = first;
			this.win.document.body.style.backgroundColor = second;
			this.win.document.body.style.fontFamily = "sans-serif";
			this.win.document.body.style.fontSize = "1.2em";
			const style = document.createElement("style");
			style.innerHTML = "img { width: 100vw; height: auto }";
			this.win.document.head.appendChild(style);
		};
		const old = this.#onSetup;
		this.#onSetup = () => {
			old?.();
			makeAd();
		};
		if (this.win.document.readyState === "complete") makeAd();
		obstacles.add(this);
		return this;
	}
	setup(cb: (popup: Popup) => void) {
		this.#onSetup = cb.bind(this, this);
		if (this.win.document.readyState === "complete") cb(this);
		return this;
	}
	tick(cb: (popup: Popup, delta: number) => void) {
		this.#onTick = cb.bind(this, this);
		return this;
	}
	close(cb: (popup: Popup) => void) {
		this.#onClose = cb.bind(this, this);
		return this;
	}
	setupWindow(allowCache: boolean = true) {
		if (allowCache && popupCache.length) {
			const cached = popupCache.pop()!;
			cached.document.documentElement.innerHTML = `<html><head></head><body></body></html>`;
			cached.moveTo(this.#x, this.#y);
			cached.resizeTo(this.#width, this.#height);
			cached.focus();
			this.win = cached;
		} else this.win = createPopup(this.#x, this.#y, this.#width, this.#height);
		this.interval = this.win.setInterval(() => globalTicker(), 50);
		this.win.onload = () => {
			this.#onSetup?.();
			this.win.document.body.style.margin = "0";
			this.win.document.body.style.padding = "0";
			if (this.options.showBackground) {
				this.win.document.body.style.backgroundImage = `url("/img/background.png")`;
				this.win.document.body.style.backgroundSize = `${screenWidth}px ${screenHeight}px`;
				this.win.document.body.style.backgroundRepeat = `no-repeat`;
				console.log(this.win.document.documentElement.innerHTML);
			}
		};
		if (this.win.document.readyState === "complete") this.win.onload(null as any);
		createTempTicker((t, stop) => {
			this.move(this.#x, this.#y);
			if (t > 200) stop();
		});
	}

	get width() {
		return this.win.outerWidth;
	}
	set width(value: number) {
		this.resize(value, this.#height);
	}
	get height() {
		return this.win.outerHeight;
	}
	set height(value: number) {
		this.resize(this.#width, value);
	}
	resize(width: number, height: number) {
		this.#width = width;
		this.#height = height;
		this.win.resizeTo(width, height);
	}
	move(x: number, y: number) {
		this.#x = x;
		this.#y = y;
		this.win.moveTo(x, y);
	}
	get x() {
		return this.win.screenX;
	}
	set x(value: number) {
		this.move(value, this.#y);
	}
	get y() {
		return this.win.screenY;
	}
	set y(value: number) {
		this.move(this.#x, value);
	}

	runTick(delta: number) {
		if (this.win.closed) {
			if (!this.options.allowClose) {
				clearInterval(this.interval);
				this.setupWindow(false);
				this.#onSetup?.();
				this.win.moveTo(this.#x, this.#y);
				this.win.resizeBy(this.#width, this.#height);
			}
			this.#onClose?.();
			popupCache.push(createPopup(0, 0, 1, 1));
		}
		this.#onTick?.(delta);
		if (this.options.showBackground) {
			this.win.document.body.style.backgroundPosition = `${-this.x - screenX - 13}px ${-this.y - pageOffsetY + 42}px`;
		}
		if (this.options.fixedPosition) {
			if (Math.abs(this.win.screenX - this.#x) > 2 || Math.abs(this.win.screenY - this.#y) > 2)
				this.win.moveTo(this.#x, this.#y);
		} else {
			//this.#x = this.win.screenX;
			//this.#y = this.win.screenY;
		}
		if (this.options.fixedSize) {
			if (this.win.outerWidth !== this.#width || this.win.outerHeight !== this.#height)
				this.win.resizeTo(this.#width, this.#height);
		} else {
			this.#width = this.win.outerWidth;
			this.#height = this.win.outerHeight;
		}
	}
}

export const addPopupImage = (popup: Popup, image: string, width: number, height: number) => {
	popup.win.document.body.innerHTML = `<img src="${image}" style="height: ${height}px; width: ${width}px;" />`;
};
