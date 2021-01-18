import { Scorer } from "./scorer";
import { appendCountDown } from "./utils";

export type CollaboOption = {
	scene: g.Scene;
	panel: g.E;
	asset: g.ImageAsset;
	scale: number;
	font: g.Font;
	fontSize: number;
	lockedColor: string;
	enabledColor: string;
	disabledColor: string;
	opacity: number;
	effectHeight: number;
	effectColor: string;
	coolDownHeight: number;
	coolDownColor: string;
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
	private _board: g.FilledRect;
	private _lockSprite: g.Sprite;
	private _lockLabel: g.Label;
	private _opacity: number;
	private _coolDownHeight: number;
	private _coolDownColor: string;
	private _rate: number;
	private _boost: number;
	private _effect: number;
	private _isEffect: boolean;
	private _minScore: number;
	private _coolDown: number;
	private _isCoolDown: boolean;
	private _scorer: Scorer;
	private _onStart: (c: Collabo) => void;
	private _onCollabo: (c: Collabo) => void;
	private _onEnd: (c: Collabo) => void;

	constructor(opts: CollaboOption) {
		this._rate = opts.rate;
		this._boost = opts.boost;
		this._effect = opts.effect;
		this._isEffect = false;
		this._minScore = opts.minScore;
		this._coolDown = opts.coolDown;
		this._isCoolDown = false;
		this._scorer = opts.scorer;
		this._onStart = opts.onStart;
		this._onCollabo = opts.onCollabo;
		this._onEnd = opts.onEnd;

		this._scene = opts.scene;
		this._panel = opts.panel;
		this._opacity = opts.opacity;
		this._coolDownHeight = opts.coolDownHeight;
		this._coolDownColor = opts.coolDownColor;

		this._board = new g.FilledRect({
			scene: opts.scene,
			parent: opts.panel,
			cssColor: opts.lockedColor,
			width: opts.panel.width,
			height: opts.panel.height,
			touchable: true,
			tag: "board"
		});

		this._lockSprite = new g.Sprite({
			scene: opts.scene,
			parent: this._board,
			src: opts.asset,
			scaleX: opts.scale,
			scaleY: opts.scale,
			x: (this._board.width - opts.asset.width * opts.scale) / 2,
			y: (this._board.height - opts.asset.height * opts.scale) / 2 - opts.fontSize,
		});
		this._lockLabel = new g.Label({
			scene: opts.scene,
			parent: this._board,
			font: opts.font,
			fontSize: opts.fontSize,
			text: `${this._minScore} 人の常連が必要です`,
			x: this._board.width / 8,
			y: (this._board.height - opts.asset.height * opts.scale) / 2 + opts.fontSize * 2
		});

		// 得点追加による開放
		opts.scorer.observe((s) => {
			if (this._lockSprite.visible() && s.value >= this._minScore) {
				this._lockSprite.hide();
				this._lockLabel.hide();
				this._board.cssColor = opts.enabledColor;
			}
		});

		this._board.onPointUp.add(() => {
			if (this._scorer.value >= this._minScore && !this._isCoolDown) {

				const coolDownBar = new g.FilledRect({
					scene: this._scene,
					parent: this._board,
					width: this._board.width,
					height: this._coolDownHeight,
					y: this._board.height - this._coolDownHeight,
					cssColor: this._coolDownColor
				});

				appendCountDown({
					onStart: () => {
						this._isCoolDown = true;
						this._board.cssColor = opts.disabledColor;
						this._board.modified();
						this._onStart(this);
					},
					onCount: (cnt) => {
						coolDownBar.width = this._board.width * cnt / this._coolDown;
						coolDownBar.modified();
					},
					onEnd: () => {
						this._isCoolDown = false;
						this._board.cssColor = opts.enabledColor;
						this._board.modified();
						coolDownBar.destroy();
					}
				}, this._coolDown, this._board);

				const effectBar = new g.FilledRect({
					scene: this._scene,
					parent: this._board,
					width: this._board.width / 8,
					height: opts.effectHeight,
					cssColor: opts.effectColor
				});

				appendCountDown({
					onStart: () => {
						this._isEffect = true;
					},
					onCount: (cnt) => {
						effectBar.width = this._board.width / 8 * cnt / this._effect;
						effectBar.modified();
					},
					onEnd: () => {
						this._isEffect = false;
						effectBar.destroy();
					}
				}, this._effect, this._board);
			}
		});
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
