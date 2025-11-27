<script lang="ts">
	import { onMount } from 'svelte';
	import { createSerialConnection, type SerialConnection, type SerialMode } from '$lib/serial.js';
	import { monitorActions } from '$lib/store.js';

	// Component props
	interface Props {
		mode?: SerialMode;
		autoConnect?: boolean;
	}

	let { mode = 'auto', autoConnect = false }: Props = $props();

	// Component state
	let connection: SerialConnection | null = null;
	let isConnected = $state(false);
	let connectionStatus = $state('Disconnected');
	let testMessage = $state('get_info');

	onMount(() => {
		if (autoConnect) {
			handleConnect();
		}
	});

	async function handleConnect() {
		try {
			connectionStatus = 'Connecting...';

			// Create connection with specified mode
			connection = createSerialConnection(mode, {
				emulatorOptions: {
					connectionDelay: 1000,
					deviceType: 'stable'
				}
			});

			// Set up event listeners
			connection.onData((message: string) => {
				monitorActions.addLog(`Received: ${message}`);
			});

			connection.onError((error: Error) => {
				monitorActions.addLog(`Error: ${error.message}`);
				connectionStatus = `Error: ${error.message}`;
			});

			connection.onDisconnect(() => {
				isConnected = false;
				connectionStatus = 'Disconnected';
			});

			// Attempt to connect
			await connection.open();
			isConnected = connection.isOpen();
			connectionStatus = isConnected ? 'Connected' : 'Failed to connect';
		} catch (error) {
			connectionStatus = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
			monitorActions.addLog(`Connection failed: ${error}`);
		}
	}

	async function handleDisconnect() {
		if (connection) {
			await connection.close();
			connection = null;
			isConnected = false;
			connectionStatus = 'Disconnected';
		}
	}

	async function sendTestMessage() {
		if (connection && isConnected) {
			try {
				await connection.writeLine(testMessage);
				monitorActions.addLog(`Sent: ${testMessage}`);
			} catch (error) {
				monitorActions.addLog(`Send failed: ${error}`);
			}
		}
	}

	async function sendCommand(command: string) {
		if (connection && isConnected) {
			try {
				await connection.writeLine(command);
				monitorActions.addLog(`Command sent: ${command}`);
			} catch (error) {
				monitorActions.addLog(`Command failed: ${error}`);
			}
		}
	}
</script>

<div class="serial-example">
	<div class="connection-panel">
		<h3>Serial Connection ({mode} mode)</h3>

		<div class="status">
			<div class="status-indicator" class:connected={isConnected}></div>
			<span>{connectionStatus}</span>
		</div>

		<div class="connection-controls">
			{#if !isConnected}
				<button onclick={handleConnect} class="connect-btn"> Connect </button>
			{:else}
				<button onclick={handleDisconnect} class="disconnect-btn"> Disconnect </button>
			{/if}
		</div>
	</div>

	{#if isConnected}
		<div class="command-panel">
			<h4>Test Commands</h4>

			<div class="message-input">
				<input
					bind:value={testMessage}
					placeholder="Enter command..."
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							sendTestMessage();
						}
					}}
				/>
				<button onclick={sendTestMessage} class="send-btn">Send</button>
			</div>

			<div class="quick-commands">
				<button onclick={() => sendCommand('get_info')}>Get Info</button>
				<button onclick={() => sendCommand('get_config')}>Get Config</button>
				<button onclick={() => sendCommand('list_keys')}>List Keys</button>
				<button onclick={() => sendCommand('reset')}>Reset</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.serial-example {
		padding: 1rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: var(--color-bg);
		margin: 1rem 0;
	}

	.connection-panel h3 {
		margin: 0 0 1rem 0;
		color: var(--color-text-primary);
	}

	.status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.status-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background-color: var(--color-danger);
		transition: background-color 0.2s;
	}

	.status-indicator.connected {
		background-color: var(--color-success);
	}

	.connection-controls {
		margin-bottom: 1rem;
	}

	.connect-btn {
		background: var(--color-success);
		color: black;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.connect-btn:hover {
		background: var(--color-success-dark, #059669);
	}

	.disconnect-btn {
		background: var(--color-danger);
		color: black;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.disconnect-btn:hover {
		background: var(--color-danger-dark, #dc2626);
	}

	.command-panel {
		border-top: 1px solid var(--color-border);
		padding-top: 1rem;
	}

	.command-panel h4 {
		margin: 0 0 1rem 0;
		color: var(--color-text-primary);
	}

	.message-input {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.message-input input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
	}

	.send-btn {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.send-btn:hover {
		background: var(--color-primary-dark, #3b82f6);
	}

	.quick-commands {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.quick-commands button {
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background-color 0.2s;
	}

	.quick-commands button:hover {
		background: var(--color-border);
	}
</style>
