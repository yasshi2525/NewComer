import { Customer } from "./customer";
import { Fence } from "./fence";
import { Scorer } from "./scorer";

export function createGameScene(game: g.Game): g.Scene {
	const scene = new g.Scene({
		game,
		assetIds: ["customer_img", "score_main", "score_main_glyphs"]
	});

	scene.onLoad.add(() => {
		const panel = new g.E({
			scene,
			width: game.width,
			height: game.height
		});
		scene.append(panel);

		const scorer = new Scorer({
			scene,
			font: new g.BitmapFont({
				src: scene.asset.getImageById("score_main"),
				glyphInfo: JSON.parse(scene.asset.getTextById("score_main_glyphs").data)
			}),
			x: panel.width - 300,
			y: 15,
			panel,
			size: 30,
		});

		let customers: Customer[] = [];

		const fence = new Fence({
			scene,
			line: 1,
			rough: 5,
			panel,
			onClose: (f: Fence) => {
				customers.forEach((c) => {
					if (f.isInner(c.x, c.y)) {
						c.kill();
						scorer.add(1);
					}
				});
				const old = customers;
				customers = [];
				old.forEach((c) => {
					if (!c.killed) {
						customers.push(c);
					}
				});
				fence.clear();
			}
		});

		for (let i = 0; i < 30; i++) {
			customers.push(new Customer({
				asset: scene.asset.getImageById("customer_img"),
				width: game.width,
				height: game.height,
				rg: game.random,
				panel,
				scene,
				speed: 5,
				turn: 1 * Math.PI / 2,
				scale: 0.25,
				opacity: 0.25,
				fence
			}));
		}

		// scene.onUpdate.add(() => {
		// 	fence.clear();
		// 	fence.start(500, 300);

		// 	for (let i = 0; i < 360; i += 30) {
		// 		fence.extend(Math.cos(i / 180 * Math.PI) * 200 + 300, Math.sin(i / 180 * Math.PI) * 200 + 300);
		// 	}
		// 	fence.end();
		// });
		// fence.start(100, 100);
		// fence.extend(150, 110);
		// fence.extend(200, 100);
		// fence.extend(250, 110);
		// fence.extend(300, 100);
		// fence.extend(400, 110);
		// fence.extend(400, 10);
		// fence.extend(130, 150);

	});
	return scene;
}
