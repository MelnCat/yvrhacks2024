import { createTempTicker, popupManager, wait } from "../popup";
import { lerp } from "../util";

export const startBattle1 = async () => {
	await horAttack();
	await wait(500);
	await vertAttack();
};

const horAttack = async() => {
	const hors = await Promise.all(
		[...Array(2)].map(async (_, i) =>
			(await popupManager.create(0, screen.height / 2 * i, 100, screen.height / 2, { showBackground: false })).obstacle()
		)
	);
	for (let i = 0; i < 4; i++) {
		await createTempTicker((t, stop) => {
			for (let j = 0; j < 2; j++) {
				hors[j].width = lerp(t / 1000, hors[j].width, i % 2 === j ? screen.width : 10);
			}
			if (t > 1000) stop();
		});
	}
	await createTempTicker((t, stop) => {
		for (let j = 0; j < 2; j++)
			hors[j].width = lerp(t / 1000, hors[j].width, 100)
		if (t > 1000) stop();
	});
	for (const j of hors) popupManager.destroy(j);
}

const vertAttack = async () => {
	const verts = await Promise.all(
		[...Array(4)].map(async (_, i) =>
			(await popupManager.create((screen.width / 4) * i, 0, screen.width / 4, 100, { showBackground: false })).obstacle()
		)
	);
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
		for (let j = 0; j < 4; j++)
			verts[j].height = lerp(t / 1000, verts[j].height, 100);
		if (t > 1000) stop();
	});
	for (const vert of verts) popupManager.destroy(vert);
};
