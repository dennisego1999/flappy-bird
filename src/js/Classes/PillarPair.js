import Pillar from '@js/Classes/Pillar.js';

export default class PillarPair {
	constructor() {
		this.up = null;
		this.down = null;
		this.hasPassed = false;

		// Generate pair
		this.generatePillarPair();
	}

	generatePillarPair() {
		// Create a pillar pair, one down one up
		this.up = new Pillar('up');
		this.down = new Pillar('down');
	}

	update() {
		// Update
		this.up.update();
		this.down.update();
	}
}
