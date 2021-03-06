import { Cast } from "./cast";
import { Customer } from "./customer";
import { Fence } from "./fence";
import { createGameScene } from "./game";
import { appendCountDown } from "./utils";

export function createTitleScene(game: g.Game, timeLimit: number, isAtsumaru: boolean): g.Scene {
	const scene = new g.Scene({
		game,
		assetIds: [
			"start_countdown",
			"score_main",
			"score_main_glyphs",
			"title_text",
			"title_inst1",
			"title_inst2",
			"title_inst3",
			"finger",
			"cast_img",
			"customer_img",
			"customer_success",
			"customer_fail",
			"fence_success",
			"fence_fail",
		]
	});

	scene.onLoad.add(() => {
		const titleLayer = new g.E({
			scene,
			width: game.width,
			height: game.height,
		});
		scene.append(titleLayer);

		const backgroundLayer = new g.E({
			scene,
			width: game.width,
			y: game.height * 0.2,
			height: game.height * 0.8,
		});
		scene.append(backgroundLayer);

		const sensor = new g.E({
			scene,
			width: game.width,
			height: game.height,
			touchable: true,
		});
		if (isAtsumaru) {
			sensor.onPointUp.add(() => {
				game.pushScene(createGameScene(game, timeLimit, isAtsumaru));
			});
		}
		scene.append(sensor);

		const title = new g.Sprite({
			scene,
			parent: titleLayer,
			src: scene.asset.getImageById("title_text"),
			y: 20
		});
		title.x = (titleLayer.width - title.width) / 2;

		const inst1 = new g.Sprite({
			scene,
			parent: titleLayer,
			src: scene.asset.getImageById("title_inst1"),
			y: 110
		});
		inst1.x = (titleLayer.width - inst1.width) / 2;

		const inst2 = new g.Sprite({
			scene,
			parent: titleLayer,
			src: scene.asset.getImageById("title_inst2"),
			y: 150
		});
		inst2.x = (titleLayer.width - inst2.width) / 2;

		if (isAtsumaru) {
			const inst3 = new g.Sprite({
				scene,
				parent: titleLayer,
				src: scene.asset.getImageById("title_inst3"),
				y: titleLayer.height - 60
			});
			inst3.x = (titleLayer.width - inst3.width) / 2;
		}

		new Cast({
			scene,
			panel: backgroundLayer,
			asset: scene.asset.getImageById("cast_img"),
			scale: 1
		});

		const cs: Customer[] = [];
		const f = new Fence({
			scene,
			line: 3,
			rough: 1,
			panel: backgroundLayer,
			font: new g.DynamicFont({
				game,
				fontFamily: "sans-serif",
				size: 30
			}),
			fontSize: 30,
			fade: 1 * game.fps,
			isPrintEffect: false,
			effectAssets: [null, null, null],
			effectDetailsAssets: [null, null, null],
			onClose: () => {
				cs.forEach(c => c.kill());
				f.clear();
			}
		});
		animateFence({ game, scene, panel: backgroundLayer, cs, f });

		if (!isAtsumaru) {
			const countHeader = new g.Sprite({
				scene,
				parent: titleLayer,
				src: scene.asset.getImageById("start_countdown")
			});
			countHeader.x = titleLayer.width - countHeader.width - 20;
			countHeader.y = titleLayer.height - countHeader.height - 70;
			countHeader.modified();

			const countLabel = new g.Label({
				scene,
				parent: titleLayer,
				font: new g.BitmapFont({
					src: scene.asset.getImageById("score_main"),
					glyphInfo: JSON.parse(scene.asset.getTextById("score_main_glyphs").data)
				}),
				fontSize: 50,
				text: "10"
			});
			appendCountDown({
				onStart: () => {
					countLabel.x = titleLayer.width - countLabel.width - 20;
					countLabel.y = titleLayer.height - countLabel.height - 20;
					countLabel.modified();
				},
				onCount: (cnt) => {
					countLabel.text = ` ${Math.floor(cnt / game.fps)}`.slice(-2);
					countLabel.invalidate();
				},
				onEnd: () => {
					game.pushScene(createGameScene(game, timeLimit, isAtsumaru));
				}
			}, 10 * game.fps, titleLayer);
		}
	});

	return scene;
}

function animateFence(opts: {
	game: g.Game;
	scene: g.Scene;
	panel: g.E;
	cs: Customer[];
	f: Fence;
}): void {
	const font = new g.DynamicFont({
		game: opts.game,
		fontFamily: "sans-serif",
		size: 15
	});

	[
		{ x: 0.425, y: 0.4 },
		{ x: 0.575, y: 0.4 },
		{ x: 0.425, y: 0.6 },
		{ x: 0.575, y: 0.6 },
	].forEach(pos => {
		const c = new Customer({
			asset: opts.scene.asset.getImageById("customer_img"),
			successAsset: opts.scene.asset.getImageById("customer_success"),
			failAsset: opts.scene.asset.getImageById("customer_fail"),
			successTextAsset: opts.scene.asset.getImageById("fence_success"),
			failTextAsset: opts.scene.asset.getImageById("fence_fail"),
			rg: opts.game.random,
			panel: opts.panel,
			font,
			fontSize: 15,
			scene: opts.scene,
			speed: 0,
			turn: 0.2 * Math.PI / 2,
			isStay: false,
			scale: 1,
			opacity:1,
			fade: 1 * opts.game.fps,
			fence: opts.f,
			graceful: false
		});
		c.position = {
			x: opts.panel.width * pos.x,
			y: opts.panel.height * pos.y
		};
		opts.cs.push(c);
	});

	const finger = new g.Sprite({
		scene: opts.scene,
		parent: opts.panel,
		src: opts.scene.asset.getImageById("finger")
	});

	const r = 150;
	const effect = 2 * opts.game.fps;
	const fade = 1 * opts.game.fps;

	appendCountDown({
		onStart: () => {
			const angle = -1.5 * Math.PI;
			const x = opts.panel.width / 2 + r * Math.cos(angle);
			const y = opts.panel.height / 2 + r * Math.sin(angle);
			opts.f.start(x, y);
			finger.x = x - finger.width / 2 - 20;
			finger.y = y - 20;
			finger.modified();
		},
		onCount: (cnt) => {
			const angle = -1.5 * Math.PI - cnt / effect * 1.9 * Math.PI;
			const x = opts.panel.width / 2 + r * Math.cos(angle);
			const y = opts.panel.height / 2 + r * Math.sin(angle);
			if (cnt % 2 === 0) {
				opts.f.extend(x, y);
			}
			finger.x = x - finger.width / 2 - 20;
			finger.y = y - 20;
			finger.modified();

		},
		onEnd: () => {
			opts.f.end();
			appendCountDown({
				onCount: (cnt) => {
					finger.opacity = cnt / fade;
					finger.modified();
				},
				onEnd: () => {
					finger.destroy();
					opts.f.clear();
					opts.cs.splice(0);
					animateFence(opts);
				}
			}, fade, opts.panel);
		}
	}, effect, opts.panel);
}
