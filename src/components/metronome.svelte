<script lang="ts">
	import { MetronomeService } from '../services/MetronomeService';
	import { MidiService } from '../services/MidiService';
	import metronomeStore from '../stores/metronomeStore';

	const metronomeService = new MetronomeService();
	let isPlaying = false;
	let bpm = 120;

	metronomeStore.subscribe((val) => {
		isPlaying = val.isPlaying;
		bpm = val.bpm;
	});

	const start = () => {
		const midiService = MidiService.getInstance();
		metronomeService.start(midiService.songParts);
	};

	const stop = () => {
		metronomeService.stop();
	};

	const emitChange = (event: Event) => {
		const { value } = event.target as HTMLInputElement;
		if (Number(value) < 60) return;
		metronomeStore.update((state) => ({
			...state,
			bpm: Number(value)
		}));
	};
</script>

<input
	class="border py-1 px-2 focus:outline-none focus:border-slate-600 rounded-md"
	min="60"
	type="number"
	value={bpm}
	on:input={emitChange}
/>
<div class="flex gap-2 p-2 pb-0 items-center">
	<button
		class="py-2 px-5 bg-violet-700 text-white rounded-md hover:bg-violet-600 transition-colors"
		on:click={start}>start</button
	>
	<button
		class="py-2 px-5 text-violet-700 rounded-md border-violet-700 border hover:bg-violet-700 hover:text-white transition-colors"
		on:click={stop}>stop</button
	>
</div>
<div>{isPlaying ? 'Playing' : 'Paused'}</div>
