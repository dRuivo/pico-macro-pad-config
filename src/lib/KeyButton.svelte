<script lang="ts">
	interface Props {
		label?: string;
		color?: string;
		index?: number;
		active?: boolean;
		onclick?: (index: number) => void;
	}

	let { label = '', color = '#333333', index = 0, active = false, onclick }: Props = $props();

	function handleClick() {
		onclick?.(index);
	}
</script>

<button class="key" style={`--key-color: ${color};`} class:active onclick={handleClick}>
	<span class="label">{label}</span>
</button>

<style>
	.key {
		border: none;
		border-radius: 0.75rem;
		padding: 0.75rem;
		background: linear-gradient(145deg, #111, #222);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		color: #f5f5f5;
		transition:
			transform 0.05s ease,
			box-shadow 0.05s ease;
		font-size: 0.9rem;
	}

	.key::before {
		content: '';
		position: absolute;
		inset: 4px;
		border-radius: 0.6rem;
		background: radial-gradient(circle at 20% 20%, var(--key-color), #111);
		opacity: 0.5;
		z-index: 0;
	}

	.label {
		position: relative;
		z-index: 1;
		text-align: center;
		word-break: break-word;
	}

	.key:hover {
		transform: translateY(-1px);
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
	}

	.key.active {
		transform: translateY(1px);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
		filter: brightness(1.2);
	}
</style>
