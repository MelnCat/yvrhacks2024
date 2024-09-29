export const popupMananger = {
	popups: new Set<Popup>(),
	create(x: number, y: number, width: number, height: number, tick: (popup: Popup, delta: number) => void) {
		this.popups.add(new Popup(x, y, width, height, tick));
	},
	destroy(popup: Popup) {
		this.popups.delete(popup);
		popup.win.close();
	},
};
let lastTick = Date.now();

const globalTicker = () => {
	const delta = Date.now() - lastTick;
	if (delta < 20) return;
	lastTick = Date.now();
	for (const popup of popupMananger.popups) popup.tick(delta);
};
export const setup = () => setInterval(() => globalTicker());;
const createPopup = (x: number, y: number, width: number, height: number) => {
	const win = open("about:blank", "name", `popup,left=${x},top=${y},width=${width},height=${height}`);
	if (!win) throw new Error("Popups not allowed");
	return win;
};
interface PopupOptions {
	fixedSize: boolean;
	fixedPosition: boolean;
}
const defaultOptions = {};
class Popup {
	win: Window;
	#x: number;
	#y: number;
	#width: number;
	#height: number;
	options: PopupOptions;
	constructor(
		x: number,
		y: number,
		width: number,
		height: number,
		public onTick: (popup: Popup, delta: number) => void,
		options: Partial<PopupOptions> = {}
	) {
		this.options = { ...defaultOptions, ...options } as PopupOptions;
		this.win = createPopup(x, y, width, height);
		this.#x = x;
		this.#y = y;
		this.#width = width;
		this.#height = height;
		setInterval(() => globalTicker());
	}

	get width() {
		return this.win.innerWidth;
	}
	set width(value: number) {
		this.resize(value, this.height);
	}
	get height() {
		return this.win.innerHeight;
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

	tick(delta: number) {
		this.onTick(this, delta);
		if (this.options.fixedPosition) {
			if (this.win.screenX !== this.#x || this.win.screenY !== this.#y) this.win.moveTo(this.#x, this.#y);
		}
		if (this.options.fixedSize) {
			if (this.win.innerWidth !== this.#width || this.win.innerHeight !== this.#height)
				this.win.resizeTo(this.#width, this.#height);
		}
	}
}
