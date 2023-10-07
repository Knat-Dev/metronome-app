import type { Unsubscriber } from 'svelte/store';
import { Singleton } from '../classes/Singleton';
import metronomeStore, {
	updateHasMidi,
	updateIsPaused,
	updateIsPlaying,
	type TimeSignature
} from '../stores/metronomeStore';
import { audioService } from './AudioService';
import {
	MidiEventType,
	type MasterTrack,
	type TempoEvent,
	type TimeSignatureEvent
} from './MidiService';

export class MetronomeService extends Singleton {
	private masterTrack: MasterTrack = [];
	public bpm = 120;
	public timeSignature: TimeSignature = { beatsPerMeasure: 4, beatUnit: 4 };
	public nextNoteTime = 0.0;
	public beatNumber = 1;
	private intervalID: number | undefined;
	public unsubscribe?: Unsubscriber;

	constructor() {
		super();
		this.subscribeToStore();
	}

	setMasterTrack(masterTrack: MasterTrack) {
		this.masterTrack = masterTrack;
		updateHasMidi(true);
		audioService?.initAudioContext();
		this.setBpm();
		this.setTimeSignature();
	}

	subscribeToStore() {
		this.unsubscribe = metronomeStore.subscribe((val) => {
			this.bpm = val.bpm;
			this.timeSignature = val.timeSignature;
		});
	}

	start() {
		if (!this.intervalID) {
			audioService?.initAudioContext();
			this.intervalID = setInterval(this.scheduler, 10);
			updateIsPlaying(true);
			updateIsPaused(false);
		}
	}

	stop() {
		if (this.intervalID !== undefined) {
			audioService.audioContext?.close();
			clearInterval(this.intervalID);
			this.intervalID = undefined;
		}
		this.beatNumber = 1;
		this.nextNoteTime = 0.0;
		updateIsPlaying(false);
	}

	restart() {
		this.reset();
		this.start();
	}

	reset() {
		clearInterval(this.intervalID);
		this.intervalID = undefined;
		this.beatNumber = 1;
		this.nextNoteTime = 0.0;
	}

	togglePlay() {
		if (audioService.audioContext) {
			if (!this.intervalID) {
				this.intervalID = setInterval(this.scheduler, 10);
				updateIsPaused(false);
				audioService.audioContext.resume();
			} else {
				clearInterval(this.intervalID);
				this.intervalID = undefined;
				updateIsPaused(true);
				audioService.audioContext.suspend();
			}
		}
	}

	private scheduler = (): void => {
		if (!audioService) return;

		const currentTime = audioService.audioContext!.currentTime;

		while (this.nextNoteTime < currentTime) {
			audioService.scheduleSound(this.beatNumber, currentTime);
			this.firstBeatUpdates();
			this.advanceTime();
			this.updateBeatNumber();
		}
	};

	private firstBeatUpdates() {
		if (this.beatNumber % this.timeSignature.beatsPerMeasure === 1) {
			this.setBpm();
			this.setTimeSignature();
		}
	}

	private setBpm() {
		if (!this.masterTrack?.length) return;

		const currentTimestamp = audioService.audioContext!.currentTime * 1000;

		const tempos = this.masterTrack
			.filter((track) => track.type === MidiEventType.Tempo)
			.filter((track) => track.timestamp <= currentTimestamp) as TempoEvent[];

		const bpm = Math.round(tempos[tempos.length - 1]?.bpm ?? 0);

		if (typeof bpm === 'undefined') return;

		metronomeStore.update((state) => ({
			...state,
			bpm
		}));
	}

	private setTimeSignature() {
		if (!this.masterTrack?.length) return;

		const currentTimestamp = audioService.audioContext!.currentTime * 1000;

		const timeSignatures = this.masterTrack
			.filter((track) => track.type === MidiEventType.TimeSignature)
			.filter((track) => track.timestamp <= currentTimestamp) as TimeSignatureEvent[];

		const timeSignature = timeSignatures[timeSignatures.length - 1]?.timeSignature;

		if (typeof timeSignature === 'undefined') return;

		metronomeStore.update((state) => ({
			...state,
			timeSignature
		}));
	}

	private advanceTime(): void {
		this.nextNoteTime += (60.0 / this.bpm) * (4 / this.timeSignature.beatUnit);
	}

	private updateBeatNumber(): void {
		this.beatNumber = (this.beatNumber % this.timeSignature.beatsPerMeasure) + 1;
	}
}

export const metronomeService = MetronomeService.getInstance();
