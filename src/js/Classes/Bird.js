import { ref } from 'vue';
import { AnimatedSprite, Assets } from 'pixi.js';
import Game from '@js/Classes/Game.js';

export default class Bird {
	constructor() {
		this.sprite = null;
		this.velocity = 0; // Bird's vertical velocity
		this.gravity = 0.6; // Gravity force applied each frame
		this.flapPower = -8; // Power applied when the bird flaps (negative because it moves upward)

		// Init
		this.init();
	}

	async init() {
		// Load the spritesheet assets
		await Assets.load([
			'/assets/spritesheets/yellow-bird-fly/yellow-bird-fly.json',
			'/assets/spritesheets/yellow-bird-fly/yellow-bird-fly.png'
		]);

		// Get animations
		const animations = Assets.cache.get('/assets/spritesheets/yellow-bird-fly/yellow-bird-fly.json').animations;

		// Create animated sprite
		this.sprite = new AnimatedSprite(animations['yellow-bird-fly']);

		// Set the animation speed
		this.sprite.animationSpeed = 0.1666;

		// Set z-index
		this.sprite.zIndex = 9999;

		// Set initial position
		this.sprite.position.y = window.innerHeight / 2;
		this.sprite.position.x = window.innerWidth * 0.25;

		// Play the animation on a loop
		this.sprite.play();

		// Add to container
		Game.app.stage.addChild(this.sprite);
	}

	flap() {
		if (!Game.isGameOver.value) {
			// Apply flap power to the velocity
			this.velocity = this.flapPower;
		}
	}

	handleCollision() {
		// Mark the bird as hit
		Game.isGameOver.value = true;
	}

	update() {
		if (!this.sprite) {
			return;
		}

		if (!Game.isGameOver.value) {
			// Normal update logic when bird hasn't hit anything
			this.velocity += this.gravity;
			this.sprite.position.y += this.velocity;
		} else {
			// After a hit, make the bird fall to the ground
			this.velocity += this.gravity * 1.5;
			this.sprite.position.y += this.velocity;
		}

		// Prevent the bird from moving off the screen (top bound)
		if (this.sprite.position.y < 0) {
			/*
				Highest point met => OK
			 */

			// Set max position
			this.sprite.position.y = 0;

			// Reset velocity if hitting the top
			this.velocity = 0;
		}

		// If the bird hits the ground, stop movement
		if (this.sprite.position.y > window.innerHeight - this.sprite.height - Game.base.height) {
			/*
				Lowest point met => DEAD
			 */

			// Set min position
			this.sprite.position.y = window.innerHeight - this.sprite.height - Game.base.height;

			// Reset velocity if hitting the ground
			this.velocity = 0;

			if (!Game.isGameOver.value) {
				Game.isGameOver.value = true;
			}
		}
	}
}
