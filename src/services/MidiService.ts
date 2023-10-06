import { Midi } from '@tonejs/midi';
import { Singleton } from '../classes/Singleton';
import type { TimeSignature } from '../stores/metronomeStore';

export const MidiEventType = {
	Tempo: 'tempo',
	TimeSignature: 'timeSignature'
} as const;

export interface TempoEvent {
	timestamp: number;
	type: typeof MidiEventType.Tempo;
	bpm: number;
}

export interface TimeSignatureEvent {
	timestamp: number;
	type: typeof MidiEventType.TimeSignature;
	timeSignature: TimeSignature;
}

export type MasterTrackEvent = TempoEvent | TimeSignatureEvent;
export type MasterTrack = MasterTrackEvent[];

export class MidiService extends Singleton {
	private _masterTrack: MasterTrack = [];

	get masterTrack(): MasterTrack {
		return this._masterTrack;
	}

	constructor() {
		super();
	}

	async parseMidiData(midiFile: File): Promise<void> {
		try {
			const midi = new Midi(await midiFile.arrayBuffer());
			this._masterTrack = this.extractAndSortMasterTrack(midi);
		} catch (error) {
			console.error('Failed to parse MIDI data:', error);
			throw new Error('MIDI data parsing failed.');
		}
	}

	private extractAndSortMasterTrack(midi: Midi): MasterTrack {
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
	}
}

export const midiService = MidiService.getInstance();
