import * as PIXI from 'pixi.js';
import Stats from 'stats.js/src/Stats.js';

export default class Game {
	constructor() {
		this.canvas = null;
		this.app = null;
		this.ticker = PIXI.Ticker.shared;
		this.animateFrameId = null;
		this.renderer = new PIXI.WebGLRenderer();
		this.fps = 1000 / 60;
		this.then = null;
		this.renderAction = null;
		this.stats = new Stats();
	}

	async createPixiApp(canvasId) {
		// Set the canvas
		this.canvas = document.getElementById(canvasId);

		// Create pixi app
		this.app = new PIXI.Application();

		// Init the application
		await this.app.init({
			width: window.innerWidth,
			height: window.innerHeight,
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

	setupStats() {
		// Panel settings => show fps
		this.stats.showPanel(0);

		// Add to body
		document.body.appendChild(this.stats.dom);
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

	render(delta) {
		// Render the app
		this.ticker.update();

		console.log(delta);

		// Render render action
		if (this.renderAction) {
			this.renderAction(delta);
		}
	}

	animate() {
		const now = Date.now();
		const delta = now - this.then;

		if (delta > this.fps) {
			this.then = now - (delta % this.fps);

			// Stats begin
			this.stats.begin();

			// Render
			this.render(delta / 1000);

			// Stats end
			this.stats.end();
		}

		// Request the animation frame
		this.animateFrameId = requestAnimationFrame(this.animate.bind(this));
	}
}
