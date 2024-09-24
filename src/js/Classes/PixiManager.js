import * as PIXI from 'pixi.js';

export default class Game {
	constructor(canvasId) {
		this.canvasId = canvasId;
		this.canvas = null;
		this.canvasDimensions = null;
		this.app = null;
		this.ticker = PIXI.Ticker.shared;
		this.animateFrameId = null;
		this.renderer = new PIXI.WebGLRenderer();
		this.fps = 1000 / 60;
		this.then = null;
		this.renderAction = null;
	}

	async createPixiApp() {
		// Set the canvas
		this.canvas = document.getElementById(this.canvasId);

		// Set canvas dimensions
		this.canvasDimensions = this.canvas.getBoundingClientRect();

		// Create pixi app
		this.app = new PIXI.Application();

		// Init the application
		await this.app.init({
			width: this.canvasDimensions.width,
			height: this.canvasDimensions.height,
			canvas: this.canvas
		});

		// Set resizeTo app canvas
		this.app.resizeTo = this.app.canvas;

		// Make stage children sortable
		this.app.stage.sortableChildren = true;
		this.app.stage.sortChildren();

		// Make sure stage is interactive
		this.app.stage.interactive = true;
	}

	destroy() {
		// Stop rendering
		cancelAnimationFrame(this.animateFrameId);

		// Destroy the application
		this.app.destroy();
	}

	startRendering() {
		// Start rendering
		this.app.start();
		this.animate(performance.now());
	}

	setupRender(options) {
		// Set render action
		this.renderAction = options?.action;

		// Don't start rendering
		this.ticker.autoStart = false;

		// Stop the shared ticker
		this.ticker.stop();
	}

	render(time) {
		// Render the app
		this.ticker.update(time);

		// Render render action
		if (this.renderAction) {
			this.renderAction();
		}
	}

	animate(time) {
		const now = Date.now();
		const delta = now - this.then;

		if (delta > this.fps) {
			this.then = now - (delta % this.fps);

			// Render
			this.render(time);
		}

		// Request the animation frame
		this.animateFrameId = requestAnimationFrame(this.animate.bind(this));
	}
}
