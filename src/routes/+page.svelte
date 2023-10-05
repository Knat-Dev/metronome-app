<script lang="ts">
	import Metronome from '../components/metronome.svelte';
	import { MetronomeService } from '../services/MetronomeService';
	import { MidiService } from '../services/MidiService';
	let files: FileList;
	const midiService = MidiService.getInstance();
	const metronomeService = MetronomeService.getInstance();

	$: if (files) {
		// Note that `files` is of type `FileList`, not an Array:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileList

		for (const file of files) {
			midiService.parseMidiData(file).then(() => {
				metronomeService.setMasterTrack(midiService.masterTrack);
			});
		}
	}
</script>

<Metronome />
<input type="file" id="midiFile" accept=".midi, .mid" bind:files />
