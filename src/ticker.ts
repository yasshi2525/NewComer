export type TickerOption = {
	scene: g.Scene;
	font: g.Font;
	size: number;
	panel: g.E;
	x: number;
	y: number;
	fps: number;
	time: number;
};

export class Ticker {
	private _remain: number;
	private _fps: number;
	constructor(opts: TickerOption) {
		this._remain = opts.time * opts.fps;
		this._fps = opts.fps;

		const label = new g.Label({
			scene: opts.scene,
			parent: opts.panel,
			x: opts.x,
			y: opts.y,
			font: opts.font,
			fontSize: opts.size,
			text: this.toText(),
		});

		opts.panel.onUpdate.add(() => {
			const old = label.text;
			label.text = this.toText();
			if (old !== label.text) {
				label.invalidate();
			}
			this._remain--;
		});
	}

	private toText(): string {
		return `TIME:${("   "+Math.floor(this._remain / this._fps)).slice(-3)}`;
	}
}
