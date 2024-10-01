import { ref } from 'vue';
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
		this.baseDefault = null;
		this.baseExtra = null;
		this.pillarPairs = [];
		this.oldCanvasWidth = window.innerWidth;
		this.pillarTexture = null;
		this.pillarSpawnDistance = null;
		this.pillarBaseDistance = 300;
		this.baseSpeed = 1;
		this.gameSpeed = null;
		this.difficultyMultiplier = 1;
		this.bird = null;
		this.birdControls = null;
		this.score = ref(0);
		this.isGameOver = ref(false);
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
						// Update bird
						this.updateBird();

						if (this.isGameOver.value) {
							// Game over
							return;
						}

						// Update pillars
						this.updatePillars();

						// Update infinite base
						this.updateBase();
					}
				});

				// Setup stats
				this.setupStats();

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
		// Add base texture
		const baseTexture = await Assets.load('/assets/sprites/base.webp');

		// Create two base sprites for the infinite scrolling effect
		this.baseDefault = Sprite.from(baseTexture);
		this.baseDefault.zIndex = 50;
		this.baseDefault.name = 'base-asset-1';

		this.baseExtra = Sprite.from(baseTexture);
		this.baseExtra.zIndex = 50;
		this.baseExtra.name = 'base-asset-2';

		// Position the base sprites at the bottom of the canvas
		this.baseDefault.y = window.innerHeight - this.baseDefault.height;
		this.baseDefault.x = 0;

		// Set initial position
		this.baseExtra.y = window.innerHeight - this.baseExtra.height;
		this.baseExtra.x = window.innerWidth;

		// Add to stage container
		this.app.stage.addChild(this.baseDefault);
		this.app.stage.addChild(this.baseExtra);
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

	updateBase() {
		// Move the base sprites left according to the speed
		this.baseDefault.x -= this.gameSpeed;
		this.baseExtra.x -= this.gameSpeed;

		// If the first base sprite goes off-screen, reset its position
		if (this.baseDefault.x + this.baseDefault.width < 0) {
			// Position it next to the second base
			this.baseDefault.x = this.baseExtra.x + this.baseExtra.width;
		}

		// If the second base sprite goes off-screen, reset its position
		if (this.baseExtra.x + this.baseExtra.width < 0) {
			// Position it next to the first base
			this.baseExtra.x = this.baseDefault.x + this.baseDefault.width;
		}
	}

	updatePillars() {
		if (this.pillarPairs.length === 0) {
			// If there are no pillars, spawn the first one
			this.spawnPillarPair();

			return;
		}

		this.pillarPairs.forEach((pillarPair, index) => {
			// Increase pillar movement speed based on difficulty
			this.gameSpeed = this.baseSpeed * this.difficultyMultiplier;
			pillarPair.update();

			// Remove off-screen pillars
			if (!pillarPair.up.sprite || !pillarPair.down.sprite) {
				// Clean up destroyed pillar pairs
				this.pillarPairs.splice(index, 1);
			}

			if (pillarPair.up.sprite && !pillarPair.hasPassed) {
				// Check if the bird has passed the pillar
				if (this.bird.sprite.position.x >= pillarPair.up.sprite.x - pillarPair.up.sprite.width / 2) {
					// Increase the score
					this.score.value++;

					// Mark the pillar pair as passed
					pillarPair.hasPassed = true;

					// Adjust difficulty dynamically after each pass
					this.adjustDifficulty();
				}
			}
		});

		// Dynamically adjust pillar spawn distance and speed
		this.adjustDifficulty();

		// Spawn a new pillar if the distance is sufficient from the last pillar pair
		const lastPillarPair = this.pillarPairs[this.pillarPairs.length - 1];
		if (lastPillarPair) {
			const distanceFromEnd = window.innerWidth - lastPillarPair.up.sprite.x;
			if (distanceFromEnd >= this.pillarSpawnDistance) {
				this.spawnPillarPair();
			}
		}
	}

	adjustDifficulty() {
		// Increase the difficulty multiplier as the score increases
		this.difficultyMultiplier = 1 + (this.score.value / 10) * 0.5;

		// Calculate the spawn distance multiplier
		const spawnDistanceMultiplier = Math.max(0.2, Math.min(1, 1 - (this.score.value / 10) * 0.5));

		// Update spawn distance
		this.pillarSpawnDistance = this.pillarBaseDistance * spawnDistanceMultiplier;
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
		this.baseDefault.width = window.innerWidth;
		this.baseDefault.height = window.innerWidth / baseAspectRatio;
		this.baseExtra.width = window.innerWidth;
		this.baseExtra.height = window.innerWidth / baseAspectRatio;

		// Position the base at the bottom of the canvas
		this.baseDefault.y = window.innerHeight - this.baseDefault.height;
		this.baseExtra.y = window.innerHeight - this.baseExtra.height;
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

		// Destroy the app, the renderer and all it's children
		this.app.destroy(true, { children: true });
	}
}

export default new Game();
