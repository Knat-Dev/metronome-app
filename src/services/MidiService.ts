import { Midi } from '@tonejs/midi';
import type SongPart from '../models/SongPart';

export class MidiService {
	private static instance: MidiService | null = null;
	private constructor() {}

	static getInstance(): MidiService {
		if (!MidiService.instance) {
			MidiService.instance = new MidiService();
		}

		return MidiService.instance;
	}

	songParts: SongPart[] = [];

	async parseMidiData(midiFile: File): Promise<SongPart[]> {
		const midi = new Midi(await midiFile.arrayBuffer());
		const songParts: SongPart[] = [];

		const currentBPM = 120; // Default BPM
		let currentTimeSignature = [4, 4]; // Default time signature
		let currentTick = 0; // Initialize tick count

		// Extract tempo and time signature data from the MIDI header
		const timeSignatures = midi.header.timeSignatures;

		for (const event of timeSignatures) {
			// Update the current time signature
			currentTimeSignature = event.timeSignature;

			// Calculate bar amount based on the current tick and the PPQ value from the header
			const ticksPerBeat = midi.header.ppq;
			const ticksPerBar = (ticksPerBeat * currentTimeSignature[0]) / currentTimeSignature[1];

			// Calculate the number of ticks since the last time signature change
			const ticksSinceLastChange = event.ticks - currentTick;
			currentTick = event.ticks;

			// Calculate the number of bars since the last change and round to the nearest integer
			const barsSinceLastChange = Math.round(ticksSinceLastChange / ticksPerBar);

			// Push a new SongPart with the updated time signature
			songParts.push({
				bars: barsSinceLastChange,
				bpm: currentBPM,
				timeSignature: currentTimeSignature
			});
		}

		// Handle the final part if needed (based on the length of the MIDI or additional logic)
		console.log(songParts);
		if (MidiService.instance) MidiService.instance.songParts = songParts;
		return songParts;
	}
}
