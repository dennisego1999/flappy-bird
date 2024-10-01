export function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function lerp(value1, value2, amount) {
	//Set amount
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;

	return value1 + (value2 - value1) * amount;
}
