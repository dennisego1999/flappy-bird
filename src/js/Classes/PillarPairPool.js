import PillarPair from '@js/Classes/PillarPair.js';

export default class PillarPairPool {
	constructor() {
		this.pool = [];
	}

	get() {
		// Reuse pillar pair
		if (this.pool.length > 0) {
			// Get last pillar pair
			const pillarPair = this.pool.pop();

			// Call init function
			pillarPair.init();

			// Return pair
			return pillarPair;
		}

		// Create new pillar pair
		const newPillarPair = new PillarPair();

		// Call init function
		newPillarPair.init();

		// Return pair
		return newPillarPair;
	}

	return(pillarPair) {
		if (!pillarPair) {
			return;
		}

		// Reset the pillar pair
		pillarPair.reset();

		// Add it back to the pool
		this.pool.push(pillarPair);
	}
}
