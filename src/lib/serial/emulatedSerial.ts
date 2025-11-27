import type {
	SerialConnection,
	SerialOptions,
	MacroPadCommand,
	MacroPadResponse
} from './types.js';

export class EmulatedSerialConnection implements SerialConnection {
	private isConnected = false;
	private dataCallback?: (data: string) => void;
	private errorCallback?: (error: Error) => void;
	private disconnectCallback?: () => void;
	private mockDevice: MockMacroPadDevice;
	private connectionDelay: number;

	constructor(
		options: {
			connectionDelay?: number;
			deviceType?: 'stable' | 'unstable' | 'slow';
		} = {}
	) {
		this.connectionDelay = options.connectionDelay || 100;
		this.mockDevice = new MockMacroPadDevice(options.deviceType || 'stable');
	}

	async open(options: SerialOptions = { baudRate: 115200 }): Promise<void> {
		// Simulate connection delay
		await new Promise((resolve) => setTimeout(resolve, this.connectionDelay));

		this.isConnected = true;
		this.mockDevice.start((data) => {
			if (this.dataCallback) {
				this.dataCallback(data);
			}
		});

		console.log(`🎭 Emulated serial connected at ${options.baudRate} baud`);

		// Send initial connection message
		setTimeout(() => {
			if (this.dataCallback) {
				this.dataCallback('Device ready');
			}
		}, 50);
	}

	async close(): Promise<void> {
		this.isConnected = false;
		this.mockDevice.stop();
		console.log('🎭 Emulated serial disconnected');

		if (this.disconnectCallback) {
			this.disconnectCallback();
		}
	}

	async write(data: string): Promise<void> {
		if (!this.isConnected) {
			throw new Error('Emulated port not open');
		}

		console.log(`📤 Sent to emulated device: ${data}`);

		// Parse and handle the command
		try {
			const command = JSON.parse(data) as MacroPadCommand;
			this.mockDevice.handleCommand(command);
		} catch (error) {
			// Not JSON, treat as plain text command
			this.mockDevice.handleTextCommand(data);
		}
	}

	async writeLine(line: string): Promise<void> {
		await this.write(line);
	}

	onData(callback: (data: string) => void): void {
		this.dataCallback = callback;
	}

	onError(callback: (error: Error) => void): void {
		this.errorCallback = callback;
	}

	onDisconnect(callback: () => void): void {
		this.disconnectCallback = callback;
	}

	isOpen(): boolean {
		return this.isConnected;
	}

	// Testing methods
	triggerError(message: string): void {
		if (this.errorCallback) {
			this.errorCallback(new Error(message));
		}
	}

	triggerDisconnect(): void {
		this.close();
	}

	simulateDataBurst(messages: string[]): void {
		messages.forEach((message, index) => {
			setTimeout(() => {
				if (this.dataCallback && this.isConnected) {
					this.dataCallback(message);
				}
			}, index * 100);
		});
	}
}

class MockMacroPadDevice {
	private responseCallback?: (data: string) => void;
	private heartbeatInterval?: NodeJS.Timeout;
	private macroConfig: any[] = [];
	private deviceType: 'stable' | 'unstable' | 'slow';

	constructor(deviceType: 'stable' | 'unstable' | 'slow' = 'stable') {
		this.deviceType = deviceType;
		this.initializeMacroConfig();
	}

	private initializeMacroConfig(): void {
		// Initialize with default 16-key configuration
		this.macroConfig = Array.from({ length: 16 }, (_, i) => ({
			key_code: 0,
			modifier: 0,
			consumer_code: 0,
			color: Math.floor(Math.random() * 0xffffff),
			description: `Key ${i}`
		}));
	}

	start(callback: (data: string) => void): void {
		this.responseCallback = callback;

		// Start periodic heartbeat (optional)
		if (this.deviceType === 'unstable') {
			this.heartbeatInterval = setInterval(() => {
				if (Math.random() < 0.1) {
					// 10% chance of random data
					this.sendResponse('STATUS: Random noise detected');
				}
			}, 5000);
		}
	}

	stop(): void {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = undefined;
		}
		this.responseCallback = undefined;
	}

	handleCommand(command: MacroPadCommand): void {
		const delay = this.getResponseDelay();

		setTimeout(() => {
			try {
				const response = this.processCommand(command);
				this.sendResponse(JSON.stringify(response));
			} catch (error) {
				this.sendErrorResponse(command.cmd, 'invalid_command');
			}
		}, delay);
	}

	handleTextCommand(command: string): void {
		const delay = this.getResponseDelay();

		setTimeout(() => {
			if (command.trim().toLowerCase() === 'help') {
				this.sendResponse('Available commands: get_config, set_config, test_macro');
			} else {
				this.sendResponse('OK');
			}
		}, delay);
	}

	private processCommand(command: MacroPadCommand): MacroPadResponse {
		switch (command.cmd) {
			case 'get_config':
				return {
					cmd: 'config',
					macros: this.macroConfig
				};

			case 'set_config':
				if (command.macros && Array.isArray(command.macros) && command.macros.length === 16) {
					this.macroConfig = command.macros;
					return { status: 'ok', cmd: 'set_config' };
				} else {
					return { status: 'error', reason: 'missing macros' };
				}

			case 'test_macro':
				if (typeof command.index === 'number' && command.index >= 0 && command.index < 16) {
					// Simulate macro execution
					setTimeout(() => {
						this.sendResponse(
							`Macro ${command.index} executed: ${this.macroConfig[command.index].description}`
						);
					}, 100);
					return { status: 'ok', cmd: 'test_macro' };
				} else {
					return { status: 'error', reason: 'bad index' };
				}

			default:
				return { status: 'error', reason: 'unknown_cmd' };
		}
	}

	private sendResponse(data: string): void {
		if (this.responseCallback) {
			console.log(`📥 Emulated device response: ${data}`);
			this.responseCallback(data);
		}
	}

	private sendErrorResponse(cmd: string, reason: string): void {
		const errorResponse = { status: 'error', cmd, reason };
		this.sendResponse(JSON.stringify(errorResponse));
	}

	private getResponseDelay(): number {
		switch (this.deviceType) {
			case 'slow':
				return 200 + Math.random() * 300; // 200-500ms
			case 'unstable':
				return Math.random() < 0.1 ? 1000 : 50; // Usually fast, sometimes very slow
			case 'stable':
			default:
				return 10 + Math.random() * 40; // 10-50ms
		}
	}

	// Testing methods
	updateMacroConfig(index: number, config: any): void {
		if (index >= 0 && index < 16) {
			this.macroConfig[index] = { ...this.macroConfig[index], ...config };
		}
	}

	getMacroConfig(): any[] {
		return [...this.macroConfig];
	}
}
