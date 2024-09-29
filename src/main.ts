import { pageOffsetY, screenHeight, screenWidth } from "./constants";
import { addPopupImage, Popup, popupMananger, setup, tickers } from "./popup";
import "./style.scss";
import { collides } from "./util";

setup();

tickers.add(() => {
	document.body.style.backgroundSize = `${screenWidth}px ${screenHeight}px`;
	document.body.style.backgroundPosition = `0px ${-pageOffsetY}px`;
});

const obstacles: Popup[] = [];

const playerData = {
	health: 100,
	maxHealth: 100,
};

setInterval(() => {
	if (document.hasFocus()) for (const popup of popupMananger.popups) popup.win.focus();
}, 50);

document.body.addEventListener("click", () => {
	for (const popup of popupMananger.popups) popup.win.focus();
});
document.body.addEventListener("focus", () => {
	for (const popup of popupMananger.popups) popup.win.focus();
});

document.getElementById("end")?.addEventListener("click", () => {
	for (const popup of popupMananger.popups) popupMananger.destroy(popup);
});
document.getElementById("start")!.addEventListener("click", () => {
	const playerImage = document.createElement("img");
	playerImage.src = `/img/player.png`;
	playerImage.width = 170;
	playerImage.height = 170;
	const player = popupMananger
		.create(100, 100, 200, 260, { fixedPosition: false })
		.setup(popup => popup.win.document.body.append(playerImage))
		.tick(() => {
			const colliding = obstacles.some(x =>
				collides(x.x, x.y, x.width, x.height, player.x, player.y, player.width, player.height)
			);
		});

	const health = popupMananger.create(50, screen.height - 150 - 50, 400, 150);
	const obs = [{ x: screenWidth / 2 - 100, y: 0, width: 200, height: screenHeight }];

	for (const ob of obs) {
		const p = popupMananger.create(ob.x, ob.y, ob.width, ob.height, { showBackground: false });
		obstacles.push(p);
	}
});
