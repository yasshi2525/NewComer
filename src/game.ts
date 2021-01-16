import { Customer } from "./customer";
import { Fence } from "./fence";

export function createGameScene(game: g.Game): g.Scene {
	const scene = new g.Scene({
		game,
		assetIds: ["customer_img"]
	});

	scene.onLoad.add(() => {
		const panel = new g.E({
			scene,
			width: game.width,
			height: game.height
		});
		scene.append(panel);

		const fence = new Fence({
			scene,
			line: 1,
			panel
		});

		fence.start(100, 100);
		fence.extend(200, 100);
		fence.extend(200, 200);
		fence.extend(150, 0);

		// for (let i = 0; i < 10; i++) {
		// 	new Customer({
		// 		asset: scene.asset.getImageById("customer_img"),
		// 		width: game.width,
		// 		height: game.height,
		// 		rg: game.random,
		// 		panel,
		// 		scene,
		// 		speed: 5,
		// 		turn: 1 * Math.PI / 2,
		// 		scale: 0.25
		// 	});
		// }
	});
	return scene;
}
