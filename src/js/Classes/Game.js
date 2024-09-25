import { Assets, Sprite } from 'pixi.js';
import PixiManager from '@js/Classes/PixiManager.js';

export default class Game extends PixiManager {
	constructor(canvasId) {
		super(canvasId);

		// Set variables
		this.background = null;
		this.base = null;

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
		this.background.zIndex = 0;

		// Add background sprite
		const baseTexture = await Assets.load('/assets/sprites/base.webp');
		this.base = Sprite.from(baseTexture);
		this.base.zIndex = 1;

		// Update ui dimensions
		this.updateUiDimensions();

		// Add to stage container
		this.app.stage.addChild(this.background);
		this.app.stage.addChild(this.base);
	}

	updateUiDimensions() {
		// Get aspect ratios
		const backgroundAspectRatio = 288 / 512;
		const baseAspectRatio = 336 / 112;
		const canvasAspectRatio = this.canvasDimensions.width / this.canvasDimensions.height;

		// Adjust the background size and position
		if (canvasAspectRatio >= backgroundAspectRatio) {
			// Fit to window width
			this.background.width = this.canvasDimensions.width;
			this.background.height = this.canvasDimensions.width / backgroundAspectRatio;
		} else {
			// Fit to window height
			this.background.height = this.canvasDimensions.height;
			this.background.width = this.canvasDimensions.height * backgroundAspectRatio;
		}

		// Center the background
		this.background.x = (this.canvasDimensions.width - this.background.width) / 2;
		this.background.y = (this.canvasDimensions.height - this.background.height) / 2;

		// Adjust the base size and position
		this.base.width = this.canvasDimensions.width;
		this.base.height = this.canvasDimensions.width / baseAspectRatio;

		// Position the base at the bottom of the canvas
		this.base.x = 0;
		this.base.y = this.canvasDimensions.height - this.base.height;
	}

	resize() {
		// Set canvas dimensions
		this.canvasDimensions = this.canvas.getBoundingClientRect();

		// Resize the app
		this.app.resize();

		// Update background size
		this.updateUiDimensions();
	}
}
