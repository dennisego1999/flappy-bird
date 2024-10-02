import { Sprite } from 'pixi.js';
import { getRandomInt } from '@js/Helpers/index.js';
import Game from '@js/Classes/Game.js';

export default class Pillar {
	constructor(direction = 'down') {
		// Set variables
		this.sprite = null;
		this.direction = direction;
		this.yOffset = getRandomInt(0, this.direction === 'down' ? -150 : 150);

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

		// Set initial x, y position
		this.sprite.x = window.innerWidth + this.sprite.width;
		this.sprite.y += this.yOffset;

		// Set anchor to center
		this.sprite.anchor.set(0.5, 0);

		// Set rotation according to direction
		this.sprite.rotation = this.direction === 'down' ? Math.PI : 0;

		// Add to container
		Game.app.stage.addChild(this.sprite);
	}

	setVerticalPosition() {
		if (this.direction === 'down') {
			// The 'up' sprite is positioned at the top of the canvas, offset by its height
			this.sprite.position.y = this.sprite.height + this.yOffset;

			return;
		}

		// Set offset height
		const offsetHeight = Game.baseDefault.height;

		// The 'down' sprite is positioned just above the base
		this.sprite.position.y = window.innerHeight - this.sprite.height - offsetHeight + this.yOffset;
	}

	update(delta) {
		if (!this.sprite) {
			// Early return
			return;
		}

		// Update position using delta time for consistent speed
		this.sprite.position.x -= Game.gameSpeed * delta;

		// Set vertical position
		this.setVerticalPosition();
	}

	reset() {
		// Set initial x position
		this.sprite.x = window.innerWidth + this.sprite.width;
	}

	destroy() {
		// Destroy the pillar's sprite
		this.sprite.destroy();
	}
}
