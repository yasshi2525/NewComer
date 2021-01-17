export type CastOption = {
	scene: g.Scene;
	panel: g.E;
	asset: g.ImageAsset;
	scale: number;
};

export class Cast{
	constructor(opts: CastOption) {
		new g.Sprite({
			scene: opts.scene,
			parent: opts.panel,
			src: opts.asset,
			scaleX: opts.scale,
			scaleY: opts.scale,
			x: (opts.panel.width - opts.asset.width * opts.scale) / 2,
			y: (opts.panel.height - opts.asset.height * opts.scale) / 2,
		});
	}
}
