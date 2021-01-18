import { appendCountDown } from "./utils";

type Point = { x: number; y: number };

function outerProduct(vec1: Point, vec2: Point): number {
	return vec1.x * vec2.y - vec1.y * vec2.x;
}

export type FenceOption = {
	scene: g.Scene;
	panel: g.E;
	font: g.Font;
	fontSize: number;
	line: number;
	rough: number;
	onClose: (f: Fence) => void;
	fade: number;
	isPrintEffect: boolean;
};

export class Fence {
	private _nodes: Point[];
	private _enclosure: boolean;
	private _scene: g.Scene;
	private _panel: g.E;
	private _container: g.E;
	private _font: g.Font;
	private _fontSize: number;
	private _line: number;
	private _rough: number;
	private _rough_counter: number;
	private _pointerID: number;
	private _onClose: (f: Fence) => void;
	private _fade: number;
	private _isPrintEffect: boolean;

	constructor(opts: FenceOption) {
		this._scene = opts.scene;
		this._panel = opts.panel;
		this._line = opts.line;
		this._font = opts.font;
		this._fontSize = opts.fontSize;
		this._rough = opts.rough;
		this._rough_counter = 0;
		this._fade = opts.fade;
		this._isPrintEffect = opts.isPrintEffect;
		this._container = new g.E({
			scene: opts.scene,
			parent: opts.panel,
			width: opts.panel.width,
			height: opts.panel.height,
			touchable: true,
		});
		this._nodes = [];
		this._container.onPointDown.add((arg) => {
			if (!this._enclosure && this._nodes.length === 0) {
				this._pointerID = arg.pointerId;
				this.start(arg.point.x, arg.point.y);
			}
		});
		this._container.onPointMove.add((arg) => {
			if (!this._enclosure && this._pointerID === arg.pointerId) {
				this._rough_counter++;
				if (this._rough_counter >= this._rough) {
					this.extend(arg.point.x + arg.startDelta.x, arg.point.y + arg.startDelta.y);
					this._rough_counter = 0;
				}
			}
		});
		this._container.onPointUp.add((arg) => {
			if (!this._enclosure && this._pointerID === arg.pointerId) {
				this.end();
			}
		});
		this._onClose = opts.onClose;
	}

	start(x: number, y: number): void {
		this._nodes = [{x, y}];
	}

	end(): void {
		// pointMoveで強制終了し、pointUpした際、_nodesが[]になる
		if (this._nodes.length > 0) {
			this.extend(this._nodes[0].x, this._nodes[0].y);
			this._enclosure = true;
			this.fade();
			this._onClose(this);
		}
	}

	extend(x: number, y: number): void {
		if (this._nodes.length > 0) {
			// 既存線と交差する場合、直近でできる空間を領域とする
			const result = this.isCross(this._nodes[this._nodes.length - 1], { x, y });
			if (result.cross) {
				const subset = this._nodes.slice(result.index + 1);
				this.clear();
				subset.forEach(n => this.pushNode(n));
				this.pushNode({ x, y });
				this.end();
				return;
			}
		}
		this.pushNode({ x, y });
	}

	get enclosure(): boolean {
		return this._enclosure;
	}

	isInner(x: number, y: number): boolean {
		let cnt = 0;
		for (let i = 0; i < this._nodes.length - 1; i++) {
			const from = this._nodes[i];
			const to = this._nodes[i+1];
			if ((from.y <= y && to.y > y) || (from.y > y && to.y <= y)) {
				const vt = (y - from.y) / (to.y - from.y);
				if (x < (from.x + vt * (to.x - from.x))) {
					cnt++;
				}
			}
		}
		return cnt % 2 === 1;
	}

	clear(): void {
		const old = this._container.children;
		if (old) {
			[...old].forEach(c => c.destroy());
		}
		this._nodes = [];
		this._enclosure = false;
	}

	get tier(): number {
		const base = this._container.width + this._container.height;
		const len = this.length;
		return Math.floor(base/len);
	}

	private isCross(from: Point, to: Point): { cross: boolean; index: number } {
		const vec1 = {
			x: to.x - from.x,
			y: to.y - from.y
		};
		for (let i = this._nodes.length - 2; i >= 0; i--) {
			const vec2 = {
				x: this._nodes[i+1].x - this._nodes[i].x,
				y: this._nodes[i+1].y - this._nodes[i].y
			};

			const op1 = outerProduct(vec1, {
				x: this._nodes[i].x - from.x,
				y: this._nodes[i].y - from.y,
			}) * outerProduct(vec1, {
				x: this._nodes[i+1].x - from.x,
				y: this._nodes[i+1].y - from.y
			});

			const op2 = outerProduct(vec2, {
				x: from.x - this._nodes[i].x,
				y: from.y - this._nodes[i].y,
			}) * outerProduct(vec2, {
				x: to.x - this._nodes[i+1].x,
				y: to.y - this._nodes[i+1].y
			});

			if (op1 < 0 && op2 < 0) {
				return {cross: true, index: i};
			}
		}

		return { cross: false, index: -1 };
	}

	private appendRect(from: Point, to: Point, parent: g.E): g.FilledRect {
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const angle = Math.atan2(dy, dx) / Math.PI * 180;
		return new g.FilledRect({
			scene: this._scene,
			parent,
			cssColor: "#000000",
			width: Math.sqrt(dx * dx + dy * dy),
			height: this._line,
			x: (from.x + to.x) / 2,
			y: (from.y + to.y) / 2,
			anchorX: 0.5,
			anchorY: 0.5,
			angle,
		});
	}

	private pushNode(pos: Point): void {
		if (this._nodes.length > 0) {
			this.appendRect(this._nodes[this._nodes.length - 1], pos, this._container);
		}
		this._nodes.push(pos);
	}

	private get length(): number {
		let len = 0;
		for (let i = 0; i < this._nodes.length - 1; i++) {
			const dx = this._nodes[i+1].x - this._nodes[i].x;
			const dy = this._nodes[i + 1].y - this._nodes[i].y;
			len += Math.sqrt(dx*dx+dy*dy);
		}
		return len;
	}

	private fade(): void {
		const effect = new g.E({
			scene: this._scene,
			parent: this._panel,
			width: this._panel.width,
			height: this._panel.height,
		});

		appendCountDown({
			onStart: () => {
				for (let i = 0; i < this._nodes.length - 1; i++) {
					this.appendRect(this._nodes[i], this._nodes[i + 1], effect);
				}
				if (this._isPrintEffect) {
					new g.Label({
						scene: this._scene,
						parent: effect,
						font: this._font,
						fontSize: this._fontSize,
						x: effect.width / 2.5,
						y: effect.height * 2 / 3,
						text: `範囲: ${this.area}`
					});
					new g.Label({
						scene: this._scene,
						parent: effect,
						font: this._font,
						fontSize: this._fontSize,
						x: effect.width / 2.5,
						y: effect.height * 2 / 3 + this._fontSize * 1.5,
						text: `効果: ${this.effect}`
					});
				}
			},
			onCount: (cnt: number) => {
				effect.opacity = cnt / this._fade;
				effect.modified();
			},
			onEnd: () => {
				effect.destroy();
			}
		}, this._fade, this._panel);
	}

	private get area(): string {
		switch (this.tier) {
			case 0:
				return "広";
			case 1:
			case 2:
				return "中";
			default:
				return "狭";
		}
	}

	private get effect(): string {
		switch (this.tier) {
			case 0:
				return "低";
			case 1:
			case 2:
				return "中";
			default:
				return "高";
		}
	}
}
