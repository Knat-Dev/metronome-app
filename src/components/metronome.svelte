<script>
	import { onMount } from 'svelte';
	import { MetronomeService } from '../services/MetronomeService';
	const metronomeService = new MetronomeService();

	onMount(() => {
		console.log(metronomeService);
	});

	const start = () => {
		metronomeService.start();
	};

	const stop = () => {
		metronomeService.stop();
	};
</script>

<button on:click={start}>start</button>
<button on:click={stop}>stop</button>
