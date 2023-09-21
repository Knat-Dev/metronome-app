<script>
	import { onMount } from 'svelte';

	let bpm = 280;
	let isPlaying = false;
	let nextNoteTime = 0.0;
	let noteLength = 0.05; // length of "beep" in seconds
	let beatNumber = 1;
	let timeSignature = [7, 8]; // Initialize as 4/4; array format as [beats per bar, note value]

	/**
	 * @type {number | undefined}
	 */
	let intervalID = undefined;
	/**
	 * @type {AudioContext}
	 */
	let audioContext;

	onMount(() => {
		audioContext = new AudioContext();
	});

	function scheduler() {
		while (nextNoteTime < audioContext.currentTime + 0.1) {
			playSound(audioContext, nextNoteTime, beatNumber);
			nextNoteTime += 60.0 / bpm;

			if (beatNumber >= timeSignature[0]) {
				beatNumber = 1;
			} else {
				beatNumber++;
			}
			console.log(beatNumber);
		}
	}

	/**
	 * @param {AudioContext} context
	 * @param {number} time
	 * @param {number | undefined} [beatNumber]
	 */
	function playSound(context, time, beatNumber) {
		const osc = context.createOscillator();
		const gain = context.createGain();

		osc.connect(gain).connect(context.destination);
		gain.gain.value = beatNumber === 1 ? 1.0 : 0.5; // Emphasize the first beat
		osc.frequency.value = beatNumber === 1 ? 880 : 440; // Different frequency for the first beat

		osc.start(time);
		osc.stop(time + noteLength);
	}

	function play() {
		isPlaying = true;
		nextNoteTime = audioContext.currentTime + 0.05;
		intervalID = setInterval(scheduler, 25);
	}

	function stop() {
		isPlaying = false;
		clearInterval(intervalID);
	}
</script>

<div>
	<label for="bpm">BPM: </label>
	<input id="bpm" type="number" bind:value={bpm} />
</div>
<button on:click={isPlaying ? stop : play}>
	{isPlaying ? 'Stop' : 'Play'}
</button>
