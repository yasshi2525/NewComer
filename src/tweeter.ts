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
	scale: number;
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
	private _container: g.E;
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
		this._position = opts.position;
		this._effect = opts.effect;
		this._effect_count = 0;
		this._coolDown = opts.coolDown;
		this._coolDown_count = 0;
		this._delay = opts.delay;
		this._delay_count = 0;
		this._event = opts.events;

		this._container = new g.E({
			scene: opts.scene,
			parent: opts.panel,
		});
		this._container.hide();

		this._sprite = new g.Sprite({
			scene: opts.scene,
			parent: this._container,
			src: opts.asset,
			scaleX: opts.scale * 2,
			scaleY: opts.scale,
		});

		this._label = new g.Label({
			scene: opts.scene,
			parent: this._container,
			font: opts.font,
			text: "",
			fontSize: opts.size,
			x: this._sprite.width * this._sprite.scaleX / 8,
			y: this._sprite.height * this._sprite.scaleY / 2 - opts.size
		});
	}

	start(): void {
		if (this._coolDown_count <= 0 && this._rand.generate() < this._event.start.rate) {
			this.tweet(this._event.start.messages);
		}
	}

	normal(): void {
		if (this._coolDown_count <= 0 && this._rand.generate() < this._event.normal.rate) {
			this.tweet(this._event.normal.messages);
		}
	}

	collabo(): void {
		if (this._coolDown_count <= 0 && this._rand.generate() < this._event.collabo.rate) {
			this.tweet(this._event.collabo.messages);
		}
	}

	kill(): void {
		this._label.destroy();
		this._sprite.destroy();
		this._container.destroy();
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
		}, this._coolDown, this._container);

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
						const pos = this.position();
						this._container.x = pos.x;
						this._container.y = pos.y;
						this._container.modified();
						this._container.show();
						const i = Math.floor(this._rand.generate() * msgs.length);
						this._label.text = msgs[i];
						this._label.invalidate();
					},
					onCount: () => {
						this._effect_count--;
						const pos = this.position();
						this._container.x = pos.x;
						this._container.y = pos.y;
						this._container.modified();
					},
					onEnd: () => {
						this._container.hide();
						this._effect_count = 0;
					}
				}, this._effect, this._container);
			}
		}, this._delay * this._rand.generate(), this._container);
	}

	private position(): { x: number; y: number } {
		const pos = this._position();
		return {
			x: pos.x - this._sprite.width / 2 * this._sprite.scaleX,
			y: pos.y - this._sprite.height * 1.5 * this._sprite.scaleY
		};
	}
}
