import type { Unsubscriber } from 'svelte/store';
import metronomeStore, {
	updateHasMidi,
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
		updateHasMidi(true);
		this.audioService?.initAudioContext();
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
			this.audioService?.initAudioContext();
			this.intervalID = setInterval(this.scheduler, 25);
			updateIsPlaying(true);
			updateIsPaused(false);
		}
	}

	stop() {
		if (this.intervalID !== undefined) {
			this.audioService.audioContext?.close();
			clearInterval(this.intervalID);
			this.intervalID = undefined;
		}
		this.beatNumber = 1;
		this.nextNoteTime = 0.0;
		updateIsPlaying(false);
	}

	reset() {
		clearInterval(this.intervalID);
		this.intervalID = undefined;
		this.beatNumber = 1;
		this.nextNoteTime = 0.0;
	}

	togglePlay() {
		if (this.audioService.audioContext) {
			if (!this.intervalID) {
				this.intervalID = setInterval(this.scheduler, 25);
				updateIsPaused(false);
				this.audioService.audioContext.resume();
			} else {
				clearInterval(this.intervalID);
				this.intervalID = undefined;
				updateIsPaused(true);
				this.audioService.audioContext.suspend();
			}
		}
	}

	private scheduler = (): void => {
		if (!this.audioService) return;

		const currentTime = this.audioService.audioContext!.currentTime;

		while (this.nextNoteTime < currentTime) {
			this.audioService.scheduleSound(this.beatNumber, currentTime);
			this.firstBeatUpdate();
			this.advanceTime();
			this.updateBeatNumber();
		}
	};

	private firstBeatUpdate() {
		if (this.beatNumber % this.timeSignature.beatsPerMeasure === 1) {
			this.setBpm();
			this.setTimeSignature();
		}
	}

	private setBpm() {
		if (!this.masterTrack?.length) return;

		const currentTimestamp = this.audioService.audioContext!.currentTime * 1000;

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

		const currentTimestamp = this.audioService.audioContext!.currentTime * 1000;

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
