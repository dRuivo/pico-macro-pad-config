<script lang="ts">
	import { onMount } from 'svelte';
	import KeyGrid from '$lib/KeyGrid.svelte';
	import KeypadMockup from '$lib/KeypadMockup.svelte';
	import SerialLog from '$lib/SerialLog.svelte';
	import { createSerialConnection, type SerialConnection, type SerialMode } from '$lib/serial';
	import type { HostCommand, GetConfigCommand, DeviceMessage } from '$lib/types/protocol';
	import { isConfigMessage, isStatusMessage } from '$lib/types/protocol';
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
	$: ({ connected, serialSupported, serialConnection } = $connectionState);
	$: ({ keys, activeKeyIndex } = $macropadState);
	$: ({ log } = $monitorState);
	$: ({ currentView } = $uiState);

	// Local state for view toggle and connection mode
	let mockupView = true;
	let connectionMode: SerialMode = 'auto';

	// Connection mode options for the dropdown
	const connectionModes = [
		{
			value: 'auto',
			label: '🔄 Auto-detect',
			description: 'Real hardware with fallback to emulated'
		},
		{ value: 'real', label: '🔌 Real Hardware', description: 'Connect to physical device only' },
		{ value: 'emulated', label: '🎭 Demo Mode', description: 'Mock device for testing and demos' }
	] as const;

	onMount(() => {
		connectionActions.setSerialSupported('serial' in navigator);
	});

	async function requestConfig(conn: SerialConnection) {
		const cmd: GetConfigCommand = { cmd: 'get_config' };
		const json = JSON.stringify(cmd);
		await conn.writeLine(json);
	}

	function handleLine(line: string) {
		let msg: DeviceMessage | null = null;

		try {
			msg = JSON.parse(line);
		} catch {
			console.warn('Non-JSON line:', line);
			return;
		}

		if (isConfigMessage(msg)) {
			// update UI with msg.macros
		} else if (isStatusMessage(msg)) {
			// show status or error
		} else {
			console.warn('Unknown message:', msg);
		}
	}

	async function handleConnect() {
		try {
			const modeLabel =
				connectionModes.find((m) => m.value === connectionMode)?.label || connectionMode;
			monitorActions.addLog(`Connecting in ${modeLabel} mode...`);

			// Create connection with selected mode
			const conn = createSerialConnection(connectionMode, {
				emulatorOptions: {
					connectionDelay: 1000,
					deviceType: 'stable'
				}
			});

			// Set up event listeners
			conn.onData((line: string) => {
				monitorActions.addLog('RX: ' + line);
				handleLine(line);
			});

			conn.onError((error: Error) => {
				monitorActions.addLog(`Error: ${error.message}`);
			});

			conn.onDisconnect(() => {
				monitorActions.addLog('Disconnected');
				connectionActions.setConnected(false);
				connectionActions.setSerialConnection(null);
			});

			// Connect
			await conn.open();

			connectionActions.setSerialConnection(conn);
			connectionActions.setConnected(true);
			monitorActions.addLog('Connected to device.');

			await requestConfig(conn);
		} catch (err: any) {
			console.error(err);
			monitorActions.addLog('Error: ' + (err?.message || String(err)));
		}
	}

	async function handleDisconnect() {
		if (serialConnection) {
			try {
				await serialConnection.close();
				monitorActions.addLog('Disconnected.');
			} catch (err: any) {
				monitorActions.addLog(`Disconnect error: ${err?.message || String(err)}`);
			}
			connectionActions.setConnected(false);
			connectionActions.setSerialConnection(null);
		}
	}

	// When a key is clicked in the grid
	function handleKeyClick(index: number) {
		macropadActions.setActiveKey(index);
		const key = keys[index];

		monitorActions.addLog(`Key clicked: #${index} - ${key.label}`);

		// Example: send a JSON "key pressed" message to the device.
		if (serialConnection && connected) {
			const msg = JSON.stringify({
				cmd: 'test_macro',
				index,
				label: key.label
			});
			monitorActions.addLog('TX: ' + msg);
			serialConnection.writeLine(msg);
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
			<div class="status-warning">
				<p>⚠️ Web Serial not supported. Using demo mode only.</p>
			</div>
		{:else}
			<div class="connection-controls">
				<div class="mode-selector">
					<label for="connection-mode">Connection Mode:</label>
					<select id="connection-mode" bind:value={connectionMode} disabled={connected}>
						{#each connectionModes as mode}
							<option value={mode.value}>{mode.label}</option>
						{/each}
					</select>
					<small class="mode-description">
						{connectionModes.find((m) => m.value === connectionMode)?.description}
					</small>
				</div>

				<div class="connection-actions">
					{#if !connected}
						<button class="btn btn-primary" onclick={handleConnect}>Connect Device</button>
					{:else}
						<button class="btn btn-secondary" onclick={handleDisconnect}>Disconnect</button>
					{/if}
				</div>
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

	/* Connection Controls */
	.connection-controls {
		display: flex;
		align-items: flex-end;
		gap: var(--space-6);
	}

	.mode-selector {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 200px;
	}

	.mode-selector label {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--app-text);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	.mode-selector select {
		height: var(--input-height-md);
		font-size: var(--text-sm);
		border-radius: var(--radius-md);
		border: 1px solid var(--app-border);
		background: var(--app-bg);
		color: var(--app-text);
		padding: 0 var(--space-3);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mode-selector select:hover:not(:disabled) {
		border-color: var(--color-primary-300);
	}

	.mode-selector select:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgb(45 140 75 / 0.1);
	}

	.mode-selector select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.mode-description {
		font-size: var(--text-xs);
		color: var(--app-text-muted);
		margin: 0;
		font-style: italic;
		line-height: 1.3;
	}

	.connection-actions {
		display: flex;
		gap: var(--space-2);
	}

	.status-warning {
		background: var(--color-warning-50);
		color: var(--color-warning-700);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-warning-200);
	}

	.status-warning p {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: 500;
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

		.connection-controls {
			flex-direction: column;
			align-items: stretch;
			gap: var(--space-4);
		}

		.mode-selector {
			min-width: auto;
		}

		.topbar {
			flex-direction: column;
			height: auto;
			padding: var(--space-4);
			gap: var(--space-4);
			align-items: stretch;
		}

		.topbar > div {
			flex-direction: column;
			gap: var(--space-2);
			align-items: flex-start;
		}
	}
</style>
