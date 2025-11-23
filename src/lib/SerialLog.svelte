<script lang="ts">
	import { monitorState, connectionState, monitorActions } from './store';
	import { requestPort, openPort, closePort, writeLine, startReadLoop } from '$lib/serial';

	$: ({ connected, connection, serialSupported } = $connectionState);
	$: ({ log } = $monitorState);

	// Use a simple local variable for the input
	let inputValue = '';

	async function handleSend() {
		if (!connection || !inputValue.trim()) return;
		const line = inputValue.trim();
		monitorActions.addLog('TX: ' + line);
		try {
			await writeLine(connection, line);
		} catch (err) {
			console.error('Send error:', err);
			monitorActions.addLog('Error sending: ' + (err instanceof Error ? err.message : String(err)));
		}
		inputValue = ''; // Clear the input
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSend();
		}
	}

	function handleClear() {
		monitorActions.clearLog();
	}
</script>

<div class="section-content space-y-4">
	<div class="serial-input">
		<input
			type="text"
			placeholder="Type a command to send..."
			bind:value={inputValue}
			onkeydown={handleKeydown}
			disabled={!connected}
		/>
		<button
			class="btn btn-primary btn-sm"
			onclick={handleSend}
			disabled={!connected || !inputValue.trim()}
		>
			Send
		</button>
		<button class="btn btn-primary btn-sm" onclick={handleClear} disabled={!connected}>
			Clear Log
		</button>
	</div>
	<div class="serial-log">
		<pre>{#each log as logLine}[{logLine.timestamp.toLocaleTimeString()}] {logLine.message}
			{/each}</pre>
	</div>
</div>

<style>
	.serial-input {
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}

	.serial-input input {
		flex: 1;
	}

	.serial-log {
		background: var(--app-panel-bg);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		max-height: 400px;
		overflow-y: auto;
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}

	.serial-log pre {
		margin: 0;
		color: var(--app-text);
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style>
