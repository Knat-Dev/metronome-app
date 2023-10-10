export type TimeSignature = {
	beatsPerMeasure: number;
	beatUnit: number;
};

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
