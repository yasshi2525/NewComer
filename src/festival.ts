import { appendCountDown } from "./utils";

export type FestivalOption = {
	scene: g.Scene;
	rand: g.RandomGenerator;
	panel: g.E;
	num: number;
	speed: number;
	assets: g.ImageAsset[];
};

export class Festival {
	constructor(opts: FestivalOption) {
		for (let i = 0; i < opts.num; i++) {
			const i = Math.floor(opts.rand.generate() * opts.assets.length);
			const sprite = new g.Sprite({
				scene: opts.scene,
				parent: opts.panel,
				x: (1 + opts.rand.generate() * 3) * opts.panel.width,
				src: opts.assets[i]
			});
			const unit = sprite.height * 2 / 3;
			const rows = Math.floor(opts.panel.height / unit);
			sprite.y = (i % rows) * unit;
			sprite.modified();
			appendCountDown({
				onCount: () => {
					sprite.x -= opts.speed;
					sprite.modified();
				}, onEnd: () => {
					sprite.destroy();
				}
			}, opts.panel.width * 10 / opts.speed, opts.panel);
		}
	}
}
