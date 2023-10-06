import { Singleton } from '../classes/Singleton';
import { updateBpm } from '../stores/metronomeStore';

type Tap = number;

enum DefaultSettings {
	TAP_LIMIT = 4,
	TIME_WINDOW_MS = 2000
}

export class TapTempoService extends Singleton {
	private taps: Tap[] = [];
	private tapLimit: number;
	private timeWindowInMs: number;
	private emaInterval: number = 0; // Exponential Moving Average of intervals
	private smoothingFactor: number = 0.1; // Adjust this between 0 and 1

	constructor(
		tapLimit = DefaultSettings.TAP_LIMIT,
		timeWindowInMs = DefaultSettings.TIME_WINDOW_MS
	) {
		super();
		this.tapLimit = tapLimit;
		this.timeWindowInMs = timeWindowInMs;
	}

	recordTap(): void {
		const currentTapTime = performance.now();
		this.removeExpiredTaps(currentTapTime);
		this.taps.push(currentTapTime);
		if (this.isEnoughTapsForCalculation()) {
			const bpm = this.calculateBPM();
			updateBpm(bpm);
		}
	}

	private removeExpiredTaps(currentTime: number): void {
		this.taps = this.taps.filter((tap) => currentTime - tap < this.timeWindowInMs);
	}

	private isEnoughTapsForCalculation(): boolean {
		return this.taps.length >= this.tapLimit;
	}

	private updateEMA(currentInterval: number) {
		if (this.emaInterval === 0) {
			this.emaInterval = currentInterval;
		} else {
			this.emaInterval =
				(currentInterval - this.emaInterval) * this.smoothingFactor + this.emaInterval;
		}
	}

	private calculateBPM(): number {
		const intervals = [];
		for (let i = 1; i < this.taps.length; i++) {
			intervals.push(this.taps[i] - this.taps[i - 1]);
		}
		const currentInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
		this.updateEMA(currentInterval);

		return Math.round(1 / (this.emaInterval / 1000 / 60));
	}
}

export const tapTempoService = TapTempoService.getInstance();
