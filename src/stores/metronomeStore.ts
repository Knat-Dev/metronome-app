import { writable } from 'svelte/store';
import { audioService } from '../services/AudioService';
import {
	MidiEventType,
	type MasterTrack,
	type TempoEvent,
	type TimeSignature,
	type TimeSignatureEvent
} from '../types';

export interface MetronomeState {
	isPlaying: boolean;
	isPaused: boolean;
	hasMidi: boolean;
	bpm: number;
	timeSignature: TimeSignature;
	masterTrack: MasterTrack;
	nextNoteTime: number;
	beatNumber: number;
	volume: number;
	interval?: number;
}

const initialState: MetronomeState = {
	isPlaying: false,
	isPaused: false,
	hasMidi: false,
	bpm: 175,
	timeSignature: { beatsPerMeasure: 4, beatUnit: 16 },
	masterTrack: [],
	nextNoteTime: 0.0,
	beatNumber: 1,
	volume: 0.5
};

const store = writable<MetronomeState>(initialState);
const { subscribe, update } = store;

function calculateNextNoteTime(state: MetronomeState) {
	return state.nextNoteTime + (60.0 / state.bpm) * (4 / state.timeSignature.beatUnit);
}

function calculateBeatNumber(state: MetronomeState) {
	return (state.beatNumber % state.timeSignature.beatsPerMeasure) + 1;
}

function scheduler(): void {
	update((state) => {
		if (!audioService) return state;

		const currentTime = audioService.audioContext!.currentTime;

		while (state.nextNoteTime < currentTime) {
			audioService.scheduleSound(state.beatNumber, currentTime);
			while (state.nextNoteTime < currentTime) {
				audioService.scheduleSound(state.beatNumber, currentTime);
				if (state.beatNumber % state.timeSignature.beatsPerMeasure === 1) {
					setBpm(state);
					setTimeSignature(state);
				}

				state.nextNoteTime = calculateNextNoteTime(state);
				state.beatNumber = calculateBeatNumber(state);
			}
		}
		return state;
	});
}

function setBpm(state: MetronomeState) {
	if (!state.masterTrack.length) return;

	const currentTimestamp = audioService.audioContext!.currentTime * 1000;
	const tempos = state.masterTrack
		.filter((track) => track.type === MidiEventType.Tempo)
		.filter((track) => track.timestamp <= currentTimestamp) as TempoEvent[];

	state.bpm = Math.round(tempos[tempos.length - 1]?.bpm ?? 0);
}

function setTimeSignature(state: MetronomeState) {
	if (!state.masterTrack.length) return;

	const currentTimestamp = audioService.audioContext!.currentTime * 1000;
	const timeSignatures = state.masterTrack
		.filter((track) => track.type === MidiEventType.TimeSignature)
		.filter((track) => track.timestamp <= currentTimestamp) as TimeSignatureEvent[];

	state.timeSignature = timeSignatures[timeSignatures.length - 1]?.timeSignature;
}

export const metronomeStore = {
	subscribe,
	setMasterTrack: (masterTrack: MasterTrack) => {
		update((state) => {
			audioService?.initAudioContext();
			return { ...state, masterTrack, hasMidi: true };
		});
	},
	start: () => {
		update((state) => {
			if (state.interval) return state;
			audioService.initAudioContext();
			state.interval = setInterval(scheduler, 10);
			return { ...state, isPlaying: true, isPaused: false };
		});
	},
	stop: () => {
		update((state) => {
			if (state.isPlaying) {
				if (state.interval) {
					clearInterval(state.interval);
					state.interval = undefined;
				}
				metronomeStore.updateIsPlaying(false);
				return { ...state, beatNumber: 1, nextNoteTime: 0.0, isPlaying: false, isPaused: false };
			}
			return state;
		});
	},
	togglePlay: () => {
		update((state) => {
			if (state.isPlaying) {
				if (!state.interval) {
					audioService.audioContext?.resume();
					const interval = setInterval(scheduler, 10);
					return { ...state, isPaused: false, interval };
				} else {
					audioService.audioContext?.suspend();
					clearInterval(state.interval);
					const interval = undefined;
					return { ...state, isPaused: true, interval };
				}
			}

			return state;
		});
	},
	updateBeatNumber: (beatNumber: number) => {
		update((state) => ({ ...state, beatNumber }));
	},
	updateNextNoteTime: (nextNoteTime: number) => {
		update((state) => ({ ...state, nextNoteTime }));
	},
	updateIsPlaying: (isPlaying: boolean) => {
		update((state) => ({ ...state, isPlaying }));
	},
	updateIsPaused: (isPaused: boolean) => {
		update((state) => ({ ...state, isPaused }));
	},
	updateHasMidi: (hasMidi: boolean) => {
		update((state) => ({ ...state, hasMidi: hasMidi }));
	},
	updateBpm: (newBpm: number) => {
		update((state) => ({ ...state, bpm: newBpm }));
	},
	updateTimeSignature: (newTimeSignature: TimeSignature) => {
		update((state) => ({ ...state, timeSignature: newTimeSignature }));
	},
	updateVolume: (newVolume: number) => {
		update((state) => ({ ...state, volume: newVolume }));
	},
	updateBeatsPerMeasure: (beatsPerMeasure: number) => {
		update((state) => ({ ...state, timeSignature: { ...state.timeSignature, beatsPerMeasure } }));
	},
	updateBeatUnit: (beatUnit: number) => {
		update((state) => ({ ...state, timeSignature: { ...state.timeSignature, beatUnit } }));
	},
	updateInterval: (interval: number) => {
		update((state) => ({ ...state, interval }));
	}
};
