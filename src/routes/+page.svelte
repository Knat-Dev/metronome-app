<script lang="ts">
	import Metronome from '../components/metronome.svelte';
	import { MidiService } from '../services/MidiService';
	import { TapTempoService } from '../services/TapTempoService';
	let files: FileList;
	const tapTempoService = new TapTempoService();
	const tap = () => {
		tapTempoService.tap();
	};

	$: if (files) {
		// Note that `files` is of type `FileList`, not an Array:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileList
		console.log(files);

		for (const file of files) {
			MidiService.getInstance().parseMidiData(file);
		}
	}
</script>

<button
	class="py-2 px-5 text-violet-700 rounded-md border-violet-700 border hover:bg-violet-700 hover:text-white transition-colors active:bg-violet-600"
	on:click={tap}>Tap to set BPM</button
>
<Metronome />
<input type="file" id="midiFile" accept=".midi, .mid" bind:files />
