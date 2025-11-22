<script lang="ts">
	import { onMount } from 'svelte';
	import KeyGrid from '$lib/KeyGrid.svelte';
	import { requestPort, openPort, closePort, writeLine, startReadLoop } from '$lib/serial';
	import {
		connectionState,
		macropadState,
		connectionActions,
		macropadActions,
		monitorActions
	} from '$lib/store';
	import SerialLog from '$lib/SerialLog.svelte';

	// Reactive store subscriptions
	$: ({ connected, connection, serialSupported } = $connectionState);
	$: ({ keys, activeKeyIndex } = $macropadState);

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
					<h3>Macro Key Grid</h3>
				</div>
				<div class="section-content">
					<KeyGrid {keys} activeIndex={activeKeyIndex} onkeyclick={handleKeyClick} />
				</div>
			</section>

			<section class="section">
				<div class="section-header">
					<h3>Serial Monitor</h3>
				</div>
				<SerialLog />
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

	@media (max-width: 768px) {
		.panel-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
