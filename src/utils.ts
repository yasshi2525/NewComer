export function appendCountDown(
	callback: {
		onStart?: () => void;
		onCount?: () => void;
		onEnd?: () => void;
	},
	effect: number,
	panel: g.E): void {
	let count = effect;
	callback?.onStart();
	const fn = (): void => {
		if (count <= 0) {
			callback?.onEnd();
			panel.onUpdate.remove(fn);
			return;
		}
    callback?.onCount();
    count--;
	};
	panel.onUpdate.add(fn);
}
