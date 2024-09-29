import { playerData } from "../game";
import { createTempTicker, popupManager, wait } from "../popup";
import { lerp } from "../util";

export const startBattle1 = async () => {
	await sweepAttack();
	if (playerData.health <= 0) return;
	playerData.rounds++;
	await wait(500);
	await spikesAttack();
	if (playerData.health <= 0) return;
	playerData.rounds++;
	await wait(500);
	await horAttack();
	if (playerData.health <= 0) return;
	playerData.rounds++;
	await wait(500);
	await vertAttack();
	if (playerData.health <= 0) return;
	playerData.rounds++;
	await startBattle1();
};

const horAttack = async () => {
	const hors = await Promise.all(
		[...Array(2)].map(async (_, i) =>
			(
				await popupManager.create(0, (screen.height / 2) * i, 100, screen.height / 2, { showBackground: false })
			).obstacle()
		)
	);
	await wait(500);
	for (let i = 0; i < 6; i++) {
		await createTempTicker((t, stop) => {
			for (let j = 0; j < 2; j++) {
				hors[j].width = lerp(t / 1000, hors[j].width, i % 2 === j ? screen.width : 10);
			}
			if (t > 1000) stop();
		});
		await createTempTicker((t, stop) => {
			for (let j = 0; j < 2; j++) hors[j].width = lerp(t / 1000, hors[j].width, 100);
			if (t > 1000) stop();
		});
	}
	for (const j of hors) popupManager.destroy(j);
};

const vertAttack = async () => {
	const verts = await Promise.all(
		[...Array(4)].map(async (_, i) =>
			(await popupManager.create((screen.width / 4) * i, 0, screen.width / 4, 100, { showBackground: false })).obstacle()
		)
	);
	await wait(500);
	let lastTarget = -1;
	for (let i = 0; i < 10; i++) {
		let target = -1;
		do {
			target = Math.floor(Math.random() * 4);
		} while (target === lastTarget);
		lastTarget = target;
		await createTempTicker((t, stop) => {
			for (let j = 0; j < 4; j++)
				verts[j].height = target === j ? lerp(t / 1000, 100, screen.height) : lerp(t / 1000, verts[j].height, 100);
			if (t > 1000) stop();
		});
	}
	await createTempTicker((t, stop) => {
		for (let j = 0; j < 4; j++) verts[j].height = lerp(t / 1000, verts[j].height, 100);
		if (t > 1000) stop();
	});
	for (const vert of verts) popupManager.destroy(vert);
};

const spikesAttack = async () => {
	const left = (await popupManager.create(0, 0, screen.width / 2, 100, { showBackground: false })).obstacle();
	const right = (
		await popupManager.create(screen.width / 2, screen.height - 100, screen.width / 2, 100, { showBackground: false })
	).obstacle();
	await wait(500);
	for (let i = 0; i < 3; i++) {
		await createTempTicker((t, stop) => {
			left.y = lerp(t / 1500, 0, screen.height - 100);
			right.y = lerp(t / 1500, screen.height - 100, 0);
			if (t > 1500) stop();
		});
		await createTempTicker((t, stop) => {
			right.y = lerp(t / 1500, 0, screen.height - 100);
			left.y = lerp(t / 1500, screen.height - 100, 0);
			if (t > 1500) stop();
		});
	}

	popupManager.destroy(left);
	popupManager.destroy(right);
};

const sweepAttack = async () => {
	const topLeft = (await popupManager.create(0, 0, screen.width / 2, screen.height / 2, { showBackground: false })).obstacle();
	const bottomRight = (
		await popupManager.create(screen.width / 2, screen.height / 2, screen.width / 2, screen.height / 2, { showBackground: false })
	).obstacle();
	await wait(500);
	for (let i = 0; i < 2; i++) {
		await createTempTicker((t, stop) => {
			topLeft.x = lerp(t / 1000, 100, screen.width / 2,)
			bottomRight.x = lerp(t / 1000, screen.width / 2, 100)
			if (t > 1000) stop();
		});
		await createTempTicker((t, stop) => {
			topLeft.y = lerp(t / 1000, 100, screen.height / 2)
			bottomRight.y = lerp(t / 1000, screen.height / 2, 100)
			if (t > 1000) stop();
		});
		await createTempTicker((t, stop) => {
			bottomRight.x = lerp(t / 1000, 100, screen.width / 2,)
			topLeft.x = lerp(t / 1000, screen.width / 2, 100)
			if (t > 1000) stop();
		});
		await createTempTicker((t, stop) => {
			bottomRight.y = lerp(t / 1000, 100, screen.height / 2)
			topLeft.y = lerp(t / 1000, screen.height / 2, 100)
			if (t > 1000) stop();
		});
	}

	popupManager.destroy(topLeft);
	popupManager.destroy(bottomRight);
};
