export const collides = (
	x1: number,
	y1: number,
	width1: number,
	height1: number,
	x2: number,
	y2: number,
	width2: number,
	height2: number,
	tolerance: number = -20
) => {
	return (
		x1 < x2 + width2 + tolerance &&
		x1 + width1 + tolerance > x2 &&
		y1 < y2 + height2 + tolerance &&
		y1 + height1 + tolerance > y2
	);
};

export const lerp = (t: number, first: number, second: number) => Math.floor((1 - t) * first + second * t);
