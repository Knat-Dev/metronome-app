import { Midi } from '@tonejs/midi';
import type SongPart from '../models/SongPart';

export type MasterTrack = {
	timestamp: number;
	type: string;
	bpm?: number;
	timeSignature?: number[];
}[];

export class MidiService {
	private static instance: MidiService | null = null;
	masterTrack = [] as MasterTrack;
	private constructor() {}

	static getInstance(): MidiService {
		if (!MidiService.instance) {
			MidiService.instance = new MidiService();
		}

		return MidiService.instance;
	}

	songParts: SongPart[] = [];

	async parseMidiData(midiFile: File): Promise<void> {
		const midi = new Midi(await midiFile.arrayBuffer());

		// Extract tempo and time signature data from the MIDI header
		const timeSignatures = midi.header.timeSignatures;
		const tempos = midi.header.tempos;

		const masterTrack: MasterTrack = [
			...tempos.map((event) => ({
				timestamp: event.ticks,
				type: 'tempo',
				bpm: event.bpm
			})),
			...timeSignatures.map((event) => ({
				timestamp: event.ticks,
				type: 'timeSignature',
				timeSignature: [event.timeSignature[0], event.timeSignature[1]]
			}))
		];
		masterTrack.sort((a, b) => a.timestamp - b.timestamp);
		this.masterTrack = masterTrack;
	}
}
