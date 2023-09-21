import { writable } from 'svelte/store';

const metronomeStore = writable({
	isPlaying: false,
	bpm: 220,
	timeSignature: [4, 4] as [number, number]
});

export default metronomeStore;
