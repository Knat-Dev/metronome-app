import { Midi } from '@tonejs/midi';
import { writable } from 'svelte/store';
import { MidiEventType, type MasterTrack } from '../types';

const createMidiStore = () => {
	const { subscribe, set } = writable<MasterTrack>([]);

	return {
		subscribe,
		parseMidiData: async (midiFile: File) => {
			try {
				const midi = new Midi(await midiFile.arrayBuffer());
				const masterTrack = extractAndSortMasterTrack(midi);
				set(masterTrack);
			} catch (error) {
				console.error('Failed to parse MIDI data:', error);
			}
		}
	};
};

const extractAndSortMasterTrack = (midi: Midi): MasterTrack => {
	const timeSignatures = midi.header.timeSignatures;
	const tempos = midi.header.tempos;

	const masterTrack: MasterTrack = [
		...tempos.map((event) => ({
			timestamp: event.ticks,
			type: MidiEventType.Tempo,
			bpm: event.bpm
		})),
		...timeSignatures.map((event) => ({
			timestamp: event.ticks,
			type: MidiEventType.TimeSignature,
			timeSignature: { beatsPerMeasure: event.timeSignature[0], beatUnit: event.timeSignature[1] }
		}))
	];

	return masterTrack.sort((a, b) => a.timestamp - b.timestamp);
};

export const midiStore = createMidiStore();
