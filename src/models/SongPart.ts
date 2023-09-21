export default class SongPart {
	constructor(
		public bpm: number,
		public timeSignature: number[],
		public startTick?: number,
		public endTick?: number,
		public bars?: number
	) {}
}
