import { GameMainParameterObject } from "./parameterObject";
import { createTitleScene } from "./title";

export function main(param: GameMainParameterObject): void {
	let timeLimit = 90;
	if (param.sessionParameter.totalTimeLimit) {
		timeLimit = param.sessionParameter.totalTimeLimit - 30;
	}
	g.game.vars.gameState = {
		score: 0,
		playThreshold: 0,
		clearThreshold: 0,
	};

	const scene = createTitleScene(g.game, timeLimit, param.isAtsumaru);
	g.game.pushScene(scene);
}

