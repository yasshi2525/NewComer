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
	private _sprite: g.Sprite;
	private _rg: g.RandomGenerator;
	private _w: number;
	private _h: number;
	private _head: number;
	private _speed: number;
	private _turn: number;
	private _opacity: number;
	private _fence: Fence;
	private _killed: boolean;

	constructor(opts: CustomerOption) {
		this._status = CustomerStatus.NUTRAL;
		this._rg = opts.rg;
		this._w = opts.width;
		this._h = opts.height;
		this._speed = opts.speed;
		this._turn = opts.turn;
		this._opacity = opts.opacity;
		this._fence = opts.fence;

		this._sprite = new g.Sprite({
			scene: opts.scene,
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
		opts.panel.append(this._sprite);
	}

	attract(): void {
		this._status = CustomerStatus.ACTIVE;
	}

	get status(): CustomerStatus {
		return this._status;
	}

	step(): void {
		this._head += (this._rg.generate() - 0.5) * this._turn;
		this._sprite.x += this._speed * Math.cos(this._head);
		this._sprite.y += this._speed * Math.sin(this._head);
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

	get y(): number{
		return this._sprite.y;
	}
}
