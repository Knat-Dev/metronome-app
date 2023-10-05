import type { Unsubscriber } from 'svelte/store';
import metronomeStore, {
	updateIsPaused,
	updateIsPlaying,
	type TimeSignature
} from '../stores/metronomeStore';
import { AudioService } from './AudioService';
import type { MasterTrack } from './MidiService';

export class MetronomeService {
	private static instance: MetronomeService | null = null;
	private masterTrack: MasterTrack = [];
	public bpm = 120;
	public timeSignature: TimeSignature = { beatsPerMeasure: 4, beatUnit: 4 };
	private audioService = AudioService.getInstance();
	public nextNoteTime = 0.0;
	private pauseTime: number = 0.0;
	public beatNumber = 1;
	private intervalID: number | undefined;
	public unsubscribe?: Unsubscriber;

	private constructor() {
		this.subscribeToStore();
	}

	static getInstance(): MetronomeService {
		if (!MetronomeService.instance) {
			MetronomeService.instance = new MetronomeService();
		}

		return MetronomeService.instance;
	}

	setMasterTrack(masterTrack: MasterTrack) {
		this.masterTrack = masterTrack;
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
			updateIsPaused(false);
		}
	}

	stop() {
		if (this.intervalID !== undefined) {
			clearInterval(this.intervalID);
			this.intervalID = undefined;
		}
		this.beatNumber = 1;
		updateIsPlaying(false);
	}

	togglePlay() {
		if (!this.intervalID) {
			const currentTime = this.audioService.audioContext!.currentTime;
			const timeElapsedSincePause = currentTime - this.pauseTime;
			this.nextNoteTime += timeElapsedSincePause; // Add the offset to align nextNoteTime with new currentTime
			this.intervalID = setInterval(this.scheduler, 25);
			updateIsPaused(false);
		} else {
			this.pauseTime = this.audioService.audioContext!.currentTime;
			clearInterval(this.intervalID);
			this.intervalID = undefined;
			updateIsPaused(true);
		}
	}

	private scheduler = (): void => {
		if (!this.audioService) return;

		const currentTime = this.audioService.audioContext!.currentTime;

		while (this.nextNoteTime < currentTime) {
			this.audioService.scheduleSound(this.beatNumber, currentTime);
			if (this.beatNumber % this.timeSignature.beatsPerMeasure === 1) {
				this.setBpm();
				this.setTimeSignature();
				console.log('change here');
			}
			this.advanceTime();
			this.updateBeatNumber();
		}
	};

	private setBpm() {
		if (!this.masterTrack?.length) return;

		const currentTimestamp = this.nextNoteTime * 1000;

		const tempos = this.masterTrack
			.filter((track) => track.type === 'tempo')
			.filter((track) => track.timestamp <= currentTimestamp);

		const bpm = Math.round(tempos[tempos.length - 1]?.bpm ?? 0);

		if (typeof bpm === 'undefined') return;

		metronomeStore.update((state) => ({
			...state,
			bpm
		}));
	}

	private setTimeSignature() {
		if (!this.masterTrack?.length) return;

		const currentTimestamp = this.nextNoteTime * 1000;

		const timeSignatures = this.masterTrack
			.filter((track) => track.type === 'timeSignature')
			.filter((track) => track.timestamp <= currentTimestamp);

		const timeSignature = timeSignatures[timeSignatures.length - 1]?.timeSignature ?? [4, 4];

		if (typeof timeSignature === 'undefined') return;

		metronomeStore.update((state) => ({
			...state,
			timeSignature: { beatsPerMeasure: timeSignature[0], beatUnit: timeSignature[1] }
		}));
	}

	private advanceTime(): void {
		this.nextNoteTime += (60.0 / this.bpm) * (4 / this.timeSignature.beatUnit);
	}

	private updateBeatNumber(): void {
		this.beatNumber = (this.beatNumber % this.timeSignature.beatsPerMeasure) + 1;
	}
}
