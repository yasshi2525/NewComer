type Point = { x: number; y: number };

function outerProduct(vec1: Point, vec2: Point): number {
	return vec1.x * vec2.y - vec1.y * vec2.x;
}

export type FenceOption = {
	scene: g.Scene;
	panel: g.E;
	line: number;
	rough: number;
	onClose: (f: Fence) => void;
};

export class Fence {
	private _nodes: Point[];
	private _enclosure: boolean;
	private _scene: g.Scene;
	private _container: g.E;
	private _line: number;
	private _rough: number;
	private _rough_counter: number;
	private _pointerID: number;
	private _onClose: (f: Fence) => void;

	constructor(opts: FenceOption) {
		this._scene = opts.scene;
		this._line = opts.line;
		this._rough = opts.rough;
		this._rough_counter = 0;
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
		opts.panel.append(this._container);
	}

	start(x: number, y: number): void {
		this._nodes = [{x, y}];
	}

	end(): void {
		this.extend(this._nodes[0].x, this._nodes[0].y);
		this._enclosure = true;
		this._onClose(this);
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

	private pushNode(pos: Point): void {
		if (this._nodes.length > 0) {
			const tail = this._nodes[this._nodes.length - 1];
			const dx = pos.x - tail.x;
			const dy = pos.y - tail.y;
			const angle = Math.atan2(dy, dx) / Math.PI * 180;
			const rect = new g.FilledRect({
				scene: this._scene,
				cssColor: "#000000",
				width: Math.sqrt(dx * dx + dy * dy),
				height: this._line,
				x: (pos.x + tail.x) / 2,
				y: (pos.y + tail.y) / 2,
				anchorX: 0.5,
				anchorY: 0.5,
				angle,
			});
			this._container.append(rect);
		}
		this._nodes.push(pos);
	}

}