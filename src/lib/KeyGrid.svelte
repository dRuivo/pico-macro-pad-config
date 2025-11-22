<script lang="ts">
	import KeyButton from './KeyButton.svelte';
	import type { Key } from './types.js';

	interface Props {
		keys?: Key[];
		activeIndex?: number | null;
		onkeyclick?: (index: number) => void;
	}

	let { keys = [], activeIndex = null, onkeyclick }: Props = $props();

	function handleKeyClick(index: number) {
		onkeyclick?.(index);
	}
</script>

<div class="grid">
	{#each keys as key, i}
		<KeyButton
			label={key.label}
			color={key.color}
			index={i}
			active={activeIndex === i}
			onclick={handleKeyClick}
		/>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
	}
</style>
