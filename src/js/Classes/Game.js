import * as PIXI from 'pixi.js';
import PixiManager from '@js/Classes/PixiManager.js';

export default class Game extends PixiManager {
	constructor(canvasId) {
		super(canvasId);

		// Create pixi app
		this.createPixiApp().then(() => {
			// Setup scene
			this.setupScene().then(() => {
				// Do a resize
				this.resize();

				// Setup render
				this.setupRender({
					action: () => {
						console.log('rendering');
					}
				});

				// Start rendering
				this.startRendering();
			});
		});
	}

	async setupScene() {}

	resize() {
		// Set canvas dimensions
		this.canvasDimensions = this.canvas.getBoundingClientRect();

		// Resize the app
		this.app.resize();
	}
}
