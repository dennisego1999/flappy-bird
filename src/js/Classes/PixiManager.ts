import * as PIXI from 'pixi.js';

export default class Game {
	canvasId: string;
	canvas: HTMLCanvasElement;
	canvasDimensions: Object;
	app: PIXI.Application;
	ticker: PIXI.Ticker;
	animateFrameId: string;
	renderer: PIXI.CanvasRenderer
	fps: Number;
	then: Number;
	renderObject: Object;
	renderAction: Object;

	constructor(canvasId) {
		this.canvasId = canvasId;
		this.canvas = null;
		this.canvasDimensions = null;
		this.app = null;
		this.ticker = PIXI.Ticker.shared;
		this.animateFrameId = null;
		this.renderer = new PIXI.CanvasRenderer();
		this.fps = 1000 / 60;
		this.then = null;
		this.renderObject = null;
		this.renderAction = null;
	}

	createPixiApp() {
		//Set the canvas
		this.canvas = document.getElementById(this.canvasId);

		//Set canvas dimensions
		this.canvasDimensions = this.canvas.getBoundingClientRect();

		//Create pixi app
		this.app = new PIXI.Application({
			width: this.canvasDimensions.width,
			height: this.canvasDimensions.height,
			backgroundAlpha: 0,
			antialias: true,
			resolution: window.devicePixelRatio,
			forceCanvas: true,
			view: this.canvas
		});

		//Set resizeTo app canvas
		this.app.resizeTo = this.app.view;

		//Make stage children sortable
		this.app.stage.sortableChildren = true;
		this.app.stage.sortChildren();

		//Make sure stage is interactive
		this.app.stage.interactive = true;
	}

	disableRendering() {
		//Stop rendering
		this.app.stop();
		cancelAnimationFrame(this.animateFrameId);
	}

	enableRendering() {
		//Start rendering
		this.app.start();
		this.animate(performance.now());
	}

	setupRender(options) {
		//Set render object
		this.renderObject = options?.object;

		//Set render action
		this.renderAction = options?.action;

		//Don't start rendering
		this.ticker.autoStart = false;

		//Stop the shared ticker
		this.ticker.stop();
	}

	render(time) {
		//Render the app
		this.ticker.update(time);

		//Render the render object
		if (this.renderObject) {
			this.renderer.render(this.renderObject);
		}

		//Render render action
		if (this.renderAction) {
			this.renderAction();
		}
	}

	animate(time) {
		const now = Date.now();
		const delta = now - this.then;

		if (delta > this.fps) {
			this.then = now - (delta % this.fps);

			//Render
			this.render(time);
		}

		//Request the animation frame
		this.animateFrameId = requestAnimationFrame(this.animate.bind(this));
	}
}
