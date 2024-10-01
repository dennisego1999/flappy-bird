import { Assets, Sprite } from 'pixi.js';
import PillarPair from '@js/Classes/PillarPair.js';
import PixiManager from '@js/Classes/PixiManager.js';
import Bird from '@js/Classes/Bird.js';
import BirdControls from '@js/Classes/BirdControls.js';

class Game extends PixiManager {
	constructor() {
		super();

		// Set variables
		this.background = null;
		this.base = null;
		this.pillarPairs = [];
		this.oldCanvasWidth = window.innerWidth;
		this.pillarTexture = null;
		this.pillarSpawnDistance = 300;
		this.bird = null;
		this.birdControls = null;
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
						if (this.bird && this.bird.isHit) {
							// Game over
							return;
						}

						// Update pillars
						this.updatePillars();

						// Update bird
						this.updateBird();
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
	}

	async setupPillarTexture() {
		// Add sprite texture
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
		// Add base sprite
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

		// Create bird controls and connect them
		this.birdControls = new BirdControls();
		this.birdControls.connect();
	}

	updateBird() {
		if (this.bird) {
			// Update the bird's position and state
			this.bird.update();

			// Check for collisions with pillars
			this.checkCollisions();
		}
	}

	updatePillars() {
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

			// Check if it's time to spawn a new pillar pair
			this.checkAndSpawnNewPillar();
		} else {
			// If there are no pillars, spawn the first one
			this.spawnPillarPair();
		}
	}

	checkCollisions() {
		this.pillarPairs.forEach((pillarPair) => {
			if (!this.bird.sprite) {
				return;
			}

			const birdBounds = this.bird.sprite.getBounds();
			const upPillarBounds = pillarPair.up.sprite.getBounds();
			const downPillarBounds = pillarPair.down.sprite.getBounds();

			// Check if bird collides with either the upper or lower pillar
			if (this.isColliding(birdBounds, upPillarBounds) || this.isColliding(birdBounds, downPillarBounds)) {
				this.bird.handleCollision();
			}
		});
	}

	isColliding(rect1, rect2) {
		return (
			rect1.x < rect2.x + rect2.width &&
			rect1.x + rect1.width > rect2.x &&
			rect1.y < rect2.y + rect2.height &&
			rect1.y + rect1.height > rect2.y
		);
	}

	spawnPillarPair() {
		// Create a new pillar pair and add it to the list
		const newPillarPair = new PillarPair();
		this.pillarPairs.push(newPillarPair);

		// Add the pillar pair to the stage
		this.app.stage.addChild(newPillarPair.up.sprite);
		this.app.stage.addChild(newPillarPair.down.sprite);
	}

	checkAndSpawnNewPillar() {
		// Get the last pillar pair
		const lastPillarPair = this.pillarPairs[this.pillarPairs.length - 1];

		if (lastPillarPair && lastPillarPair.up.sprite) {
			// Calculate the distance between the last pillar and the right edge of the screen
			const distanceFromEnd = window.innerWidth - lastPillarPair.up.sprite.x;

			// If the distance is less than the spawn threshold, spawn a new pillar
			if (distanceFromEnd >= this.pillarSpawnDistance) {
				this.spawnPillarPair();
			}
		}
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
		// Clean up the bird controls
		if (this.birdControls) {
			this.birdControls.disconnect();
		}

		// Destroy the game
	}
}

export default new Game();
