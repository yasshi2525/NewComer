import { appendCountDown } from "./utils";

export type AdvertiseOption = {
	scene: g.Scene;
	panel: g.E;
	asset: g.ImageAsset;
	opacity: number;
	barHeight: number;
	barColor: string;
	coolDown: number;
	onAdvertise: (a: Advertise) => void;
};

export class Advertise {
	private _scene: g.Scene;
	private _panel: g.E;
	private _sprite: g.Sprite;
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
		this._sprite = new g.Sprite({
			scene: opts.scene,
			parent: opts.panel,
			src: opts.asset,
			touchable: true
		});
		this._sprite.onPointUp.add(() => {
			if (!this._isCoolDown) {
				const coolDownBar = new g.FilledRect({
					scene: this._scene,
					parent: this._panel,
					width: this._sprite.width,
					height: this._barHeight,
					y: this._sprite.height - this._barHeight,
					cssColor: this._barColor
				});
				appendCountDown({
					onStart: () => {
						this._isCoolDown = true;
						this._sprite.opacity = this._opacity;
						this._onAdvertise(this);
					},
					onCount: (cnt: number) => {
						coolDownBar.width = this._sprite.width * cnt / this._coolDown;
						coolDownBar.modified();
					},
					onEnd: () => {
						this._isCoolDown = false;
						this._sprite.opacity = 1.0;
						this._sprite.modified();
						coolDownBar.destroy();
					}
				}, this._coolDown, this._panel);
			}
		});
	}
}
