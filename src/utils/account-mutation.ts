let version = 0
let busy = 0
const listeners = new Set<() => void>()
export const localAccountVersion = () => version
export const accountMutationBusy = () => busy > 0
export function markAccountEdit() {
	version++
	for (const listener of listeners) listener()
}
export function beginCalendarMutation() {
	busy++
	markAccountEdit()
	return () => {
		busy--
		markAccountEdit()
	}
}
export function watchAccountEdits(listener: () => void) {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}
