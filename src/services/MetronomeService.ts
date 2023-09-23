import type { Unsubscriber } from 'svelte/store';
import metronomeStore, { updateIsPlaying, type TimeSignature } from '../stores/metronomeStore';
import { AudioService } from './AudioService';

export class MetronomeService {
	public bpm = 120;
	public timeSignature: TimeSignature = { beatsPerMeasure: 4, beatUnit: 4 };
	private audioService = AudioService.getInstance();
	public nextNoteTime = 0.0;
	public beatNumber = 1;
	private intervalID: number | undefined;
	public unsubscribe?: Unsubscriber;

	constructor() {
		this.subscribeToStore();
	}

	subscribeToStore() {
		this.unsubscribe = metronomeStore.subscribe((val) => {
			this.bpm = val.bpm;
			this.timeSignature = val.timeSignature;
		});
	}

	start() {
		if (!this.intervalID) {
			this.audioService?.initAudioContext();
			this.nextNoteTime = 0;
			this.intervalID = setInterval(this.scheduler, 25);
			updateIsPlaying(true);
		}
	}

	stop() {
		if (this.intervalID !== undefined) {
			clearInterval(this.intervalID);
			this.intervalID = undefined;
			this.beatNumber = 1;
			updateIsPlaying(false);
		}
	}

	private scheduler = (): void => {
		if (!this.audioService) return;

		const currentTime = this.audioService.audioContext!.currentTime;

		while (this.nextNoteTime < currentTime) {
			this.audioService.scheduleSound(this.beatNumber, currentTime);
			this.advanceTime();
			this.updateBeatNumber();
		}
	};

	private advanceTime(): void {
		this.nextNoteTime += 60.0 / this.bpm;
	}

	private updateBeatNumber(): void {
		this.beatNumber = (this.beatNumber % this.timeSignature.beatsPerMeasure) + 1;
	}
}
