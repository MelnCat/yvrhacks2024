import { pageOffsetY, screenHeight, screenWidth } from "./constants";

export const tickers = new Set<(delta: number) => void>();
export const popupMananger = {
	popups: new Set<Popup>(),
	create(
		x: number,
		y: number,
		width: number,
		height: number,
		options: Partial<PopupOptions> = {}
	) {
		const popup = new Popup(x, y, width, height, options);
		this.popups.add(popup);
		return popup;
	},
	destroy(popup: Popup) {
		this.popups.delete(popup);
		clearInterval(popup.interval);
		(popup.win as any).killed = true;
		popup.win.close();
	},
};
let lastTick = Date.now();

const globalTicker = () => {
	const delta = Date.now() - lastTick;
	if (delta < 50) return;
	lastTick = Date.now();
	for (const ticker of tickers) ticker(delta);
	for (const popup of popupMananger.popups) popup.runTick(delta);
};
export const setup = () => setInterval(() => globalTicker());
const createPopup = (x: number, y: number, width: number, height: number) => {
	const win = open("about:blank", "_blank", `popup,toolbar=no,menubar=no,left=${x},top=${y},width=${width},height=${height}`);
	if (!win) throw new Error("Popups not allowed");
	win.document.documentElement.innerHTML = `
	<body?></body?>`;
	return win;
};
interface PopupOptions {
	fixedSize: boolean;
	fixedPosition: boolean;
	showBackground: boolean;
}
const defaultOptions: PopupOptions = {
	fixedSize: true,
	fixedPosition: true,
	showBackground: true,
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
	constructor(x: number, y: number, width: number, height: number, options: Partial<PopupOptions> = {}) {
		this.options = { ...defaultOptions, ...options } as PopupOptions;
		this.#x = x;
		this.#y = y;
		this.#width = width;
		this.#height = height;
		this.setupWindow();
	}
	setup(cb: (popup: Popup) => void) {
		this.#onSetup = cb.bind(this, this);
		cb(this);
		return this;
	}
	tick(cb: (popup: Popup, delta: number) => void,) {
		this.#onTick = cb.bind(this, this);
		return this;
	}
	setupWindow() {
		this.win = createPopup(this.#x, this.#y, this.#width, this.#height);
		this.interval = this.win.setInterval(() => globalTicker());
		if (this.options.showBackground) {
			this.win.document.body.style.backgroundImage = `url("/img/background.png")`;
			this.win.document.body.style.backgroundSize = `${screenWidth}px ${screenHeight}px`;
			this.win.document.body.style.backgroundRepeat = `no-repeat`;
		}
	}

	get width() {
		return this.win.outerWidth;
	}
	set width(value: number) {
		this.resize(value, this.height);
	}
	get height() {
		return this.win.outerHeight;
	}
	set height(value: number) {
		this.resize(this.width, value);
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
		this.move(value, this.y);
	}
	get y() {
		return this.win.screenY;
	}
	set y(value: number) {
		this.move(this.x, value);
	}

	runTick(delta: number) {
		if ((this.win as any).killed) return;
		if (this.win.closed) {
			clearInterval(this.interval);
			this.setupWindow();
			this.#onSetup?.();
			this.win.moveTo(this.#x, this.#y);
			this.win.resizeBy(this.#width, this.#height);
		}
		this.#onTick?.(delta);
		if (this.options.showBackground) {
			this.win.document.body.style.backgroundPosition = `${-this.x - screenX - 7}px ${-this.y + 56 - pageOffsetY}px`;
		}
		if (this.options.fixedPosition) {
			if (Math.abs(this.win.screenX - this.#x) > 2 || Math.abs(this.win.screenY - this.#y) > 2)
				this.win.moveTo(this.#x, this.#y);
		} else {
			this.#x = this.win.screenX;
			this.#y = this.win.screenY;
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
