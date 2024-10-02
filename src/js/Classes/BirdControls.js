import Game from '@js/Classes/Game.js';

export default class BirdControls {
	constructor() {}

	connect() {
		// Add event listeners for key press and mouse click
		window.addEventListener('keydown', this.flap);
		window.addEventListener('mousedown', this.flap);
	}

	disconnect() {
		// Remove event listeners when the controls are disconnected
		window.removeEventListener('keydown', this.flap);
		window.removeEventListener('mousedown', this.flap);
	}

	// Flap the bird when space is pressed or mouse is clicked
	flap(event) {
		// Check if the event is a spacebar press or a mouse click
		if (event.type === 'keydown' && event.code === 'Space') {
			Game.bird.flap();
		}

		if (event.type === 'mousedown') {
			Game.bird.flap();
		}
	}
}
