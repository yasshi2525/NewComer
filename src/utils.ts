export function appendCountDown(
	callback: {
		onStart?: () => void;
		onCount?: (c: number) => void;
		onEnd?: () => void;
	},
	effect: number,
	panel: g.E): void {
	let count = effect;
	if (callback.onStart) {
		callback.onStart();
	}
	const fn = (): void => {
		if (count <= 0) {
			if (callback.onEnd) {
				callback.onEnd();
			}
			panel.onUpdate.remove(fn);
			return;
		}
		if (callback.onCount) {
			callback.onCount(count);
		}
		count--;
	};
	panel.onUpdate.add(fn);
}
