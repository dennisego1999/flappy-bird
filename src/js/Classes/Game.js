import { Assets, Sprite } from 'pixi.js';
import PixiManager from '@js/Classes/PixiManager.js';

export default class Game extends PixiManager {
	constructor(canvasId) {
		super(canvasId);

		// Set variables
		this.background = null;

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

	async setupScene() {
		// Add background sprite
		const backgroundTexture = await Assets.load('/assets/sprites/background-day.webp');
		this.background = Sprite.from(backgroundTexture);

		// Update background dimensions
		this.updateBackgroundDimensions();

		// Add the stage container
		this.app.stage.addChild(this.background);
	}

	updateBackgroundDimensions() {
		const backgroundAspectRatio = 288 / 512;
		const canvasAspectRatio = this.canvasDimensions.width / this.canvasDimensions.height;

		if (canvasAspectRatio >= backgroundAspectRatio) {
			// Fit to window width
			this.background.width = this.canvasDimensions.width;
			this.background.height = this.canvasDimensions.width / backgroundAspectRatio;
		} else {
			// Fit to window height
			this.background.height = this.canvasDimensions.height;
			this.background.width = this.canvasDimensions.height * backgroundAspectRatio;
		}

		// Center background in case of leftover space
		this.background.x = (this.canvasDimensions.width - this.background.width) / 2;
		this.background.y = (this.canvasDimensions.height - this.background.height) / 2;
	}

	resize() {
		// Set canvas dimensions
		this.canvasDimensions = this.canvas.getBoundingClientRect();

		// Resize the app
		this.app.resize();

		// Update background size
		this.updateBackgroundDimensions();
	}
}
