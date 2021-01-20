import { appendCountDown } from "./utils";

export type AdvertiseOption = {
	scene: g.Scene;
	panel: g.E;
	enabledAsset: g.ImageAsset;
	disabledAsset: g.ImageAsset;
	opacity: number;
	barHeight: number;
	barColor: string;
	coolDown: number;
	onAdvertise: (a: Advertise) => void;
};

export class Advertise {
	private _scene: g.Scene;
	private _panel: g.E;
	private _opacity: number;
	private _barHeight: number;
	private _barColor: string;
	private _coolDown: number;
	private _isCoolDown: boolean;
	private _onAdvertise: (a: Advertise) => void;

	constructor(opts: AdvertiseOption) {
		this._isCoolDown = false;
		this._coolDown = opts.coolDown;
		this._onAdvertise = opts.onAdvertise;

		this._scene = opts.scene;
		this._panel = opts.panel;
		this._opacity = opts.opacity;
		this._barHeight = opts.barHeight;
		this._barColor = opts.barColor;
		const enabledSprite = new g.Sprite({
			scene: opts.scene,
			parent: opts.panel,
			src: opts.enabledAsset,
			touchable: true
		});
		const disabledSprite = new g.Sprite({
			scene: opts.scene,
			parent: opts.panel,
			src: opts.disabledAsset,
			touchable: true
		});
		disabledSprite.hide();

		enabledSprite.onPointUp.add(() => {
			if (!this._isCoolDown) {
				const coolDownBar = new g.FilledRect({
					scene: this._scene,
					parent: this._panel,
					width: enabledSprite.width,
					height: this._barHeight,
					y: enabledSprite.height - this._barHeight,
					cssColor: this._barColor
				});
				appendCountDown({
					onStart: () => {
						this._isCoolDown = true;
						enabledSprite.hide();
						disabledSprite.show();
						this._onAdvertise(this);
					},
					onCount: (cnt: number) => {
						coolDownBar.width = enabledSprite.width * cnt / this._coolDown;
						coolDownBar.modified();
					},
					onEnd: () => {
						this._isCoolDown = false;
						enabledSprite.show();
						disabledSprite.hide();
						coolDownBar.destroy();
					}
				}, this._coolDown, this._panel);
			}
		});
	}
}
