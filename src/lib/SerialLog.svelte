<script lang="ts">
	import { monitorState, connectionState, monitorActions } from './store';
	import { requestPort, openPort, closePort, writeLine, startReadLoop } from '$lib/serial';

	$: ({ connected, connection, serialSupported } = $connectionState);
	$: ({ log, txInput } = $monitorState);

	async function handleSend() {
		if (!connection || !txInput.trim()) return;
		const line = txInput.trim();
		monitorActions.addLog('TX: ' + line);
		await writeLine(connection, line);
		monitorActions.setTxInput('');
	}
</script>

<div class="section-content space-y-4">
	<div class="serial-input">
		<input
			type="text"
			placeholder="Type a command to send..."
			bind:value={txInput}
			onkeydown={(e) => e.key === 'Enter' && handleSend()}
			disabled={!connected}
		/>
		<button
			class="btn btn-primary btn-sm"
			onclick={handleSend}
			disabled={!connected || !txInput.trim()}
		>
			Send
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
