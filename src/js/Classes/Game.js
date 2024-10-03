import { ref } from 'vue';
import { Assets, Sprite } from 'pixi.js';
import PixiManager from '@js/Classes/PixiManager.js';
import Bird from '@js/Classes/Bird.js';
import BirdControls from '@js/Classes/BirdControls.js';
import PillarPairPool from '@js/Classes/PillarPairPool.js';

class Game extends PixiManager {
	constructor() {
		super();

		// Set variables
		this.background = null;
		this.baseDefault = null;
		this.baseExtra = null;
		this.pillarPairs = [];
		this.oldCanvasWidth = null;
		this.canvasDimensions = null;
		this.pillarTexture = null;
		this.pillarSpawnDistance = null;
		this.pillarBaseDistance = 300;
		this.baseSpeed = 100;
		this.gameSpeed = null;
		this.difficultyMultiplier = 1;
		this.bird = null;
		this.birdControls = null;
		this.score = ref(0);
		this.isGameOver = ref(false);
		this.pillarPairPool = null;
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
					action: (delta) => {
						// Update bird
						this.updateBird();

						if (this.isGameOver.value) {
							// Game over
							return;
						}

						// Update pillars
						this.updatePillars(delta);

						// Update infinite base
						this.updateBase(delta);
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
		// Get canvas dimensions
		this.canvasDimensions = this.app.canvas.getBoundingClientRect();

		// Set old canvasWidth
		this.oldCanvasWidth = this.canvasDimensions.width;

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

		// Create pillar pool
		this.pillarPairPool = new PillarPairPool();
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
		this.baseDefault.y = this.canvasDimensions.height - this.baseDefault.height;
		this.baseDefault.x = 0;

		// Set initial position
		this.baseExtra.y = this.canvasDimensions.height - this.baseExtra.height;
		this.baseExtra.x = this.canvasDimensions.width;

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

	updateBase(delta) {
		// Move the base sprites left according to the speed
		this.baseDefault.x -= this.gameSpeed * delta;
		this.baseExtra.x -= this.gameSpeed * delta;

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

	updatePillars(delta) {
		if (this.pillarPairs.length === 0) {
			// If there are no pillars, spawn the first one
			this.spawnPillarPair();

			return;
		}

		// Set game speed according to score
		this.gameSpeed = this.baseSpeed * this.difficultyMultiplier;

		// Update pillar pairs
		for (let [index, pillarPair] of this.pillarPairs.entries()) {
			// Update pillar pair
			pillarPair.update(delta);

			if (pillarPair.active && pillarPair.up.sprite.position.x <= -pillarPair.up.sprite.width) {
				// Pillar has exceeded viewport boundary => Return to pool
				this.pillarPairPool.return(pillarPair);

				// Remove the pillar pair to the stage
				this.app.stage.removeChild(pillarPair.up.sprite);
				this.app.stage.removeChild(pillarPair.down.sprite);

				// Clean up destroyed pillar pairs when pair has exceeded viewport
				this.pillarPairs.splice(index, 1);
			}
		}

		// Adjust difficulty
		this.adjustDifficulty();

		// Spawn a new pillar if the distance is sufficient from the last pillar pair
		const lastPillarPair = this.pillarPairs[this.pillarPairs.length - 1];
		if (lastPillarPair) {
			const distanceFromEnd = this.canvasDimensions.width - lastPillarPair.up.sprite.x;
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
		// Get a pair from pool
		const newPillarPair = this.pillarPairPool.get();
		this.pillarPairs.push(newPillarPair);

		// Add the pillar pair to the stage
		this.app.stage.addChild(newPillarPair.up.sprite);
		this.app.stage.addChild(newPillarPair.down.sprite);
	}

	updateUiDimensions() {
		// Capture the new width of the canvas
		const newCanvasWidth = this.canvasDimensions.width;

		// Calculate the ratio between old and new width
		const widthRatio = newCanvasWidth / this.oldCanvasWidth;

		console.log(widthRatio);

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
		this.baseDefault.width = this.canvasDimensions.width;
		this.baseDefault.height = this.canvasDimensions.width / baseAspectRatio;
		this.baseExtra.width = this.canvasDimensions.width;
		this.baseExtra.height = this.canvasDimensions.width / baseAspectRatio;

		// Position the base at the bottom of the canvas
		this.baseDefault.x = 0;
		this.baseExtra.x = this.canvasDimensions.width;
		this.baseDefault.y = this.canvasDimensions.height - this.baseDefault.height;
		this.baseExtra.y = this.canvasDimensions.height - this.baseExtra.height;

		// Update the pillars' x positions based on the width ratio
		this.pillarPairs.forEach((pillarPair) => {
			// Scale x position by the width ratio
			pillarPair.up.sprite.position.x *= widthRatio;
			pillarPair.down.sprite.position.x *= widthRatio;

			pillarPair.up.setVerticalPosition();
			pillarPair.down.setVerticalPosition();
		});

		// Update the old canvas width for future resizes
		this.oldCanvasWidth = newCanvasWidth;
	}

	resize() {
		// Get canvas dimensions
		this.canvasDimensions = this.app.canvas.getBoundingClientRect();

		// Resize the app
		this.app.resize();

		// Update background size
		this.updateUiDimensions();
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
