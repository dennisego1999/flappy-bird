import Game from '@js/Classes/Game.js';

export default class BirdControls {
	constructor() {
		// Bind the flap method to the right context
		this.boundFlap = this.flap.bind(this);
	}

	connect() {
		// Add event listeners for key press and mouse click
		window.addEventListener('keydown', this.boundFlap);
		window.addEventListener('mousedown', this.boundFlap);
	}

	disconnect() {
		// Remove event listeners when the controls are disconnected
		window.removeEventListener('keydown', this.boundFlap);
		window.removeEventListener('mousedown', this.boundFlap);
	}

	// Flap the bird when space is pressed or mouse is clicked
	flap(event) {
		// Check if the event is a spacebar press or a mouse click
		if (event.type === 'keydown' && event.code === 'Space') {
			Game.bird.flap();
		} else if (event.type === 'mousedown') {
			Game.bird.flap();
		}
	}
}
