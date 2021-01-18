import { Advertise } from "./advertise";
import { Cast } from "./cast";
import { Collabo } from "./collabo";
import { Customer } from "./customer";
import { Fence } from "./fence";
import { Scorer } from "./scorer";
import { Ticker } from "./ticker";
import { Tweeter } from "./tweeter";

function createCustomer(opts: {
	scene: g.Scene;
	game: g.Game;
	customerLayer: g.E;
	tweetLayer: g.E;
	fence: Fence;
}): { c: Customer; t: Tweeter } {
	const c = new Customer({
		asset: opts.scene.asset.getImageById("customer_img"),
		width: opts.game.width,
		height: opts.game.height,
		rg: opts.game.random,
		panel: opts.customerLayer,
		font: new g.DynamicFont({
			game: opts.game,
			fontFamily: "sans-serif",
			size: 15
		}),
		fontSize: 15,
		scene: opts.scene,
		speed: 3,
		turn: 0.2 * Math.PI / 2,
		scale: 0.25,
		opacity: 0.25,
		fade: 1 * opts.game.fps,
		fence: opts.fence
	});

	const t = new Tweeter({
		asset: opts.scene.asset.getImageById("tweet_img"),
		effect: 3 * opts.game.fps,
		delay: 1 * opts.game.fps,
		coolDown: 3 * opts.game.fps,
		font: new g.DynamicFont({
			game: opts.game,
			fontFamily: "sans-serif",
			size: 15
		}),
		scene: opts.scene,
		panel: opts.tweetLayer,
		position: () => c.position,
		rand: opts.game.random,
		size: 15,
		scale: 0.25,
		events: {
			start: {
				messages: ["わこつ", "初見", "初めまして", "やぁ", "よぉ", "うぃっす", "こんにちは"],
				rate: 0.4
			},
			normal: {
				messages: ["ｗ", "ｗｗｗ", "草", "わかる", "それな", "うん", "ノ", "8888"],
				rate: 0.05
			},
			advertise: {
				messages: ["広告から", "放送と聞いて", "面白そう", "広告から来ました", "呼ばれた気がして"],
				rate: 0.3
			},
			collabo: {
				messages: ["ktkr", "あの人じゃん！", "キター！", "盛り上がってきた", "うおおお"],
				rate: 0.8
			},
			end: {
				messages: ["乙", "お疲れ", "またね", "バイバイ", "楽しかった"],
				rate: 0.2
			}
		}
	});

	t.start();
	return {c, t};
}

export function createGameScene(game: g.Game): g.Scene {
	const scene = new g.Scene({
		game,
		assetIds: [
			"cast_img",
			"advertise_img",
			"customer_img",
			"tweet_img",
			"score_main",
			"score_main_glyphs",
			"collabo_lock",
			"collabo_cast_tier1",
			"collabo_cast_tier2",
			"collabo_cast_tier3",
		]
	});

	scene.onLoad.add(() => {
		const container = new g.E({
			scene,
			width: game.width,
			height: game.height
		});
		scene.append(container);
		const customerLayer = new g.E({
			scene,
			parent: container,
			width: container.width - 250,
			height: container.height
		});
		const tweetLayer = new g.E({
			scene,
			parent: container,
			width: container.width - 250,
			height: container.height
		});
		const castLayer = new g.E({
			scene,
			parent: container,
			width: container.width - 250,
			height: container.height
		});
		const castTweetLayer = new g.E({
			scene,
			parent: container,
			width: container.width - 250,
			height: container.height
		});
		const fenceLayer = new g.E({
			scene,
			parent: container,
			width: container.width - 250,
			height: container.height
		});
		const actionLayer = new g.E({
			scene,
			parent: container,
			width: container.width,
			height: container.height
		});
		const scoreLayer = new g.E({
			scene,
			parent: container,
			width: container.width,
			height: container.height
		});

		new Cast({
			scene,
			panel: castLayer,
			asset: scene.asset.getImageById("cast_img"),
			scale: 0.25
		});

		const castTweeter = new Tweeter({
			asset: scene.asset.getImageById("tweet_img"),
			effect: 2 * game.fps,
			delay: 0,
			coolDown: 2 * game.fps,
			font: new g.DynamicFont({
				game,
				fontFamily: "sans-serif",
				size: 15
			}),
			scene,
			panel: castTweetLayer,
			position: () => ({x: tweetLayer.width / 2, y: tweetLayer.height / 2}),
			rand: game.random,
			size: 15,
			scale: 0.25,
			events: {
				start: {
					messages: ["どーも！"],
					rate: 1.0
				},
				normal: {
					messages: ["という訳でね", "そうなんですよ", "でしてね", "もうね", "聞いて下さいよ"],
					rate: 1.0
				},
				advertise: {
					messages: [],
					rate: 0.0
				},
				collabo: {
					messages: ["ゲストです！", "コラボしてます！", "よってらっしゃい"],
					rate: 1.0
				},
				end: {
					messages: ["またねー"],
					rate: 1.0
				}
			}
		});

		castLayer.onUpdate.add(() => {
			castTweeter.normal();
		});

		new Ticker({
			scene,
			font: new g.BitmapFont({
				src: scene.asset.getImageById("score_main"),
				glyphInfo: JSON.parse(scene.asset.getTextById("score_main_glyphs").data)
			}),
			x: scoreLayer.width - 240,
			y: 15,
			panel: scoreLayer,
			size: 30,
			fps: game.fps,
			time: 120,
		});

		const scorer = new Scorer({
			scene,
			font: new g.BitmapFont({
				src: scene.asset.getImageById("score_main"),
				glyphInfo: JSON.parse(scene.asset.getTextById("score_main_glyphs").data)
			}),
			x: scoreLayer.width - 300,
			y: 45,
			panel: scoreLayer,
			size: 30,
		});

		let customers: { c: Customer; t: Tweeter }[] = [];

		customerLayer.onUpdate.add(() => {
			customers.forEach(obj => {
				obj.t.normal();
			});
		});

		const fence = new Fence({
			scene,
			line: 5,
			rough: 1,
			panel: fenceLayer,
			font: new g.DynamicFont({
				game,
				fontFamily: "sans-serif",
				size: 30
			}),
			fontSize: 30,
			fade: 1 * game.fps,
			onClose: (f: Fence) => {
				let rate = 0;
				switch (f.tier) {
					case 0:
						rate = 0.25;
						break;
					case 1:
					case 2:
						rate = 0.5;
						break;
					default:
						rate = 0.75;
				}
				customers.forEach((obj) => {
					if (game.random.generate() < rate && f.isInner(obj.c.x, obj.c.y)) {
						obj.c.kill();
						obj.t.kill();
						scorer.add(1);
					}
				});
				const old = customers;
				customers = [];
				old.forEach((obj) => {
					if (!obj.c.killed) {
						customers.push(obj);
					}
				});
				fence.clear();
			}
		});

		new Advertise({
			scene,
			panel: new g.E({
				scene,
				parent: actionLayer,
				x: actionLayer.width - 250,
				y: 80,
			}),
			asset: scene.asset.getImageById("advertise_img"),
			barColor: "#ff0000",
			barHeight: 5,
			coolDown: 10 * game.fps,
			opacity: 0.25,
			onAdvertise: () => {
				for (let i = 0; i < 10; i++) {
					customers.push(createCustomer({
						game,
						scene,
						fence,
						customerLayer,
						tweetLayer
					}));
				}
				castTweeter.advertise();
				customers.forEach((obj) => {
					obj.t.advertise();
				});
			}
		});

		const collabos = [{
			tier: 1,
			name: "友人",
			effectText: "薄口",
			rate: 0.1,
			boost: 0.2,
			coolDown: 10 * game.fps,
			effect: 5 * game.fps,
			minScore: 1,
		}, {
			tier: 2,
			name: "中堅放送者",
			effectText: "中",
			rate: 0.3,
			boost: 0.4,
			coolDown: 10 * game.fps,
			effect: 5 * game.fps,
			minScore: 10,
		}, {
			tier: 3,
			name: "大物放送者",
			effectText: "濃口",
			rate: 0.7,
			boost: 0.8,
			coolDown: 20 * game.fps,
			effect: 5 * game.fps,
			minScore: 30
		}];

		collabos.forEach((info, i) => {
			const container = new g.E({
				scene,
				parent: actionLayer,
				x: actionLayer.width - 250,
				y: i * 120 + 150,
				width: 200,
				height: 100
			});

			new Collabo({
				scene,
				panel: container,
				rate: info.rate,
				boost: info.boost,
				lockAsset: scene.asset.getImageById("collabo_lock"),
				lockFont: new g.DynamicFont({
					game,
					fontFamily: "sans-serif",
					fontColor: "#ffffff",
					size: 15
				}),
				lockScale: 0.125,
				collaboAseet: scene.asset.getImageById(`collabo_cast_tier${info.tier}`),
				collaboFont:new g.DynamicFont({
					game,
					fontFamily: "sans-serif",
					size: 15
				}),
				collaboText: [`${info.name} とコラボ放送`, `効果: ${info.effectText}`],
				collaboScale: 0.25,
				fontSize: 15,
				enabledColor: "#88ff88",
				disabledColor: "#888888",
				lockedColor: "#666666",
				effectColor: "#0000ff",
				effectHeight: 10,
				coolDownColor: "#ff0000",
				coolDownHeight: 5,
				coolDown: info.coolDown,
				effect: info.effect,
				minScore: info.minScore,
				opacity: 0.25,
				scorer,
				onStart: (co) => {
					customers.forEach(obj => {
						if (game.random.generate() < co.rate ) {
							obj.c.attract(co.boost, co.effect);
						}
					});
				},
				onCollabo: (co) => {
					customers.forEach(obj => {
						if (obj.c.isBoost) {
							obj.t.collabo();
						}
					});
					castTweeter.collabo();
				},
				onEnd: () => undefined,
			});
		});

		for (let i = 0; i < 20; i++) {
			customers.push(createCustomer({
				game,
				scene,
				fence,
				customerLayer,
				tweetLayer
			}));
		}
		castTweeter.start();

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
