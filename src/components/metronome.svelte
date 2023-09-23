<script lang="ts">
	import { onDestroy } from 'svelte';
	import { MetronomeService } from '../services/MetronomeService';
	import { TapTempoService } from '../services/TapTempoService';
	import metronomeStore, {
		updateBeatUnit,
		updateBeatsPerMeasure,
		updateBpm,
		updateVolume,
		type TimeSignature
	} from '../stores/metronomeStore';

	const tapTempoService = new TapTempoService();
	const metronomeService = new MetronomeService();

	let isPlaying = false;
	let bpm = 120;
	let timeSignature = { beatsPerMeasure: 4, beatUnit: 4 } as TimeSignature;
	let volume = 1;

	metronomeStore.subscribe((val) => {
		isPlaying = val.isPlaying;
		bpm = val.bpm;
		timeSignature = val.timeSignature;
		volume = val.volume;
	});

	const start = () => {
		// const midiService = MidiService.getInstance();
		metronomeService.start();
	};

	const stop = () => {
		metronomeService.stop();
	};

	const tap = () => {
		tapTempoService.tap();
	};

	const emitChange = (event: Event) => {
		const { value } = event.target as HTMLInputElement;
		if (Number(value) < 60) return;
		updateBpm(value);
	};

	const handleUpdateBeatsPerMeasure = (event: Event) => {
		const { value } = event.target as HTMLInputElement;
		console.log(value);
		if (Number(value) < 2) return;
		updateBeatsPerMeasure(value);
	};

	const handleUpdateBeatUnit = (event: Event) => {
		const { value } = event.target as HTMLInputElement;
		if (Number(value) < 4) return;
		updateBeatUnit(value);
	};

	const handleUpdateVolume = (event: Event) => {
		const { value } = event.target as HTMLInputElement;
		updateVolume(Number(value));
	};

	onDestroy(() => {
		metronomeService.unsubscribe?.();
	});
</script>

<button
	class="max-w-sm py-2 px-5 text-white rounded-md border-white border hover:bg-violet-700 hover:text-white transition-colors hover:border-violet-700 active:bg-violet-600"
	on:click={tap}>Tap to set BPM</button
>
<input
	class="border text-slate-700 py-1 px-2 focus:outline-none focus:border-slate-600 rounded-md"
	min="60"
	type="number"
	value={bpm}
	on:input={emitChange}
/>
<div class="flex w-[200px] gap-2">
	<input
		class="border text-slate-700 py-1 px-2 focus:outline-none focus:border-slate-600 rounded-md w-full"
		min="2"
		type="number"
		value={timeSignature.beatsPerMeasure}
		on:input={handleUpdateBeatsPerMeasure}
	/>
	<input
		class="border text-slate-700 py-1 px-2 focus:outline-none focus:border-slate-600 rounded-md w-full"
		min="4"
		type="number"
		value={timeSignature.beatUnit}
		on:input={handleUpdateBeatUnit}
	/>
</div>
<div class="flex gap-2 pb-0 items-center">
	<button
		class="py-2 px-5 bg-violet-700 text-white rounded-md hover:bg-violet-600 transition-colors"
		on:click={start}>start</button
	>
	<button
		class="max-w-sm py-2 px-5 text-white rounded-md border-white border hover:bg-violet-700 hover:text-white transition-colors hover:border-violet-700 active:bg-violet-600"
		on:click={stop}>stop</button
	>
</div>
<div>{isPlaying ? 'Playing' : 'Paused'}</div>
<input
	id="default-range"
	type="range"
	value={volume}
	on:input={handleUpdateVolume}
	class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
/>
{volume}
