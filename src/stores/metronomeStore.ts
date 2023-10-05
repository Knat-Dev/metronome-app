import { writable } from 'svelte/store';

export type TimeSignature = {
	beatsPerMeasure: number;
	beatUnit: number;
};

const metronomeStore = writable({
	isPlaying: false,
	isPaused: false,
	bpm: 220,
	timeSignature: { beatsPerMeasure: 4, beatUnit: 4 } as TimeSignature,
	volume: 100
});

export const updateIsPlaying = (val: boolean) => {
	metronomeStore.update((state) => ({
		...state,
		isPlaying: val
	}));
};

export const updateIsPaused = (val: boolean) => {
	metronomeStore.update((state) => ({
		...state,
		isPaused: val
	}));
};

export const updateBpm = (val: unknown) => {
	metronomeStore.update((state) => ({
		...state,
		bpm: Number(val)
	}));
};

export const updateBeatsPerMeasure = (val: unknown) => {
	console.log(val);
	metronomeStore.update((state) => ({
		...state,
		timeSignature: { beatsPerMeasure: Number(val), beatUnit: state.timeSignature.beatUnit }
	}));
};

export const updateBeatUnit = (val: unknown) => {
	metronomeStore.update((state) => ({
		...state,
		timeSignature: { beatsPerMeasure: state.timeSignature.beatsPerMeasure, beatUnit: Number(val) }
	}));
};

export const updateVolume = (val: number) => {
	metronomeStore.update((state) => ({
		...state,
		volume: val
	}));
};

export default metronomeStore;
