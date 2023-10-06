<script lang="ts">
	import { onDestroy } from 'svelte';
	import { audioService } from '../services/AudioService';
	import { metronomeService } from '../services/MetronomeService';
	import { tapTempoService } from '../services/TapTempoService';
	import metronomeStore, {
		updateBeatUnit,
		updateBeatsPerMeasure,
		updateBpm,
		updateVolume,
		type TimeSignature
	} from '../stores/metronomeStore';

	let currentTime = 0;
	let isPlaying = false;
	let isPaused = false;
	let hasMidi = false;
	let bpm = 120;
	let timeSignature = { beatsPerMeasure: 4, beatUnit: 4 } as TimeSignature;
	let volume = 1;

	metronomeStore.subscribe((val) => {
		isPlaying = val.isPlaying;
		isPaused = val.isPaused;
		hasMidi = val.hasMidi;
		bpm = val.bpm;
		timeSignature = val.timeSignature;
		volume = val.volume;
	});

	const start = (event: Event) => {
		const keyboardEvent = event as KeyboardEvent;
		if (event.type === 'keydown' && keyboardEvent.key !== 'Space') return;
		metronomeService.start();
	};

	const stop = () => {
		metronomeService.stop();
		currentTime = 0.0;
	};

	const togglePlay = (event: Event) => {
		const keyboardEvent = event as KeyboardEvent;
		if (event.type === 'keydown' && keyboardEvent.key !== 'Space') return;
		metronomeService.togglePlay();
	};

	const tap = () => {
		tapTempoService.recordTap();
	};

	const emitChange = (event: Event) => {
		const { value } = event.target as HTMLInputElement;
		if (Number(value) < 60) return;
		updateBpm(value);
	};

	const handleUpdateBeatsPerMeasure = (event: Event) => {
		const { value } = event.target as HTMLInputElement;
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

	setInterval(() => {
		if (audioService.audioContext && !isPaused && isPlaying) {
			currentTime = audioService.audioContext.currentTime;
		}
	}, 500);

	// Format time as MM:SS or HH:MM:SS
	const formatTime = (timeInSeconds: number) => {
		const hours = Math.floor(timeInSeconds / 3600);
		const minutes = Math.floor((timeInSeconds - hours * 3600) / 60);
		const seconds = Math.floor(timeInSeconds - hours * 3600 - minutes * 60);

		let formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}`;
		if (hours > 0) {
			formattedTime = `${hours.toString().padStart(2, '0')}:${formattedTime}`;
		}

		return formattedTime;
	};

	onDestroy(() => {
		metronomeService.unsubscribe?.();
	});
</script>

<button
	class="max-w-sm py-2 px-5 text-white rounded-md border-white border hover:bg-violet-700 hover:text-white transition-colors hover:border-violet-700 active:bg-violet-600"
	on:keydown={tap}
	on:mousedown={tap}>Tap to set BPM</button
>
<input
	disabled={hasMidi}
	class="border text-slate-700 py-1 px-2 focus:outline-none focus:border-slate-600 rounded-md"
	min="60"
	type="number"
	value={bpm}
	on:input={emitChange}
/>
<div class="flex w-[200px] gap-2">
	<input
		disabled={hasMidi}
		class="border text-slate-700 py-1 px-2 focus:outline-none focus:border-slate-600 rounded-md w-full"
		min="2"
		type="number"
		value={timeSignature.beatsPerMeasure}
		on:input={handleUpdateBeatsPerMeasure}
	/>
	<input
		disabled={hasMidi}
		class="border text-slate-700 py-1 px-2 focus:outline-none focus:border-slate-600 rounded-md w-full"
		min="4"
		type="number"
		value={timeSignature.beatUnit}
		on:input={handleUpdateBeatUnit}
	/>
</div>
<div class="flex gap-2 pb-0 items-center">
	{#if isPlaying}
		<button
			class="w-[80px] py-2 px-5 bg-violet-700 text-white rounded-md hover:bg-violet-600 transition-colors"
			on:keydown={togglePlay}
			on:mousedown={togglePlay}>{isPaused ? 'Play' : 'Pause'}</button
		>
		<button
			class="max-w-sm py-2 px-5 text-white rounded-md border-white border hover:bg-violet-700 hover:text-white transition-colors hover:border-violet-700 active:bg-violet-600"
			on:click={stop}>Stop</button
		>
	{:else}
		<button
			class="w-[80px] py-2 px-5 bg-violet-700 text-white rounded-md hover:bg-violet-600 transition-colors"
			on:keydown={start}
			on:mousedown={start}>Start</button
		>
	{/if}
</div>
<div>{!isPlaying ? 'Stopped' : isPaused ? 'Paused' : 'Playing'}</div>
<div class="flex gap-4 items-baseline">
	<input
		id="default-range"
		type="range"
		value={volume}
		on:input={handleUpdateVolume}
		class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
	/>
	<div class="w-[30px]">
		{volume}
	</div>
</div>
<div>
	{formatTime(currentTime)}
</div>
