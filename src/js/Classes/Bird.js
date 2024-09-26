import { AnimatedSprite, Assets } from 'pixi.js';
import Game from '@js/Classes/Game.js';

export default class Bird {
	constructor() {
		this.sprite = null;

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

	update() {}
}
