<script lang="ts">
	import Metronome from '../components/metronome.svelte';
	import { metronomeService } from '../services/MetronomeService';
	import { midiService } from '../services/MidiService';
	let files: FileList;

	$: if (files) {
		if (files.length > 0)
			midiService.parseMidiData(files[0]).then(() => {
				metronomeService.setMasterTrack(midiService.masterTrack);
				metronomeService.restart();
			});
	}
</script>

<Metronome />
<input class="h-[150px]" type="file" id="midiFile" accept=".midi, .mid" bind:files />
