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
	private _isEffect: boolean;
	private _coolDown: number;
	private _isCoolDown: boolean;
	private _delay: number;
	private _isDelay: boolean;
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
		this._isEffect = false;
		this._coolDown = opts.coolDown;
		this._isCoolDown = false;
		this._delay = opts.delay;
		this._isDelay = false;
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
		if (!this._isCoolDown && this._rand.generate() < this._event.start.rate) {
			this.tweet(this._event.start.messages);
		}
	}

	normal(): void {
		if (!this._isCoolDown && this._rand.generate() < this._event.normal.rate) {
			this.tweet(this._event.normal.messages);
		}
	}

	collabo(): void {
		if (!this._isCoolDown && this._rand.generate() < this._event.collabo.rate) {
			this.tweet(this._event.collabo.messages);
		}
	}

	kill(): void {
		this._label.destroy();
		this._sprite.destroy();
		this._container.destroy();
	}

	private tweet(msgs: string[]): void {
		if (msgs.length === 0) {
			return;
		}
		// coolDown
		appendCountDown({
			onStart: () => {
				this._isCoolDown = true;
			},
			onEnd: () => {
				this._isCoolDown = false;
			}
		}, this._coolDown, this._container);

		// effect after delay
		appendCountDown({
			onStart: () => {
				this._isDelay = true;
			},
			onEnd: () => {
				this._isDelay = false;
				appendCountDown({
					onStart: () => {
						this._isEffect = true;
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
						const pos = this.position();
						this._container.x = pos.x;
						this._container.y = pos.y;
						this._container.modified();
					},
					onEnd: () => {
						this._container.hide();
						this._isEffect = false;
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
