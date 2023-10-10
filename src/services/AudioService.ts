import { Singleton } from '../classes/Singleton';
import { metronomeStore } from '../stores/metronomeStore';

// Named constants for better readability
const DEFAULT_NOTE_LENGTH = 0.025;
const ALMOST_ZERO = 0.001;
const FIRST_BEAT_FREQ = 880;
const OTHER_BEAT_FREQ = 440;

export class AudioService extends Singleton {
	audioContext: AudioContext | null = null;
	beatNumber: number = 0;
	noteLength = DEFAULT_NOTE_LENGTH; // length of "beep" in seconds
	volume = 100;

	constructor() {
		super();
		this.subscribeToVolume();
	}

	private subscribeToVolume() {
		// Unsubscribe logic could be added here if needed
		metronomeStore.subscribe((val) => {
			this.volume = val.volume;
		});
	}

	initAudioContext() {
		try {
			this.audioContext = new AudioContext();
		} catch (error) {
			console.error('Failed to initialize AudioContext:', error);
		}
	}

	scheduleSound(beatNumber: number, time: number) {
		const audioContext = this.ensureAudioContext();
		if (!audioContext) return;

		const osc = audioContext.createOscillator();
		const master = audioContext.createGain();

		this.configureOscillator(osc, master, beatNumber);
		this.startAndStopOscillator(osc, master, time);
	}

	private ensureAudioContext(): AudioContext | null {
		if (!this.audioContext) {
			console.error('AudioContext not initialized.');
			return null;
		}
		return this.audioContext;
	}

	private configureOscillator(osc: OscillatorNode, master: GainNode, beatNumber: number) {
		osc.connect(master).connect(this.audioContext!.destination);
		master.gain.value = this.calculateGain(beatNumber);
		osc.frequency.value = this.calculateFrequency(beatNumber);
	}

	private calculateGain(beatNumber: number): number {
		return this.volume * (beatNumber === 1 ? 1 : 0.6);
	}

	private calculateFrequency(beatNumber: number): number {
		return beatNumber === 1 ? FIRST_BEAT_FREQ : OTHER_BEAT_FREQ;
	}

	private startAndStopOscillator(osc: OscillatorNode, master: GainNode, time: number) {
		osc.start(time);
		master.gain.exponentialRampToValueAtTime(ALMOST_ZERO, time + this.noteLength - ALMOST_ZERO);
		osc.stop(time + this.noteLength);
	}
}

export const audioService = AudioService.getInstance();
