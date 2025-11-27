<script lang="ts">
	import { SerialExample } from '$lib/components';
	import { monitorState } from '$lib/store.js';

	// Subscribe to monitor state for the log display
	$: ({ log } = $monitorState);
</script>

<svelte:head>
	<title>Serial Development - Pico Macro Pad Config</title>
</svelte:head>

<main>
	<div class="development-page">
		<header>
			<h1>Serial Development & Testing</h1>
			<p>
				This page demonstrates the new serial abstraction layer with emulation capabilities. Perfect
				for development and testing without requiring physical hardware.
			</p>
		</header>

		<div class="examples-grid">
			<!-- Real Serial Connection Example -->
			<div class="example-section">
				<h2>Real Serial Connection</h2>
				<p>Connect to actual hardware via Web Serial API</p>
				<SerialExample mode="real" />
			</div>

			<!-- Emulated Serial Connection Example -->
			<div class="example-section">
				<h2>Emulated Serial Connection</h2>
				<p>Mock MacroPad device for development and testing</p>
				<SerialExample mode="emulated" autoConnect />
			</div>

			<!-- Auto Detection Example -->
			<div class="example-section">
				<h2>Auto Detection</h2>
				<p>Automatically choose emulated mode if Web Serial API is not available</p>
				<SerialExample mode="auto" />
			</div>
		</div>

		<!-- Serial Monitor -->
		<div class="monitor-section">
			<h2>Serial Monitor</h2>
			<div class="log-container">
				{#each log as logLine}
					<div class="log-line">
						<span class="timestamp">
							{logLine.timestamp.toLocaleTimeString()}
						</span>
						<span class="message">{logLine.message}</span>
					</div>
				{/each}
				{#if log.length === 0}
					<div class="empty-log">No messages yet. Connect to a device and send commands.</div>
				{/if}
			</div>
		</div>

		<!-- Development Information -->
		<div class="info-section">
			<h2>Development Features</h2>

			<div class="feature-cards">
				<div class="feature-card">
					<h3>🚀 Quick Development</h3>
					<p>
						No need for physical hardware during development. The emulated mode provides realistic
						responses and behaviors.
					</p>
				</div>

				<div class="feature-card">
					<h3>🧪 Testing Scenarios</h3>
					<p>
						Test various device states, error conditions, and edge cases with the configurable mock
						device.
					</p>
				</div>

				<div class="feature-card">
					<h3>🔄 Seamless Transition</h3>
					<p>
						Switch between emulated and real hardware without changing your code. Perfect for CI/CD
						and cross-platform development.
					</p>
				</div>

				<div class="feature-card">
					<h3>📊 Protocol Testing</h3>
					<p>
						Validate command parsing, response handling, and error scenarios with the mock MacroPad
						device.
					</p>
				</div>
			</div>

			<div class="api-usage">
				<h3>API Usage</h3>
				<pre><code>
{`import { createSerialConnection } from '$lib/serial.js';

// Create a real connection
const realSerial = createSerialConnection('real');

// Create an emulated connection
const emulatedSerial = createSerialConnection('emulated', {
  emulatorOptions: {
    connectionDelay: 1000,
    deviceType: 'stable'
  }
});

// Auto-detect (fallback to emulated if Web Serial unavailable)
const autoSerial = createSerialConnection('auto');

// Connect and use
await connection.connect();
connection.onMessage = (msg) => console.log('Received:', msg);
await connection.sendMessage('get_info');`}
				</code></pre>
			</div>
		</div>
	</div>
</main>

<style>
	.development-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	header {
		margin-bottom: 2rem;
	}

	header h1 {
		color: var(--app-text);
		margin: 0 0 0.5rem 0;
	}

	header p {
		color: var(--app-text-muted);
		font-size: 1.1rem;
	}

	.examples-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.example-section {
		background: var(--app-panel-bg);
		border-radius: var(--radius-xl);
		padding: 1.5rem;
		border: 1px solid var(--app-border);
	}

	.example-section h2 {
		margin: 0 0 0.5rem 0;
		color: var(--app-text);
		font-size: 1.25rem;
	}

	.example-section p {
		margin: 0 0 1rem 0;
		color: var(--app-text-muted);
		font-size: 0.9rem;
	}

	.monitor-section {
		background: var(--app-panel-bg);
		border-radius: var(--radius-xl);
		padding: 1.5rem;
		margin-bottom: 2rem;
		border: 1px solid var(--app-border);
	}

	.monitor-section h2 {
		margin: 0 0 1rem 0;
		color: var(--app-text);
	}

	.log-container {
		background: var(--app-bg);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-md);
		padding: 1rem;
		height: 200px;
		overflow-y: auto;
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}

	.log-line {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.25rem;
	}

	.timestamp {
		color: var(--app-text-muted);
		flex-shrink: 0;
	}

	.message {
		color: var(--app-text);
	}

	.empty-log {
		color: var(--app-text-muted);
		font-style: italic;
		text-align: center;
		padding: 2rem;
	}

	.info-section {
		background: var(--app-panel-bg);
		border-radius: var(--radius-xl);
		padding: 1.5rem;
		border: 1px solid var(--app-border);
	}

	.info-section h2 {
		margin: 0 0 1.5rem 0;
		color: var(--app-text);
	}

	.feature-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.feature-card {
		background: var(--app-bg);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		padding: 1rem;
	}

	.feature-card h3 {
		margin: 0 0 0.5rem 0;
		color: var(--app-text);
		font-size: 1rem;
	}

	.feature-card p {
		margin: 0;
		color: var(--app-text-muted);
		font-size: var(--text-sm);
		line-height: 1.4;
	}

	.api-usage {
		border-top: 1px solid var(--app-border);
		padding-top: 1.5rem;
	}

	.api-usage h3 {
		margin: 0 0 1rem 0;
		color: var(--app-text);
	}

	.api-usage pre {
		background: var(--app-bg);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-md);
		padding: 1rem;
		overflow-x: auto;
		margin: 0;
		box-shadow: var(--shadow-sm);
	}

	.api-usage code {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--app-text);
	}
</style>
