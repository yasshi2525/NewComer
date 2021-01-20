import { Scorer } from "./scorer";
import { appendCountDown } from "./utils";

export type CollaboOption = {
	scene: g.Scene;
	panel: g.E;
	lockAsset: g.ImageAsset;
	lockScale: number;
	lockFont: g.Font;
	enabledAsset: g.ImageAsset;
	disabledAsset: g.ImageAsset;
	collaboScale: number;
	collaboFont: g.Font;
	collaboText: [string, string];
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
	castAsset: g.ImageAsset;
	castLayer: g.E;
	onStart: (c: Collabo) => void;
	onCollabo: (c: Collabo) => void;
	onEnd: (c: Collabo) => void;
};

export class Collabo {
	private _scene: g.Scene;
	private _panel: g.E;
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

		const lockBoard = new g.FilledRect({
			scene: opts.scene,
			parent: opts.panel,
			cssColor: opts.lockedColor,
			width: opts.panel.width,
			height: opts.panel.height,
		});

		this._lockSprite = new g.Sprite({
			scene: opts.scene,
			parent: lockBoard,
			src: opts.lockAsset,
			scaleX: opts.lockScale,
			scaleY: opts.lockScale,
			x: (lockBoard.width - opts.lockAsset.width * opts.lockScale) / 2,
			y: (lockBoard.height - opts.lockAsset.height * opts.lockScale) / 2 - opts.fontSize,
		});

		this._lockLabel = new g.Label({
			scene: opts.scene,
			parent: lockBoard,
			font: opts.lockFont,
			fontSize: opts.fontSize,
			text: `${this._minScore} 人の常連が必要です`,
		});
		this._lockLabel.x = (lockBoard.width - this._lockLabel.width) / 2;
		this._lockLabel.y = (lockBoard.height - opts.lockAsset.height * opts.lockScale) / 2 + opts.fontSize * 2;
		this._lockSprite.modified();

		const enabledSprite = new g.Sprite({
			scene: opts.scene,
			parent: this._panel,
			src: opts.enabledAsset,
			scaleX: opts.collaboScale,
			scaleY: opts.collaboScale,
			touchable: true,
		});
		enabledSprite.hide();

		const disabledSprite = new g.Sprite({
			scene: opts.scene,
			parent: this._panel,
			src: opts.disabledAsset,
			scaleX: opts.collaboScale,
			scaleY: opts.collaboScale,
		});
		disabledSprite.hide();

		const spriteOnCast = new g.Sprite({
			scene: opts.scene,
			parent: opts.castLayer,
			src: opts.castAsset,
		});
		spriteOnCast.x = (opts.castLayer.width) / 2 + spriteOnCast.width;
		spriteOnCast.y = (opts.castLayer.height - spriteOnCast.height) / 2;
		spriteOnCast.hide();

		// 得点追加による開放
		opts.scorer.observe((s) => {
			if (this._lockSprite.visible() && s.value >= this._minScore) {
				this._lockSprite.hide();
				this._lockLabel.hide();
				lockBoard.hide();
				enabledSprite.show();
			}
		});

		enabledSprite.onPointUp.add(() => {
			if (this._scorer.value >= this._minScore && !this._isCoolDown) {

				const coolDownBar = new g.FilledRect({
					scene: this._scene,
					parent: this._panel,
					width: enabledSprite.width,
					height: this._coolDownHeight,
					y: enabledSprite.height - this._coolDownHeight,
					cssColor: this._coolDownColor
				});

				appendCountDown({
					onStart: () => {
						this._isCoolDown = true;
						enabledSprite.hide();
						disabledSprite.show();
					},
					onCount: (cnt) => {
						coolDownBar.width = enabledSprite.width * cnt / this._coolDown;
						coolDownBar.modified();
					},
					onEnd: () => {
						this._isCoolDown = false;
						coolDownBar.destroy();
						enabledSprite.show();
						disabledSprite.hide();
					}
				}, this._coolDown, this._panel);

				const effectBar = new g.FilledRect({
					scene: this._scene,
					parent: this._panel,
					width: this._panel.width / 8,
					height: opts.effectHeight,
					cssColor: opts.effectColor
				});

				appendCountDown({
					onStart: () => {
						this._isEffect = true;
						spriteOnCast.show();
						this._onStart(this);
					},
					onCount: (cnt) => {
						effectBar.width = this._panel.width / 8 * cnt / this._effect;
						effectBar.modified();
						this._onCollabo(this);
					},
					onEnd: () => {
						this._isEffect = false;
						spriteOnCast.hide();
						effectBar.destroy();
						this._onEnd(this);
					}
				}, this._effect, this._panel);
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

	get isEffect(): boolean {
		return this._isEffect;
	}
}
