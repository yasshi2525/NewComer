import { Scorer } from "./scorer";

export type CollaboOption = {
	scene: g.Scene;
	panel: g.E;
	asset: g.ImageAsset;
	opacity: number;
	barHeight: number;
	barColor: string;
	rate: number;
	boost: number;
	effect: number;
	minScore: number;
	coolDown: number;
	scorer: Scorer;
	onStart: (c: Collabo) => void;
	onCollabo: (c: Collabo) => void;
	onEnd: (c: Collabo) => void;
};

export class Collabo {
	private _scene: g.Scene;
	private _panel: g.E;
	private _sprite: g.Sprite;
	private _opacity: number;
	private _barHeight: number;
	private _barColor: string;
	private _rate: number;
	private _boost: number;
	private _effect: number;
	private _effect_count: number;
	private _minScore: number;
	private _coolDown: number;
	private _coolDown_count: number;
	private _scorer: Scorer;
	private _onStart: (c: Collabo) => void;
	private _onCollabo: (c: Collabo) => void;
	private _onEnd: (c: Collabo) => void;

	constructor(opts: CollaboOption) {
		this._rate = opts.rate;
		this._boost = opts.boost;
		this._effect = opts.effect;
		this._effect_count = 0;
		this._minScore = opts.minScore;
		this._coolDown = opts.coolDown;
		this._coolDown_count = 0;
		this._scorer = opts.scorer;
		this._onStart = opts.onStart;
		this._onCollabo = opts.onCollabo;
		this._onEnd = opts.onEnd;

		this._scene = opts.scene;
		this._panel = opts.panel;
		this._opacity = opts.opacity;
		this._barHeight = opts.barHeight;
		this._barColor = opts.barColor;
		this._sprite = new g.Sprite({
			scene: opts.scene,
			src: opts.asset,
			touchable: true
		});
		this._sprite.onPointUp.add(() => {
			if (this._scorer.value >= this._minScore && this._coolDown_count === 0) {
				this._coolDown_count = this._coolDown;
				this._effect_count = this._effect;
				this._onStart(this);

				const coolDownBar = new g.FilledRect({
					scene: this._scene,
					parent: this._panel,
					width: this._sprite.width,
					height: this._barHeight,
					y: this._sprite.height - this._barHeight,
					cssColor: this._barColor
				});

				const effect = (): void => {
					if (this._effect_count <= 0) {
						this._onEnd(this);
						this._panel.onUpdate.remove(effect);
						return;
					}
					this._onCollabo(this);
					this._effect_count--;
				};
				this._panel.onUpdate.add(effect);

				const coolDown = (): void => {
					if (this._coolDown_count <= 0) {
						this._sprite.opacity = 1.0;
						this._sprite.modified();
						coolDownBar.destroy();
						this._panel.onUpdate.remove(coolDown);
						return;
					}
					coolDownBar.width = this._sprite.width * this._coolDown_count / this._coolDown;
					coolDownBar.modified();
					this._coolDown_count--;
				};
				this._panel.onUpdate.add(coolDown);

				this._sprite.opacity = this._opacity;
				this._sprite.modified();
			}
		});
		this._panel.append(this._sprite);
	}

	get rate(): number {
		return this._rate;
	}

	get boost(): number {
		return this._boost;
	}

	get effect(): number {
		return this._effect;
	}
}
