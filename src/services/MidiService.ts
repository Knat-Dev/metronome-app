// src/services/MidiService.ts
import SongPart from '../models/SongPart';

export class MidiService {
	static parseMidiFile(): SongPart[] {
		// Simulated implementation
		return [new SongPart(4, [4, 4]), new SongPart(3, [3, 4])];
	}
}
