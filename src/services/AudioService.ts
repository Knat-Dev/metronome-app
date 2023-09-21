export class AudioService {
	static instance: AudioService;
	audioContext: AudioContext | null = null;
	beatNumber: number = 0;
	noteLength = 0.05; // length of "beep" in seconds
	i = 440;
	private constructor() {}

	static getInstance(): AudioService {
		if (!AudioService.instance) {
			AudioService.instance = new AudioService();
		}

		return AudioService.instance;
	}

	initAudioContext() {
		this.audioContext = new AudioContext();
	}

	scheduleSound(beatNumber: number, time: number) {
		if (!this.audioContext) return;
		const osc = this.audioContext.createOscillator();
		const gain = this.audioContext.createGain();

		osc.connect(gain).connect(this.audioContext.destination);
		gain.gain.value = beatNumber === 1 ? 0.5 : 0.25; // Emphasize the first beat
		osc.frequency.value =
			beatNumber === 1 ? (this.i *= Math.pow(2, 1 / 12)) : (this.i *= Math.pow(2, 1 / 12)); // Different frequency for the first beat

		osc.start(time);
		osc.stop(time + this.noteLength);
	}
}
