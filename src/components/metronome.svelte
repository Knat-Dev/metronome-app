<script lang="ts">
	import { audioService } from '../services/AudioService';
	import { metronomeStore } from '../stores/metronomeStore';
	import { recordTap } from '../stores/tapTempoStore';
	import type { TimeSignature } from '../types';

	let currentTime = 0;
	let isPlaying = false;
	let isPaused = false;
	let hasMidi = false;
	let bpm = 120;
	let timeSignature = { beatsPerMeasure: 4, beatUnit: 4 } as TimeSignature;
	let volume = 50;

	metronomeStore.subscribe((val) => {
		isPlaying = val.isPlaying;
		isPaused = val.isPaused;
		hasMidi = val.hasMidi;
		bpm = val.bpm;
		timeSignature = val.timeSignature;
		volume = Math.round(val.volume * 100);
	});

	const start = (event: Event) => {
		const keyboardEvent = event as KeyboardEvent;
		if (event.type === 'keydown' && keyboardEvent.key !== ' ') return;
		metronomeStore.start();
	};

	const stop = () => {
		metronomeStore.stop();
		currentTime = 0.0;
	};

	const togglePlay = (event: Event) => {
		const keyboardEvent = event as KeyboardEvent;
		if (event.type === 'keydown' && keyboardEvent.key !== ' ') return;
		metronomeStore.togglePlay();
	};

	const tap = (event: Event) => {
		const keyboardEvent = event as KeyboardEvent;
		if (event.type === 'keydown' && keyboardEvent.key !== ' ') return;
		recordTap();
	};

	const emitChange = (event: Event) => {
		const { value } = event.target as HTMLInputElement;
		const asNumber = Number(value);
		if (asNumber < 60) return;
		metronomeStore.updateBpm(asNumber);
	};

	const handleUpdateBeatsPerMeasure = (event: Event) => {
		const { value } = event.target as HTMLInputElement;
		const asNumber = Number(value);
		if (asNumber < 2) return;
		metronomeStore.updateBeatsPerMeasure(asNumber);
	};

	const handleUpdateBeatUnit = (event: Event) => {
		const { value } = event.target as HTMLInputElement;
		const asNumber = Number(value);
		if (asNumber < 4) return;
		metronomeStore.updateBeatUnit(asNumber);
	};

	const handleUpdateVolume = (event: Event) => {
		const { value } = event.target as HTMLInputElement;
		metronomeStore.updateVolume(Number(value) / 100);
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
		<!-- svelte-ignore a11y-autofocus -->
		<button
			autofocus
			class="w-[80px] h-[40px] py-2 px-5 bg-violet-700 text-white rounded-md hover:bg-violet-600 transition-colors"
			on:keydown={togglePlay}
			on:mousedown={togglePlay}>{isPaused ? 'Play' : 'Pause'}</button
		>
		<button
			class="max-w-sm h-[40px] py-2 px-5 text-white rounded-md border-white border hover:bg-violet-700 hover:text-white transition-colors hover:border-violet-700 active:bg-violet-600"
			on:click={stop}>Stop</button
		>
	{:else}
		<button
			class="w-[80px] h-[40px] py-2 px-5 bg-violet-700 text-white rounded-md hover:bg-violet-600 transition-colors"
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
