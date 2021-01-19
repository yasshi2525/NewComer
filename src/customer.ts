import { Fence } from "./fence";
import { appendCountDown } from "./utils";

export type CustomerOption = {
	rg: g.RandomGenerator;
	scene: g.Scene;
	asset: g.ImageAsset;
	successAsset: g.ImageAsset;
	failAsset: g.ImageAsset;
	successTextAsset: g.ImageAsset;
	failTextAsset: g.ImageAsset;
	panel: g.E;
	font: g.Font;
	fontSize: number;
	scale: number;
	speed: number;
	turn: number;
	isStay: boolean;
	fade: number;
	opacity: number;
	fence: Fence;
};

export class Customer {
	private _scene: g.Scene;
	private _panel: g.E;
	private _asset: g.ImageAsset;
	private _successAsset: g.ImageAsset;
	private _failAsset: g.ImageAsset;
	private _successTextAsset: g.ImageAsset;
	private _failTextAsset: g.ImageAsset;
	private _font: g.Font;
	private _fontSize: number;
	private _sprite: g.Sprite;
	private _rg: g.RandomGenerator;
	private _head: number;
	private _speed: number;
	private _turn: number;
	private _boost: number;
	private _fade: number;
	private _scale: number;
	private _isStay: boolean;
	private _opacity: number;
	private _fence: Fence;
	private _killed: boolean;

	constructor(opts: CustomerOption) {
		this._rg = opts.rg;
		this._speed = opts.speed;
		this._turn = opts.turn;
		this._boost = 1.0;
		this._fade = opts.fade;
		this._opacity = opts.opacity;
		this._scale = opts.scale;
		this._isStay = opts.isStay;
		this._fence = opts.fence;
		this._scene = opts.scene;
		this._asset = opts.asset;
		this._successAsset = opts.successAsset;
		this._failAsset = opts.failAsset;
		this._successTextAsset = opts.successTextAsset;
		this._failTextAsset = opts.failTextAsset;
		this._panel = opts.panel;
		this._font = opts.font;
		this._fontSize = opts.fontSize;

		this._sprite = this.appendSprite(
			opts.panel,
			opts.asset,
			this._rg.generate() * this._panel.width,
			this._rg.generate() * this._panel.height
		);

		this._head = this._rg.generate() * Math.PI * 2;

		this._sprite.onUpdate.add(() => {
			this.step();
		});
	}

	attract(boost: number, effect: number): void {
		this._boost += boost;
		this._sprite.opacity = this._opacity * 2;
		this._sprite.modified();

		let effectCount = effect;
		const fn = (): void => {
			if (effectCount <= 0) {
				this._boost -= boost;
				this._sprite.opacity = this._opacity;
				this._sprite.modified();
				this._sprite.onUpdate.remove(fn);
				return;
			}
			effectCount--;
		};
		this._sprite.onUpdate.add(fn);
	}

	step(): void {
		let speed = this._speed;
		if (this._boost > 1.0) {
			this._head = Math.atan2(
				this._panel.height / 2 - this._sprite.y,
				this._panel.width / 2 - this._sprite.x,
			);
			const dx = this._sprite.x - this._panel.width / 2;
			const dy = this._sprite.y - this._panel.height / 2;
			if (Math.sqrt(dx * dx + dy * dy) < this._sprite.width * this._sprite.scaleX) {
				speed = 0;
			}
		} else {
			this._head += (this._rg.generate() - 0.5) * this._turn;
			if (this._isStay) {
				if (
					(this._sprite.x <= 0 && Math.cos(this._head) < 0)
					|| (this._sprite.x >= this._panel.width && Math.cos(this._head) > 0)
				) {
					this._head = Math.PI - this._head;
				}
				if (
					(this._sprite.y <= 0 && Math.sin(this._head) < 0)
					|| (this._sprite.y >= this._panel.height && Math.sin(this._head) > 0)
				) {
					this._head = - this._head;
				}
			}
		}
		this._sprite.x += speed * this._boost * Math.cos(this._head);
		this._sprite.y += speed * this._boost * Math.sin(this._head);
		this._sprite.modified();
	}

	reject(): void {
		const container = new g.E({
			scene: this._scene,
			parent: this._panel,
			x: this._sprite.x,
			y: this._sprite.y,
			width: this._sprite.width * this._sprite.scaleX,
			height: this._sprite.height * this._sprite.scaleY,
		});
		this.appendSprite(container, this._failAsset, 0, 0);
		const text = new g.Sprite({
			scene: this._scene,
			parent: container,
			src: this._failTextAsset,
			y: (this._sprite.height * this._sprite.scaleY) / 2
		});
		text.x = -text.width / 2;
		text.modified();
		appendCountDown({
			onCount: (cnt: number) => {
				container.x = this._sprite.x;
				container.y = this._sprite.y;
				container.opacity = cnt / this._fade;
				container.modified();
			},
			onEnd: () => {
				container.destroy();
			}
		}, this._fade, this._panel);
	}

	kill(): void {
		this._sprite.destroy();
		this._killed = true;
		const container = new g.E({
			scene: this._scene,
			parent: this._panel,
			x: this._sprite.x,
			y: this._sprite.y,
			width: this._sprite.width * this._sprite.scaleX,
			height: this._sprite.height * this._sprite.scaleY,
		});
		this.appendSprite(container, this._successAsset, 0, 0);
		const text = new g.Sprite({
			scene: this._scene,
			parent: container,
			src: this._successTextAsset,
			y: (this._sprite.height * this._sprite.scaleY) / 2
		});
		text.x = -text.width / 2;
		text.modified();
		appendCountDown({
			onCount: (cnt: number) => {
				container.opacity = cnt / this._fade;
				container.y -= container.height / this._fade;
				container.modified();
			},
			onEnd: () => {
				container.destroy();
			}
		}, this._fade, this._panel);
	}

	get killed(): boolean {
		return this._killed;
	}

	get x(): number {
		return this._sprite.x;
	}

	get y(): number {
		return this._sprite.y;
	}

	get position(): { x: number; y: number } {
		return {x: this._sprite.x, y: this._sprite.y};
	}

	set position(v: {x: number; y: number}) {
		this._sprite.x = v.x;
		this._sprite.y = v.y;
		this._sprite.modified();
	}

	get isBoost(): boolean {
		return this._boost > 1.0;
	}

	private appendSprite(parent: g.E, asset: g.ImageAsset, x: number, y: number): g.Sprite {
		return new g.Sprite({
			scene: this._scene,
			parent,
			src: asset,
			scaleX: this._scale,
			scaleY: this._scale,
			anchorX: 0.5,
			anchorY: 0.5,
			opacity: this._opacity,
			x,
			y
		});
	}
}
