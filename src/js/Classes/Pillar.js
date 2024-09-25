import { Assets, Sprite } from 'pixi.js';

export default class Pillar {
	constructor(container, direction = 'down') {
		// Set variables
		this.container = container;
		this.sprite = null;
		this.direction = direction;

		// Create pixi app
		this.setupPillar();
	}

	async setupPillar() {
		// Add sprite sprite
		const spriteTexture = await Assets.load('/assets/sprites/pipe-green.webp');
		this.sprite = Sprite.from(spriteTexture);
		this.sprite.zIndex = 10;
		this.sprite.name = 'sprite';

		// Set width
		this.sprite.width = 80;

		// Set initial x position
		this.sprite.x = window.innerWidth;

		// Set anchor to center
		this.sprite.anchor.set(0.5, 0);

		// Set rotation according to direction
		this.sprite.rotation = this.direction === 'down' ? Math.PI : 0;

		// Add to container
		this.container.addChild(this.sprite);
	}

	update() {
		if (!this.sprite) {
			// Early return
			return;
		}

		// Set speed factor
		const speedFactor = 0.5;

		// Update position
		this.sprite.position.x -= speedFactor;

		if (this.direction === 'down') {
			// The 'up' sprite is positioned at the top of the canvas, offset by its height
			this.sprite.position.y = this.sprite.height;

			return;
		}

		// Set offset height
		const base = this.container.children.find((child) => child.name === 'base-asset');
		const offsetHeight = base.height;

		// The 'down' sprite is positioned just above the base
		this.sprite.position.y = window.innerHeight - this.sprite.height - offsetHeight;
	}
}
