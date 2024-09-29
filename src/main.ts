import { startBattle1 } from "./battle/battle1";
import { setupUI } from "./battle/ui";
import { pageOffsetY, screenHeight, screenWidth } from "./constants";
import { obstacles, playerData } from "./game";
import { addPopupImage, createCache, Popup, popupCache, popupManager as popupManager, setup, tickers, wait } from "./popup";
import "./style.scss";
import { collides } from "./util";

setup();

window.addEventListener("beforeunload", event => {
	//event.preventDefault();
});

tickers.add(() => {
	document.body.style.backgroundSize = `${screenWidth}px ${screenHeight}px`;
	document.body.style.backgroundPosition = `0px ${-pageOffsetY}px`;
});

setInterval(() => {
	if (document.hasFocus()) for (const popup of popupManager.popups) popup.win.focus();
}, 50);

document.body.addEventListener("click", () => {
	for (const popup of popupManager.popups) popup.win.focus();
});
document.body.addEventListener("focus", () => {
	for (const popup of popupManager.popups) popup.win.focus();
});

document.getElementById("end")?.addEventListener("click", () => {
	for (const popup of popupManager.popups) popupManager.destroy(popup);
	for (const cache of popupCache) cache.close();
	popupCache.length = 0;
});
document.getElementById("b1")?.addEventListener("click", async () => {
	await setupUI();
	await wait(2000);
	await startBattle1();
});
document.getElementById("start")?.addEventListener("click", async () => {
	await setupUI();
});

document.getElementById("cache")?.addEventListener("click", async () => {
	createCache();
});
