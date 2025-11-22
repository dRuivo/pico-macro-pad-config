<script lang="ts">
	import { onMount } from 'svelte';
	import KeyGrid from '$lib/KeyGrid.svelte';
	import KeypadMockup from '$lib/KeypadMockup.svelte';
	import { requestPort, openPort, closePort, writeLine, startReadLoop } from '$lib/serial';
	import {
		connectionState,
		macropadState,
		monitorState,
		uiState,
		connectionActions,
		macropadActions,
		monitorActions,
		uiActions
	} from '$lib/store';

	// Reactive store subscriptions
	$: ({ connected, connection, serialSupported } = $connectionState);
	$: ({ keys, activeKeyIndex } = $macropadState);
	$: ({ log, txInput } = $monitorState);
	$: ({ currentView } = $uiState);

	// Local state for view toggle
	let mockupView = false;

	onMount(() => {
		connectionActions.setSerialSupported('serial' in navigator);
	});

	async function handleConnect() {
		try {
			const port = await requestPort();
			const conn = await openPort(port, 115200);
			connectionActions.setConnection(conn, true);
			monitorActions.addLog('Connected to device.');

			// start read loop (fire-and-forget)
			startReadLoop(conn, (line: string) => {
				monitorActions.addLog('RX: ' + line);
			});
		} catch (err: any) {
			console.error(err);
			monitorActions.addLog('Error: ' + (err?.message || String(err)));
		}
	}

	async function handleDisconnect() {
		if (!connection) return;
		await closePort(connection);
		connectionActions.setConnection(null, false);
		monitorActions.addLog('Disconnected.');
	}

	async function handleSend() {
		if (!connection || !txInput.trim()) return;
		const line = txInput.trim();
		monitorActions.addLog('TX: ' + line);
		await writeLine(connection, line);
		monitorActions.setTxInput('');
	}

	// When a key is clicked in the grid
	function handleKeyClick(index: number) {
		macropadActions.setActiveKey(index);
		const key = keys[index];

		monitorActions.addLog(`Key clicked: #${index} - ${key.label}`);

		// Example: send a JSON "key pressed" message to the device.
		// Later we can turn this into real config editing or live testing.
		if (connection) {
			const msg = JSON.stringify({
				cmd: 'test_macro',
				index,
				label: key.label
			});
			monitorActions.addLog('TX: ' + msg);
			writeLine(connection, msg);
		}
	}
</script>

<main class="page">
	<header class="topbar">
		<div class="space-x-4">
			<h1>Pico MacroPad Configurator</h1>
			<p class="app-text-muted">Configure your 4×4 macro pad with Web Serial.</p>
		</div>

		{#if !serialSupported}
			<div class="status-error">
				<p>⚠️ Web Serial is not supported in this browser. Try Chrome or Edge.</p>
			</div>
		{:else}
			<div class="space-x-2">
				{#if !connected}
					<button class="btn btn-primary" onclick={handleConnect}>Connect Device</button>
				{:else}
					<button class="btn btn-secondary" onclick={handleDisconnect}>Disconnect</button>
				{/if}
			</div>
		{/if}
	</header>

	<div class="main-content space-y-6">
		<div class="panel-grid">
			<section class="section">
				<div class="section-header">
					<h3>Macro Key Configuration</h3>
					<div class="view-toggle">
						<button
							class="btn btn-ghost btn-sm"
							class:active={!mockupView}
							onclick={() => (mockupView = false)}
						>
							Grid
						</button>
						<button
							class="btn btn-ghost btn-sm"
							class:active={mockupView}
							onclick={() => (mockupView = true)}
						>
							Device
						</button>
					</div>
				</div>
				<div class="section-content">
					{#if mockupView}
						<KeypadMockup {keys} activeIndex={activeKeyIndex} onkeyclick={handleKeyClick} />
					{:else}
						<KeyGrid {keys} activeIndex={activeKeyIndex} onkeyclick={handleKeyClick} />
					{/if}
				</div>
			</section>

			<section class="section">
				<div class="section-header">
					<h3>Serial Monitor</h3>
				</div>
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
			</section>
		</div>
	</div>
</main>

<style>
	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--app-bg);
		color: var(--app-text);
		font-family: var(--font-body);
	}

	.panel-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
		height: 100%;
	}

	.view-toggle {
		display: flex;
		gap: var(--space-1);
		background: var(--app-panel-bg);
		border-radius: var(--radius-md);
		padding: var(--space-1);
	}

	.view-toggle .btn {
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-3);
		min-width: 60px;
	}

	.view-toggle .btn.active {
		background: var(--color-primary-500);
		color: var(--color-neutral-0);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

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

	@media (max-width: 768px) {
		.panel-grid {
			grid-template-columns: 1fr;
		}

		.section-header {
			flex-direction: column;
			gap: var(--space-3);
			align-items: flex-start;
		}
	}
</style>
