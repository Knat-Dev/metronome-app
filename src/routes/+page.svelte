<script lang="ts">
	import Metronome from '../components/metronome.svelte';
	import { MidiService } from '../services/MidiService';
	let files: FileList;

	$: if (files) {
		// Note that `files` is of type `FileList`, not an Array:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileList
		console.log(files);

		for (const file of files) {
			MidiService.getInstance().parseMidiData(file);
		}
	}
</script>

<Metronome />
<!-- <input type="file" id="midiFile" accept=".midi, .mid" bind:files /> -->
