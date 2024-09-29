import { obstacles, playerData } from "../game";
import { popupManager } from "../popup";
import { collides } from "../util";

export const setupUI = async() => {
	const playerImage = document.createElement("img");
	playerImage.src = `/img/player.png`;
	playerImage.width = 170;
	playerImage.height = 170;
	let lastCollision = Date.now();
	let shaking = 0;
	const player = (await popupManager
		.create(screen.width / 2 - 185 / 2, screen.height / 2 - 250 / 2, 185, 250, { fixedPosition: false }))
		.setup(popup => popup.win.document.body.append(playerImage))
		.tick(async popup => {
			if (playerData.health <= 0) {
				popupManager.destroy(player);
				(await popupManager
					.create((screen.width - 800) / 2, (screen.height - 500) / 2, 800, 500, { allowClose: true }))
					.setup(popup => {
						popup.win.document.body.innerHTML = `<h1 style="color: white; font-family: sans-serif; text-align: center; 
    font-size: 11em;
    -webkit-text-stroke: #000 6px;">
					You Died!</h1>`;
					})
					.close(() => {
						for (const popup of popupManager.popups) popupManager.destroy(popup);
						location.reload();
					});
			}
			if (shaking > 0) {
				shaking--;
				popup.move(popup.x + (shaking % 2 === 0 ? -10 : 10), popup.y);
			}
			const colliding = [...obstacles].some(x =>
				collides(x.x, x.y, x.width, x.height, player.x, player.y, player.width, player.height)
			);
			if (colliding) playerImage.src = `/img/player_damaged.png`;
			else playerImage.src = `/img/player.png`;
			if (colliding) {
				const dt = Date.now() - lastCollision;
				if (dt > 1000) {
					playerData.health -= 10;
					lastCollision = Date.now();
					shaking = 10;
				}
			}
		});

	const healthElement = document.createElement("div");
	healthElement.style.width = "100%";
	healthElement.style.height = "100%";
	healthElement.style.border = "8px solid white";
	healthElement.style.boxSizing = "border-box";
	let lastFocus = Date.now();
	const health = (await popupManager
		.create(50, screen.height - 150 - 50, 400, 150))
		.setup(p => p.win.document.body.append(healthElement))
		.tick(popup => {
			if (Date.now() > lastFocus + 1000) {
				popup.win.focus();
				lastFocus = Date.now();
			}
			const healthPercent = (playerData.health / playerData.maxHealth) * 100;
			healthElement.style.backgroundImage = `linear-gradient(90deg, red, red ${healthPercent}%, transparent ${healthPercent}%, transparent ${healthPercent}%)`;
		});
};
