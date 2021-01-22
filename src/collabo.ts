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
	scorer: Scorer;
	castAsset: g.ImageAsset;
	castLayer: g.E;
	onUnlock: (c: Collabo) => void;
	onStart: (c: Collabo) => void;
	onCollabo: (c: Collabo) => void;
	onEnd: (c: Collabo) => void;
};

export class Collabo {
	private _scene: g.Scene;
	private _panel: g.E;
	private _locked: boolean;
	private _lockSprite: g.Sprite;
	private _lockLabel: g.Label;
	private _enabled: boolean;
	private _enabledSprite: g.Sprite;
	private _disabledSprite: g.Sprite;
	private _opacity: number;
	private _coolDownCount: number;
	private _coolDownBar: g.FilledRect;
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
	private _onUnlock: (c: Collabo) => void;
	private _onStart: (c: Collabo) => void;
	private _onCollabo: (c: Collabo) => void;
	private _onEnd: (c: Collabo) => void;

	constructor(opts: CollaboOption) {
		this._rate = opts.rate;
		this._boost = opts.boost;
		this._effect = opts.effect;
		this._isEffect = false;
		this._locked = true;
		this._enabled = true;
		this._minScore = opts.minScore;
		this._isCoolDown = false;
		this._scorer = opts.scorer;
		this._onUnlock = opts.onUnlock;
		this._onStart = opts.onStart;
		this._onCollabo = opts.onCollabo;
		this._onEnd = opts.onEnd;

		this._scene = opts.scene;
		this._panel = opts.panel;
		this._opacity = opts.opacity;
		this._coolDownCount = 0;
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

		this._enabledSprite = new g.Sprite({
			scene: opts.scene,
			parent: this._panel,
			src: opts.enabledAsset,
			scaleX: opts.collaboScale,
			scaleY: opts.collaboScale,
			touchable: true,
		});
		this._enabledSprite.hide();

		this._disabledSprite = new g.Sprite({
			scene: opts.scene,
			parent: this._panel,
			src: opts.disabledAsset,
			scaleX: opts.collaboScale,
			scaleY: opts.collaboScale,
		});
		this._disabledSprite.hide();

		const spriteOnCast = new g.Sprite({
			scene: opts.scene,
			parent: opts.castLayer,
			src: opts.castAsset,
		});
		spriteOnCast.x = (opts.castLayer.width) / 2 + spriteOnCast.width;
		spriteOnCast.y = (opts.castLayer.height - spriteOnCast.height) / 2;
		spriteOnCast.hide();

		this._coolDownBar = new g.FilledRect({
			scene: this._scene,
			parent: this._panel,
			width: this._enabledSprite.width,
			height: this._coolDownHeight,
			y: this._enabledSprite.height - this._coolDownHeight,
			cssColor: this._coolDownColor
		});
		this._coolDownBar.hide();

		// 得点追加による開放
		opts.scorer.observe((s) => {
			if (this._lockSprite.visible() && s.value >= this._minScore) {
				this._locked = false;
				this._lockSprite.hide();
				this._lockLabel.hide();
				lockBoard.hide();
				if (this._enabled) {
					this._enabledSprite.show();
				} else {
					this._disabledSprite.show();
				}
				if (this._coolDownCount > 0) {
					this._coolDownBar.show();
				}
				this._onUnlock(this);
			}
		});

		this._enabledSprite.onPointUp.add(() => {
			if (this._scorer.value >= this._minScore && !this._isCoolDown) {

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

	set enabled(val: boolean) {
		this._enabled = val;
		if (!this._locked) {
			if (val) {
				this._enabledSprite.show();
				this._disabledSprite.hide();
			} else {
				this._enabledSprite.hide();
				this._disabledSprite.show();
			}
		}
	}

	set coolDown(val: number) {
		this._coolDown = val;
	}

	set coolDownCount(val: number) {
		this._isCoolDown = val > 0;
		if (!this._locked && !this._coolDownBar.visible() && val > 0) {
			this._coolDownBar.show();
		}
		if (this._coolDownBar.visible() && val === 0) {
			this._coolDownBar.hide();
		}
		this._coolDownCount = val;
		this._coolDownBar.width = this._enabledSprite.width * val / this._coolDown;
		this._coolDownBar.modified();
	}
}
