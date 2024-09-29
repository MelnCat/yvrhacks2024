import { obstacles, playerData } from "../game";
import { popupCache, popupManager, tickers } from "../popup";
import { collides } from "../util";

export const setupUI = async () => {
	const playerImage = document.createElement("img");
	playerImage.src = `/img/player.png`;
	playerImage.width = 180;
	playerImage.height = 180;
	let lastCollision = Date.now();
	let shaking = 0;
	const player = (
		await popupManager.create(screen.width / 2 - 200 / 2, screen.height / 2 - 270 / 2, 200, 260, { fixedPosition: false })
	)
		.setup(popup => popup.win.document.body.append(playerImage))
		.tick(async popup => {
			if (playerData.health <= 0) {
				popupManager.destroy(player);
				tickers.clear();
				for (const popup of popupManager.popups) popupManager.destroy(popup);
				(await popupManager.create((screen.width - 800) / 2, (screen.height - 500) / 2, 800, 500, { allowClose: true, fixedPosition: false, fixedSize: false }))
					.setup(popup => {
						popup.win.document.body.style.textAlign = "center";
						popup.win.document.body.style.fontFamily = `Avenir, Montserrat, Corbel, 'URW Gothic', source-sans-pro, sans-serif`;
						popup.win.document.body.innerHTML = `<h1 style="color: white; text-align: center; 
    font-size: 8em; font-family: Bahnschrift, 'DIN Alternate', 'Franklin Gothic Medium', 'Nimbus Sans Narrow', sans-serif-condensed, sans-serif;
    margin-bottom: 0.1em;">
					You Died!</h1><p style="color: white; font-size: 2em; font-family: Avenir, Montserrat, Corbel, 'URW Gothic', source-sans-pro, sans-serif;">You survived <b>${playerData.rounds}</b> Rounds.</p>
					<button style="cursor: pointer; font-size: 2.5em; font-family:Avenir, Montserrat, Corbel, 'URW Gothic', source-sans-pro, sans-serif; color: white; background-color: transparent; border: 2px solid white; padding: 0.2em 0.4em;">PLAY AGAIN</button>`;
						popup.win.document.querySelector("button")?.addEventListener("click", () => {
							for (const popup of popupManager.popups) popupManager.destroy(popup);
							for (const cache of popupCache) cache.close();
							location.reload();
						});
					})
					.close(() => {
						for (const popup of popupManager.popups) popupManager.destroy(popup);
						for (const cache of popupCache) cache.close();
						location.reload();
					});
			}
			if (false && shaking > 0) {
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
	const health = (await popupManager.create(50, screen.height - 150 - 50, 400, 150))
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
