import { Advertise } from "./advertise";
import { Cast } from "./cast";
import { Collabo } from "./collabo";
import { Customer } from "./customer";
import { Fence } from "./fence";
import { Festival } from "./festival";
import { Scorer } from "./scorer";
import { Ticker } from "./ticker";
import { Tweeter } from "./tweeter";
import { appendCountDown } from "./utils";

declare const window: { RPGAtsumaru: any };

const tweetEvent = {
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
		rate: 0.5
	}
};

function createCustomer(opts: {
	scene: g.Scene;
	game: g.Game;
	customerFont: g.Font;
	tweetFont: g.Font;
	customerLayer: g.E;
	tweetLayer: g.E;
	fence: Fence;
	collabos: { co: Collabo; t: Tweeter }[];
	graceful: boolean;
}): { c: Customer; t: Tweeter } {
	const c = new Customer({
		asset: opts.scene.asset.getImageById("customer_img"),
		successAsset: opts.scene.asset.getImageById("customer_success"),
		failAsset: opts.scene.asset.getImageById("customer_fail"),
		successTextAsset: opts.scene.asset.getImageById("fence_success"),
		failTextAsset: opts.scene.asset.getImageById("fence_fail"),
		rg: opts.game.random,
		panel: opts.customerLayer,
		font: opts.customerFont,
		fontSize: 15,
		scene: opts.scene,
		speed: 3,
		turn: 0.2 * Math.PI / 2,
		isStay: opts.game.random.generate() < 0.5,
		scale: 1,
		opacity: 1,
		fade: 1 * opts.game.fps,
		fence: opts.fence,
		graceful: opts.graceful
	});

	opts.collabos.forEach((obj) => {
		if (obj.co.isEffect && opts.game.random.generate() < obj.co.rate ) {
			c.attract(obj.co.boost, obj.co.effect);
		}
	});

	const t = new Tweeter({
		asset: opts.scene.asset.getImageById("tweet_img"),
		effect: 3 * opts.game.fps,
		delay: 1 * opts.game.fps,
		coolDown: 3 * opts.game.fps,
		font: opts.tweetFont,
		scene: opts.scene,
		panel: opts.tweetLayer,
		position: () => c.position,
		rand: opts.game.random,
		size: 15,
		scale: 0.25,
		events: tweetEvent
	});

	t.start();
	return {c, t};
}

function spawn(opts: {
	game: g.Game;
	scene: g.Scene;
	customerFont: g.Font;
	tweetFont: g.Font;
	fence: Fence;
	collabos: {co: Collabo; t: Tweeter}[];
	customerLayer: g.E;
	tweetLayer: g.E;
	customers: { c: Customer; t: Tweeter }[];
	ticker: Ticker;
	interval: number;
}): void {
	appendCountDown({
		onStart: () => {
			opts.customers.push(createCustomer({
				game: opts.game,
				scene: opts.scene,
				customerFont: opts.customerFont,
				tweetFont: opts.tweetFont,
				fence: opts.fence,
				collabos: opts.collabos,
				customerLayer: opts.customerLayer,
				tweetLayer: opts.tweetLayer,
				graceful: true
			}));
		},
		onEnd: () => {
			if (!opts.ticker.isEnd) {
				spawn(opts);
			}
		}
	}, opts.interval, opts.customerLayer);
}

export function createGameScene(game: g.Game, timeLimit: number): g.Scene {
	const scene = new g.Scene({
		game,
		assetIds: [
			"inst1",
			"inst2",
			"cast_img",
			"advertise_enabled",
			"advertise_disabled",
			"customer_img",
			"customer_success",
			"customer_fail",
			"fence_success",
			"fence_fail",
			"effect_tier1",
			"effect_tier3",
			"effect_details_tier1",
			"effect_details_tier2",
			"effect_details_tier3",
			"tweet_img",
			"score_main",
			"score_main_glyphs",
			"collabo_lock",
			"collabo_cast_tier1",
			"collabo_cast_tier2",
			"collabo_cast_tier3",
			"collabo_tier1_enabled",
			"collabo_tier2_enabled",
			"collabo_tier3_enabled",
			"collabo_tier1_disabled",
			"collabo_tier2_disabled",
			"collabo_tier3_disabled",
			"ending",
			"retry",
			"ranking",
			"festival1",
			"festival2",
			"festival3",
			"festival4",
			"festival5",
			"festival6",
			"festival7",
			"festival8",
			"festival9",
			"festival10",
			"festival11",
			"festival12",
			"festival13",
			"fence_nc227995",
			"festival_nc176457",
			"fence_failed_nc63801"
		]
	});

	scene.onLoad.add(() => {
		const container = new g.E({
			scene,
			width: game.width,
			height: game.height
		});
		scene.append(container);
		const festivalLayer = new g.E({
			scene,
			parent: container,
			width: container.width - 250,
			height: container.height
		});

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

		new g.Sprite({
			scene,
			parent: scoreLayer,
			src: scene.asset.getImageById("inst1"),
			x: 15,
			y: 15,
		});
		new g.Sprite({
			scene,
			parent: scoreLayer,
			src: scene.asset.getImageById("inst2"),
			x: 15,
			y: 45,
		});

		new Cast({
			scene,
			panel: castLayer,
			asset: scene.asset.getImageById("cast_img"),
			scale: 1
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

		const ticker = new Ticker({
			scene,
			font: new g.BitmapFont({
				src: scene.asset.getImageById("score_main"),
				glyphInfo: JSON.parse(scene.asset.getTextById("score_main_glyphs").data)
			}),
			x: scoreLayer.width - 220,
			y: 15,
			panel: scoreLayer,
			size: 30,
			fps: game.fps,
			time: timeLimit,
			onEnd: () => {
				customers.forEach(obj => {
					obj.t.end();
				});
				castTweeter.end();
				collabos.forEach(obj => {
					obj.t.end();
				});

				const ending = new g.Sprite({
					scene,
					parent: scoreLayer,
					src: scene.asset.getImageById("ending")
				});
				ending.x = (scoreLayer.width - 250 - ending.width) / 2;
				ending.y = scoreLayer.height / 3 - 30 - ending.height / 2;
				ending.modified();

				if (typeof window !== "undefined" && window.RPGAtsumaru !== undefined) {
					const replay = new g.Sprite({
						scene,
						parent: scoreLayer,
						src: scene.asset.getImageById("retry"),
						touchable: true,
					});
					replay.x = (scoreLayer.width - 250  - replay.width) / 2;
					replay.y = scoreLayer.height * 2 / 3 - replay.height / 2;
					replay.modified();

					replay.onPointUp.add(() => {
						game.pushScene(createGameScene(game, timeLimit));
					});

					window.RPGAtsumaru.scoreboards
						.setRecord(1, scorer.value)
						.then(() => {
							window.RPGAtsumaru.scoreboards.getRecords(1).then((res: any) => {
								const ranking = new g.Sprite({
									scene,
									parent: scoreLayer,
									src: scene.asset.getImageById("ranking"),
									touchable: true,
								});
								ranking.x = (scoreLayer.width - 250  - ranking.width) / 2;
								ranking.y = replay.y + replay.height + 20;
								ranking.modified();
								const txt = (res.myRecord.rank < 10000) ? `    ${res.myRecord.rank}`.slice(-4) : `${res.myRecord.rank}`;
								new g.Label({
									scene,
									parent: ranking,
									text: txt,
									font: new g.DynamicFont({
										game,
										fontFamily: "sans-serif",
										fontColor: "#ffffff",
										size: 20
									}),
									fontSize: 20,
									x: 62,
									y: 58
								});
								ranking.onPointUp.add(() => {
									window.RPGAtsumaru.scoreboards.display(1);
								});
							});
						});
				} else {
					// ニコ生時は背景を暗くする
					new g.FilledRect({
						scene,
						parent: actionLayer,
						width: container.width,
						height: container.height,
						cssColor: "#000000",
						opacity: 0.4
					});
				}
			}
		});

		const scorer = new Scorer({
			scene,
			font: new g.BitmapFont({
				src: scene.asset.getImageById("score_main"),
				glyphInfo: JSON.parse(scene.asset.getTextById("score_main_glyphs").data)
			}),
			x: scoreLayer.width - 220,
			y: 45,
			panel: scoreLayer,
			size: 30,
			gameState: game.vars.gameState
		});

		const customers: { c: Customer; t: Tweeter }[] = [];
		const collabos: { co: Collabo; t: Tweeter }[] = [];

		customerLayer.onUpdate.add(() => {
			let isCollabo = false;
			collabos.forEach((obj) => {
				if (obj.co.isEffect) {
					isCollabo = true;
				}
			});
			if (!isCollabo) {
				customers.forEach(obj => {
					obj.t.normal();
				});
			}
		});

		const customerFont = new g.DynamicFont({
			game,
			fontFamily: "sans-serif",
			size: 15
		});
		const tweetFont = new g.DynamicFont({
			game,
			fontFamily: "sans-serif",
			size: 15
		});

		const fence = new Fence({
			scene,
			line: 3,
			rough: 1,
			panel: fenceLayer,
			font: new g.DynamicFont({
				game,
				fontFamily: "sans-serif",
				size: 30
			}),
			fontSize: 30,
			fade: 1 * game.fps,
			isPrintEffect: true,
			effectAssets: [
				scene.asset.getImageById("effect_tier1"),
				null,
				scene.asset.getImageById("effect_tier3")
			],
			effectDetailsAssets: [
				scene.asset.getImageById("effect_details_tier1"),
				scene.asset.getImageById("effect_details_tier2"),
				scene.asset.getImageById("effect_details_tier3"),
			],
			onClose: (f: Fence) => {
				let rate = 0;
				switch (f.tier) {
					case 1:
						rate = 0.25;
						break;
					case 2:
						rate = 0.5;
						break;
					default:
						rate = 0.75;
				}
				let anyKilled = false;
				let anyReject = false;
				customers.forEach((obj) => {
					if (f.isInner(obj.c.x, obj.c.y)) {
						if (game.random.generate() < rate) {
							obj.c.kill();
							obj.t.kill();
							anyKilled = true;
							if (!ticker.isEnd) {
								scorer.add(1);
							}
						} else {
							obj.c.reject();
							anyReject = true;
						}
					}
				});
				if (anyKilled) {
					scene.asset.getAudioById("fence_nc227995").play();
				} else if (anyReject) {
					scene.asset.getAudioById("fence_failed_nc63801").play();
				}
				const old = [...customers];
				customers.splice(0);
				old.forEach((obj) => {
					if (!obj.c.killed) {
						customers.push(obj);
					}
				});
				fence.clear();
			}
		});

		const collaboInfos = [{
			tier: 1,
			name: "友人",
			effectText: "薄口",
			rate: 0.1,
			boost: 0.2,
			coolDown: 5 * game.fps,
			effect: 5 * game.fps,
			minScore: 1,
			messages: ["どーもー", "友人です", "一緒にやります", "それな", "そうそう", "それでね"],
			isFestival: false,
		}, {
			tier: 2,
			name: "中堅放送者",
			effectText: "中",
			rate: 0.3,
			boost: 0.4,
			coolDown: 10 * game.fps,
			effect: 5 * game.fps,
			minScore: 10,
			messages: ["まいど！", "やってくぜ", "おもろ！", "そんでな", "ほうほう"],
			isFestival: false,
		}, {
			tier: 3,
			name: "大物放送者",
			effectText: "濃口",
			rate: 0.7,
			boost: 0.8,
			coolDown: 20 * game.fps,
			effect: 5 * game.fps,
			minScore: 30,
			messages: ["わしじゃ", "ようこそ", "ほっほっほっ", "よきに"],
			isFestival: true,
		}];

		collaboInfos.forEach((info, i) => {
			const container = new g.E({
				scene,
				parent: actionLayer,
				x: actionLayer.width - 250,
				y: i * 120 + 220,
				width: 200,
				height: 100
			});

			const collaboTweeter = new Tweeter({
				asset: scene.asset.getImageById("tweet_img"),
				effect: 2 * game.fps,
				delay: 0,
				coolDown: 1 * game.fps,
				font: new g.DynamicFont({
					game,
					fontFamily: "sans-serif",
					size: 15
				}),
				scene,
				panel: castTweetLayer,
				position: () => ({
					x: tweetLayer.width / 2 + 128,
					y: tweetLayer.height / 2
				}),
				rand: game.random,
				size: 15,
				scale: 0.25,
				events: {
					start: {
						messages: [],
						rate: 1.0
					},
					normal: {
						messages: [],
						rate: 1.0
					},
					advertise: {
						messages: [],
						rate: 0.0
					},
					collabo: {
						messages: info.messages,
						rate: 1.0
					},
					end: {
						messages: [],
						rate: 1.0
					}
				}
			});

			collabos.push({
				co: new Collabo({
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
					enabledAsset: scene.asset.getImageById(`collabo_tier${info.tier}_enabled`),
					disabledAsset: scene.asset.getImageById(`collabo_tier${info.tier}_disabled`),
					collaboFont: new g.DynamicFont({
						game,
						fontFamily: "sans-serif",
						size: 15
					}),
					collaboText: [`${info.name} とコラボ放送`, `効果: ${info.effectText}`],
					collaboScale: 1.0,
					fontSize: 15,
					enabledColor: "#88ff88",
					disabledColor: "#888888",
					lockedColor: "#666666",
					effectColor: "#0000ff",
					effectHeight: 10,
					coolDownColor: "#8b0000",
					coolDownHeight: 5,
					effect: info.effect,
					minScore: info.minScore,
					opacity: 0.25,
					scorer,
					castAsset: scene.asset.getImageById(`collabo_cast_tier${info.tier}`),
					castLayer,
					onStart: (co) => {
						collaboTweeter.show();
						customers.forEach(obj => {
							if (game.random.generate() < co.rate) {
								obj.c.attract(co.boost, co.effect);
							}
						});
						appendCountDown({
							onStart: () => {
								collabos.forEach(obj => {
									obj.co.enabled = false;
									obj.co.coolDown = info.coolDown;
									obj.co.coolDownCount = info.coolDown;
								});
							},
							onCount: (cnt) => {
								collabos.forEach(obj => {
									obj.co.coolDownCount = cnt;
								});
							},
							onEnd: () => {
								collabos.forEach(obj => {
									obj.co.enabled = true;
									obj.co.coolDownCount = 0;
								});
							}
						}, info.coolDown, container);

						const festivalAssets: g.ImageAsset[] = [];
						for (let i = 0; i < 13; i++) {
							festivalAssets.push(scene.asset.getImageById(`festival${i+1}`));
						}

						if (info.isFestival) {
							new Festival({
								scene,
								panel: festivalLayer,
								rand: game.random,
								assets: festivalAssets,
								num: 120,
								speed: 15,
								audio: scene.asset.getAudioById("festival_nc176457")
							});
						}
					},
					onCollabo: (co) => {
						customers.forEach(obj => {
							if (obj.c.isBoost) {
								obj.t.collabo();
							}
						});
						collaboTweeter.collabo();
						castTweeter.collabo();
					},
					onEnd: () => {
						collaboTweeter.hide();
					},
				}), t: collaboTweeter
			});
		});

		new Advertise({
			scene,
			panel: new g.E({
				scene,
				parent: actionLayer,
				x: actionLayer.width - 250,
				y: 100,
			}),
			enabledAsset: scene.asset.getImageById("advertise_enabled"),
			disabledAsset: scene.asset.getImageById("advertise_disabled"),
			barColor: "#8b0000",
			barHeight: 5,
			coolDown: 10 * game.fps,
			opacity: 1,
			onAdvertise: () => {
				for (let i = 0; i < 10; i++) {
					customers.push(createCustomer({
						game,
						scene,
						customerFont,
						tweetFont,
						fence,
						collabos,
						customerLayer,
						tweetLayer,
						graceful: true,
					}));
				}
				castTweeter.advertise();
				customers.forEach((obj) => {
					obj.t.advertise();
				});
			}
		});
		for (let i = 0; i < 10; i++) {
			customers.push(createCustomer({
				game,
				scene,
				customerFont,
				tweetFont,
				fence,
				collabos,
				customerLayer,
				tweetLayer,
				graceful: false
			}));
		}

		spawn({
			game,
			scene,
			customerLayer,
			customerFont,
			tweetLayer,
			tweetFont,
			customers,
			fence,
			collabos,
			ticker,
			interval: 2 * game.fps
		});

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
