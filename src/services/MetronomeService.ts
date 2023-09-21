import metronomeStore from '../stores/metronomeStore';
import { AudioService } from './AudioService';

export class MetronomeService {
	public bpm = 120;
	public timeSignature = [4, 4];
	private audioService = AudioService.getInstance();
	public nextNoteTime = 0.0;
	public beatNumber = 1;
	private intervalID: number | undefined;

	constructor() {
		this.subscribeToStore();
	}

	subscribeToStore() {
		metronomeStore.subscribe((val) => {
			this.bpm = val.bpm;
			this.timeSignature = val.timeSignature;
		});
	}

	start() {
		this.audioService?.initAudioContext();
		this.nextNoteTime = this.audioService!.audioContext!.currentTime;
		this.intervalID = window.setInterval(this.scheduler, 25);
	}

	stop() {
		if (this.intervalID !== undefined) {
			clearInterval(this.intervalID);
			this.intervalID = undefined;
			this.beatNumber = 1;
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
		this.beatNumber = (this.beatNumber % this.timeSignature[0]) + 1;
	}
}
