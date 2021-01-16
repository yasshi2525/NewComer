

function toText(score: number): string {
	return `SCORE:${("   " + score).slice(-3)}`;
}

export type ScorerOption = {
	scene: g.Scene;
	font: g.Font;
	size: number;
	panel: g.E;
	x: number;
	y: number;
};

export class Scorer {
	private _score: number;
	private _label: g.Label;

	constructor(opts: ScorerOption) {
		this._score = 0;
		this._label = new g.Label({
			scene: opts.scene,
			x: opts.x,
			y: opts.y,
			font: opts.font,
			fontSize: opts.size,
			text: toText(this._score)
		});
		opts.panel.append(this._label);
	}

	add(score: number): void {
		this._score += score;
		this._label.text = toText(this._score);
		this._label.invalidate();
	}

	get value(): number {
		return this._score;
	}
}
