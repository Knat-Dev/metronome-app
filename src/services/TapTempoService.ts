import { updateBpm } from '../stores/metronomeStore';

export class TapTempoService {
	private taps: number[] = [];
	private tapLimit: number;
	private timeWindow: number; // in milliseconds

	constructor(tapLimit = 4, timeWindow = 2000) {
		this.tapLimit = tapLimit;
		this.timeWindow = timeWindow;
	}

	tap() {
		const now = performance.now();

		// Remove taps that are too old
		this.taps = this.taps.filter((tap) => now - tap < this.timeWindow);

		this.taps.push(now);
		if (this.taps.length >= this.tapLimit) {
			const bpm = this.calculateBPM();
			updateBpm(bpm);
		}
	}

	private calculateBPM(): number {
		const intervals = [];
		for (let i = 1; i < this.taps.length; i++) {
			intervals.push(this.taps[i] - this.taps[i - 1]);
		}

		const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
		return Math.round(1 / (averageInterval / 1000 / 60));
	}
}
