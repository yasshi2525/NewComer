import { createGameScene } from "./game";

export function createTitleScene(game: g.Game): g.Scene {
	const scene = new g.Scene({
		game,
		assetIds: ["title_img"]
	});

	scene.onLoad.add(() => {
		const panel = new g.E({
			scene,
			width: game.width,
			height: game.height,
			touchable: true
		});
		panel.onPointUp.add(() => {
			game.pushScene(createGameScene(game));
		});
		scene.append(panel);

		const title = new g.Sprite({
			scene,
			src: scene.asset.getImageById("title_img"),
		});
		panel.append(title);
	});

	return scene;
}
