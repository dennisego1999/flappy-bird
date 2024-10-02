import Pillar from '@js/Classes/Pillar.js';
import Game from '@js/Classes/Game.js';

export default class PillarPair {
	constructor() {
		this.up = null;
		this.down = null;
		this.hasPassed = false;
		this.active = false;

		// Generate pair
		this.generatePillarPair();
	}

	init() {
		// Activate
		this.active = true;
	}

	reset() {
		// Reset
		this.active = false;
		this.hasPassed = false;

		// Reset of sprite
		this.up.reset();
		this.down.reset();
	}

	generatePillarPair() {
		// Create a pillar pair, one down one up
		this.up = new Pillar('up');
		this.down = new Pillar('down');
	}

	update(delta) {
		if (this.up.sprite && !this.hasPassed) {
			// Check if the bird has passed the pillar
			if (Game.bird && Game.bird.sprite && Game.bird.sprite.position.x >= this.up.sprite.x - this.up.sprite.width / 2) {
				// Increase the score
				Game.score.value++;

				// Mark the pillar pair as passed
				this.hasPassed = true;
			}
		}

		// Update
		this.up.update(delta);
		this.down.update(delta);
	}
}
