import { appendCountDown } from "./utils";

export type Contents = {
	messages: string[];
	rate: number;
};

export type TweeterOption = {
	scene: g.Scene;
	rand: g.RandomGenerator;
	panel: g.E;
	asset: g.ImageAsset;
	font: g.Font;
	size: number;
	position: () => { x: number; y: number };
	effect: number;
	coolDown: number;
	delay: number;
	events: {
		start: Contents;
		normal: Contents;
		collabo: Contents;
		advertise: Contents;
		end: Contents;
	};
};

export class Tweeter {
	private _scene: g.Scene;
	private _rand: g.RandomGenerator;
	private _panel: g.E;
	private _sprite: g.Sprite;
	private _label: g.Label;
	private _position: () => { x: number; y: number };
	private _effect: number;
	private _effect_count: number;
	private _coolDown: number;
	private _coolDown_count: number;
	private _delay: number;
	private _delay_count: number;
	private _event: {
		start: Contents;
		normal: Contents;
		collabo: Contents;
		advertise: Contents;
		end: Contents;
	};
	constructor(opts: TweeterOption) {
		this._scene = opts.scene;
		this._rand = opts.rand;
		this._panel = opts.panel;
		this._position = opts.position;
		this._effect = opts.effect;
		this._effect_count = 0;
		this._coolDown = opts.coolDown;
		this._coolDown_count = 0;
		this._delay = opts.delay;
		this._delay_count = 0;
		this._event = opts.events;

		const pos = opts.position();

		this._sprite = new g.Sprite({
			scene: opts.scene,
			parent: opts.panel,
			src: opts.asset,
			x: pos.x,
			y: pos.y - opts.asset.height
		});
		this._sprite.hide();

		this._label = new g.Label({
			scene: opts.scene,
			parent: this._sprite,
			font: opts.font,
			text: "",
			fontSize: opts.size,
		});
	}

	start(): void {
		if (this._coolDown_count === 0 && this._event.start.rate < this._rand.generate()) {
			this.tweet(this._event.start.messages);
		}
	}

	kill(): void {
		this._label.destroy();
		this._sprite.destroy();
	}

	private tweet(msgs: string[]): void {
		// coolDown
		appendCountDown({
			onStart: () => {
				this._coolDown_count = this._coolDown;
			},
			onCount: () => {
				this._coolDown_count--;
			},
			onEnd: () => {
				this._coolDown_count = 0	;
			}
		}, this._coolDown, this._sprite);

		// effect after delay
		appendCountDown({
			onStart: () => {
				this._delay_count = this._delay;
			},
			onCount: () => {
				this._delay_count--;
			},
			onEnd: () => {
				this._delay_count = 0;
				appendCountDown({
					onStart: () => {
						this._effect_count = this._effect;
						this._sprite.show();
						const i = Math.floor(this._rand.generate() * msgs.length);
						this._label.text = msgs[i];
						this._label.invalidate();
					},
					onCount: () => {
						this._effect_count--;
					},
					onEnd: () => {
						this._effect_count = 0	;
					}
				}, this._effect, this._sprite);
			}
		}, this._delay * this._rand.generate(), this._sprite);
	}
}
