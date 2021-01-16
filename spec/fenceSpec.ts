import { Fence } from "fence";

describe("fence", () => {
	it("移動完了すると、閉じた多角形ができる", () => {
		const fence = new Fence();
		fence.start(10, 10);
		fence.extend(20, 10);
		fence.extend(20, 20);
		fence.extend(10, 20);
		fence.end();
		expect(fence.enclosure).toBe(true);
		expect(fence.isInner(0, 0)).toBe(false);
		expect(fence.isInner(10, 10)).toBe(true);
		expect(fence.isInner(10, 15)).toBe(true);
		expect(fence.isInner(15, 15)).toBe(true);
	});

	it("既存の線に触れると、閉じた多角形ができる", () => {
		const fence = new Fence();
		fence.start(10, 10);
		fence.extend(20, 10);
		fence.extend(20, 20);
    fence.extend(15, 0);
		expect(fence.enclosure).toBe(true);
		expect(fence.isInner(15, 15)).toBe(false);
		expect(fence.isInner(15, 0)).toBe(true);

	});
})
;
