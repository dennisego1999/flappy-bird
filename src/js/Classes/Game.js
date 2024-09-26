import { Assets, Sprite } from 'pixi.js';
import PillarPair from '@js/Classes/PillarPair.js';
import PixiManager from '@js/Classes/PixiManager.js';
import Bird from '@js/Classes/Bird.js';

class Game extends PixiManager {
	constructor() {
		super();

		// Set variables
		this.background = null;
		this.base = null;
		this.pillarPairs = [];
		this.oldCanvasWidth = window.innerWidth;
		this.pillarTexture = null;
		this.initialIntervalTimeout = 3000;
		this.pillarGenerationInterval = null;
		this.bird = null;
	}

	init(canvasId) {
		// Create pixi app
		this.createPixiApp(canvasId).then(() => {
			// Setup scene
			this.setupScene().then(() => {
				// Do a resize
				this.resize();

				// Setup render
				this.setupRender({
					action: () => {
						if (this.pillarPairs.length !== 0) {
							// Update pillars
							this.pillarPairs.forEach((pillarPair, index) => {
								// Update pillar pair
								pillarPair.update();

								// Remove pillar pairs if they are destroyed (off-screen)
								if (!pillarPair.up.sprite || !pillarPair.down.sprite) {
									// Clean up destroyed pillar pairs
									this.pillarPairs.splice(index, 1);
								}
							});
						}
					}
				});

				// Start rendering
				this.startRendering();
			});
		});
	}

	async setupScene() {
		// Setup sprite texture
		await this.setupPillarTexture();

		// Setup background
		await this.setupBackground();

		// Setup base
		await this.setupBase();

		// Setup bird
		await this.setupBird();

		// Update ui dimensions
		this.updateUiDimensions();

		// Setup pillars
		await this.setupPillars();
	}

	async setupPillarTexture() {
		// Add sprite sprite
		this.pillarTexture = await Assets.load('/assets/sprites/pipe-green.webp');
	}

	async setupBackground() {
		// Add background sprite
		const backgroundTexture = await Assets.load('/assets/sprites/background-day.webp');
		this.background = Sprite.from(backgroundTexture);
		this.background.zIndex = 0;
		this.background.name = 'background-asset';

		// Add to stage container
		this.app.stage.addChild(this.background);
	}

	async setupBase() {
		// Add background sprite
		const baseTexture = await Assets.load('/assets/sprites/base.webp');
		this.base = Sprite.from(baseTexture);
		this.base.zIndex = 50;
		this.base.name = 'base-asset';

		// Add to stage container
		this.app.stage.addChild(this.base);
	}

	setupBird() {
		// Create a bird
		this.bird = new Bird();
	}

	setupPillars() {
		// Generate pillar pairs
		this.pillarGenerationInterval = setInterval(() => {
			const newPillarPair = new PillarPair();
			this.pillarPairs.push(newPillarPair);
		}, this.initialIntervalTimeout);
	}

	updateUiDimensions() {
		// Get aspect ratios
		const backgroundAspectRatio = 288 / 512;
		const baseAspectRatio = 336 / 112;
		const canvasAspectRatio = window.innerWidth / window.innerHeight;

		// Adjust the background size and position
		if (canvasAspectRatio >= backgroundAspectRatio) {
			// Fit to window width
			this.background.width = window.innerWidth;
			this.background.height = window.innerWidth / backgroundAspectRatio;
		} else {
			// Fit to window height
			this.background.height = window.innerHeight;
			this.background.width = window.innerHeight * backgroundAspectRatio;
		}

		// Center the background
		this.background.x = (window.innerWidth - this.background.width) / 2;
		this.background.y = (window.innerHeight - this.background.height) / 2;

		// Adjust the base size and position
		this.base.width = window.innerWidth;
		this.base.height = window.innerWidth / baseAspectRatio;

		// Position the base at the bottom of the canvas
		this.base.x = 0;
		this.base.y = window.innerHeight - this.base.height;
	}

	resize() {
		// Capture the new width of the canvas
		const newCanvasWidth = window.innerWidth;

		// Calculate the ratio between old and new width
		const widthRatio = newCanvasWidth / this.oldCanvasWidth;

		// Resize the app
		this.app.resize();

		// Update background size
		this.updateUiDimensions();

		// Update the pillars' x positions based on the width ratio
		this.pillarPairs.forEach((pillarPair) => {
			if (!pillarPair.up.sprite || !pillarPair.down.sprite) {
				// Early return
				return;
			}

			// Scale x position by the width ratio
			pillarPair.up.sprite.position.x *= widthRatio;
			pillarPair.down.sprite.position.x *= widthRatio;
		});

		// Update the old canvas width for future resizes
		this.oldCanvasWidth = newCanvasWidth;
	}

	destroy() {
		// Destroy the game
	}
}

export default new Game();
