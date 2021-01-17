import { Fence } from "./fence";

export enum CustomerStatus {
	NUTRAL,
	ACTIVE
}

export type CustomerOption = {
	rg: g.RandomGenerator;
	width: number;
	height: number;
	scene: g.Scene;
	asset: g.ImageAsset;
	scale: number;
	speed: number;
	turn: number;
	opacity: number;
	panel: g.E;
	fence: Fence;
};

export class Customer {
	private _status: CustomerStatus;
	private _panel: g.E;
	private _sprite: g.Sprite;
	private _rg: g.RandomGenerator;
	private _w: number;
	private _h: number;
	private _head: number;
	private _speed: number;
	private _turn: number;
	private _boost: number;
	private _opacity: number;
	private _fence: Fence;
	private _killed: boolean;

	constructor(opts: CustomerOption) {
		this._rg = opts.rg;
		this._w = opts.width;
		this._h = opts.height;
		this._speed = opts.speed;
		this._turn = opts.turn;
		this._boost = 1.0;
		this._opacity = opts.opacity;
		this._fence = opts.fence;
		this._panel = opts.panel;

		this._sprite = new g.Sprite({
			scene: opts.scene,
			parent: opts.panel,
			src: opts.asset,
			scaleX: opts.scale,
			scaleY: opts.scale,
			anchorX: 0.5,
			anchorY: 0.5,
			opacity: opts.opacity
		});

		this._sprite.x = this._rg.generate() * this._w;
		this._sprite.y = this._rg.generate() * this._h;
		this._head = this._rg.generate() * Math.PI * 2;
		this._sprite.modified();

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

	get status(): CustomerStatus {
		return this._status;
	}

	step(): void {
		if (this._boost > 1.0) {
			this._head = Math.atan2(
				this._panel.height / 2 - this._sprite.y,
				this._panel.width / 2 - this._sprite.x,
			);
		} else {
			this._head += (this._rg.generate() - 0.5) * this._turn;
		}
		this._sprite.x += this._speed * this._boost * Math.cos(this._head);
		this._sprite.y += this._speed * this._boost * Math.sin(this._head);
		this._sprite.modified();
	}

	kill(): void {
		this._sprite.destroy();
		this._killed = true;
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
}
