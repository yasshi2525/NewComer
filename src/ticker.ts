import { appendCountDown } from "./utils";

export type TickerOption = {
	scene: g.Scene;
	font: g.Font;
	size: number;
	panel: g.E;
	x: number;
	y: number;
	fps: number;
	time: number;
	onEnd: () => void;
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
			text: toText(this._remain, opts.fps),
		});

		appendCountDown({
			onCount: (cnt) => {
				this._remain--;
				const old = label.text;
				label.text = toText(this._remain, opts.fps);
				if (old !== label.text) {
					label.invalidate();
				}
			},
			onEnd: () => {
				opts.onEnd();
			}
		}, opts.time * opts.fps, opts.panel);
	}

	get isEnd(): boolean {
		return this._remain === 0;
	}
}

function toText(frame: number, fps: number): string {
	return `残り:${("   "+Math.floor(frame / fps)).slice(-3)}秒`;
}
