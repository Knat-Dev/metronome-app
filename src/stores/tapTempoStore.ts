import { writable } from 'svelte/store';
import { metronomeStore } from './metronomeStore';

type Tap = number;

enum DefaultSettings {
	TAP_LIMIT = 4,
	TIME_WINDOW_MS = 2000
}

interface TapTempoState {
	taps: Tap[];
	tapLimit: number;
	timeWindowInMs: number;
	emaInterval: number;
	smoothingFactor: number;
}

const initialState: TapTempoState = {
	taps: [],
	tapLimit: DefaultSettings.TAP_LIMIT,
	timeWindowInMs: DefaultSettings.TIME_WINDOW_MS,
	emaInterval: 0,
	smoothingFactor: 0.1
};

const tapTempoStore = writable<TapTempoState>(initialState);

export const recordTap = (): void => {
	tapTempoStore.update((state) => {
		const currentTapTime = performance.now();
		const updatedTaps = state.taps.filter((tap) => currentTapTime - tap < state.timeWindowInMs);
		updatedTaps.push(currentTapTime);

		if (updatedTaps.length >= state.tapLimit) {
			metronomeStore.updateBpm(calculateBPM(updatedTaps, state));
		}

		return { ...state, taps: updatedTaps };
	});
};

const calculateBPM = (taps: Tap[], state: TapTempoState): number => {
	const intervals = [];
	for (let i = 1; i < taps.length; i++) {
		intervals.push(taps[i] - taps[i - 1]);
	}
	const currentInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

	// Update EMA
	const newEmaInterval =
		state.emaInterval === 0
			? currentInterval
			: (currentInterval - state.emaInterval) * state.smoothingFactor + state.emaInterval;

	return Math.round(1 / (newEmaInterval / 1000 / 60));
};
