import { Sprite } from 'pixi.js';
import Game from '@js/Classes/Game.js';

export default class Pillar {
	constructor(direction = 'down') {
		// Set variables
		this.sprite = null;
		this.direction = direction;

		// Create pixi app
		this.setupPillar();
	}

	async setupPillar() {
		// Create sprite
		this.sprite = Sprite.from(Game.pillarTexture);
		this.sprite.zIndex = 10;
		this.sprite.name = 'sprite';

		// Set width
		this.sprite.width = 80;

		// Set initial x position
		this.sprite.x = window.innerWidth + this.sprite.width;

		// Set anchor to center
		this.sprite.anchor.set(0.5, 0);

		// Set rotation according to direction
		this.sprite.rotation = this.direction === 'down' ? Math.PI : 0;

		// Add to container
		Game.app.stage.addChild(this.sprite);
	}

	update() {
		if (!this.sprite) {
			// Early return
			return;
		}

		// Set speed factor
		const speedFactor = 1;

		// Update position
		this.sprite.position.x -= speedFactor;

		if (this.sprite.position.x <= -this.sprite.width) {
			// Pillar has exceeded viewport boundary => destroy the sprite
			Game.app.stage.removeChild(this.sprite);
			this.sprite.destroy();
			this.sprite = null;

			return;
		}

		if (this.direction === 'down') {
			// The 'up' sprite is positioned at the top of the canvas, offset by its height
			this.sprite.position.y = this.sprite.height;

			return;
		}

		// Set offset height
		const base = Game.app.stage.children.find((child) => child.name === 'base-asset');
		const offsetHeight = base.height;

		// The 'down' sprite is positioned just above the base
		this.sprite.position.y = window.innerHeight - this.sprite.height - offsetHeight;
	}

	destroy() {
		// Destroy the pillar's sprite
		this.sprite.destroy();
	}
}
