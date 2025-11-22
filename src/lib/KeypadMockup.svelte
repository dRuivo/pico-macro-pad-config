<script lang="ts">
	import type { Key } from './types.js';

	interface Props {
		keys?: Key[];
		activeIndex?: number | null;
		onkeyclick?: (index: number) => void;
	}

	let { keys = [], activeIndex = null, onkeyclick }: Props = $props();

	// Layout values based on real device proportions
	const cols = 4;
	const rows = 4;
	const keySize = 24;
	const keyGap = 8;
	const boardPaddingX = 4;
	const boardPaddingY = 4;
	const picoHeight = 45;
	const picoWidth = 100;

	const boardWidth = boardPaddingX * 2 + cols * keySize + (cols - 1) * keyGap;
	const boardHeight = boardPaddingY * 2 + rows * keySize + (rows - 1) * keyGap + picoHeight + 15;

	function keyPos(i: number) {
		const col = i % cols;
		const row = Math.floor(i / cols);
		const x = boardPaddingX + col * (keySize + keyGap);
		const y = boardPaddingY + picoHeight + 15 + row * (keySize + keyGap);
		return { x, y };
	}

	function handleKeyClick(index: number) {
		onkeyclick?.(index);
	}
</script>

<svg
	viewBox={`0 0 ${boardWidth} ${boardHeight}`}
	xmlns="http://www.w3.org/2000/svg"
	class="keypad-svg"
>
	<!-- Board outline with wireframe appearance -->
	<defs>
		<pattern id="dot-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
			<circle cx="4" cy="4" r="0.5" fill="#e5e7eb" opacity="0.5" />
		</pattern>
		<linearGradient id="board-bg" x1="0" x2="1" y1="0" y2="1">
			<stop offset="0%" stop-color="#ffffff" />
			<stop offset="100%" stop-color="#f9fafb" />
		</linearGradient>
	</defs>

	<!-- PCB Board -->
	<rect
		x="0"
		y="0"
		rx="8"
		ry="8"
		width={boardWidth}
		height={boardHeight}
		fill="url(#board-bg)"
		stroke="#d1d5db"
		stroke-width="2"
	/>

	<!-- Grid pattern overlay -->
	<rect
		x="0"
		y="0"
		width={boardWidth}
		height={boardHeight}
		fill="url(#dot-pattern)"
		rx="8"
		ry="8"
	/>

	<!-- Raspberry Pi Pico (wireframe) -->
	<g transform={`translate(${boardWidth / 2 - picoWidth / 2}, 8)`}>
		<!-- Pico outline -->
		<rect
			x="0"
			y="0"
			rx="4"
			ry="4"
			width={picoWidth}
			height={picoHeight - 8}
			fill="none"
			stroke="#6b7280"
			stroke-width="1.5"
			stroke-dasharray="5,3"
		/>

		<!-- Pico label -->
		<text
			x={picoWidth / 2}
			y={picoHeight / 2 - 4}
			text-anchor="middle"
			fill="#6b7280"
			font-size="8"
			font-family="var(--font-mono)"
			font-weight="400"
		>
			Raspberry Pi Pico
		</text>

		<!-- Pin headers (simplified) -->
		<rect x="8" y="32" width="84" height="2" fill="none" stroke="#9ca3af" stroke-width="1" />
		<rect x="8" y="2" width="84" height="2" fill="none" stroke="#9ca3af" stroke-width="1" />

		<!-- Pin indicators -->
		{#each Array(20) as _, i}
			<circle cx={12 + i * 4} cy="3" r="0.8" fill="none" stroke="#9ca3af" stroke-width="0.5" />
			<circle cx={12 + i * 4} cy="33" r="0.8" fill="none" stroke="#9ca3af" stroke-width="0.5" />
		{/each}
	</g>

	<!-- Keys -->
	{#each keys as key, i}
		{#if i < rows * cols}
			{@const pos = keyPos(i)}
			<g
				transform={`translate(${pos.x}, ${pos.y})`}
				onclick={() => handleKeyClick(i)}
				onkeydown={(e) => e.key === 'Enter' && handleKeyClick(i)}
				role="button"
				tabindex="0"
				aria-label={`Key ${i + 1}: ${key.label}`}
				style="cursor: pointer;"
				class:selected={activeIndex === i}
			>
				<!-- Key outline -->
				<rect
					x="0"
					y="0"
					width={keySize}
					height={keySize}
					rx="4"
					ry="4"
					fill={activeIndex === i ? '#f3f4f6' : '#ffffff'}
					stroke={activeIndex === i ? '#2d8c4b' : '#9ca3af'}
					stroke-width="1"
				/>

				<!-- Key center indicator -->
				<circle
					cx={keySize / 2}
					cy={keySize / 2}
					r="2"
					fill={activeIndex === i ? key.color || '#3b82f6' : 'none'}
					stroke={key.color || '#6b7280'}
					stroke-width="1"
				/>

				<!-- Key number -->
				<text
					x="4"
					y="8"
					fill="#9ca3af"
					font-size="6"
					font-family="var(--font-mono)"
					font-weight="400"
				>
					{i}
				</text>

				<!-- Key label -->
				<text
					x={keySize / 2}
					y={keySize - 4}
					text-anchor="middle"
					fill={activeIndex === i ? '#1f2937' : '#6b7280'}
					font-size="6"
					font-family="var(--font-body)"
					font-weight="400"
				>
					{key.label}
				</text>
			</g>
		{/if}
	{/each}
</svg>

<style>
	.keypad-svg {
		width: 100%;
		max-width: 480px;
		display: block;
		margin: 0 auto;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		transition: all 0.2s ease;
		background: #ffffff;
		border: 1px solid var(--color-neutral-200);
		padding: var(--space-3);
	}

	.keypad-svg:hover {
		box-shadow: var(--shadow-md);
	}

	svg text {
		pointer-events: none;
		font-family: var(--font-mono);
		user-select: none;
	}

	svg g {
		transition: opacity 0.1s ease;
	}

	svg g:hover {
		opacity: 0.8;
	}

	svg g:active {
		opacity: 0.6;
	}

	/* Responsive scaling */
	@media (max-width: 768px) {
		.keypad-svg {
			max-width: 100%;
			padding: var(--space-2);
			margin: 0 var(--space-2);
		}
	}

	@media (max-width: 480px) {
		.keypad-svg {
			padding: var(--space-2);
		}
	}
</style>
