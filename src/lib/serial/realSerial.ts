import type { SerialConnection, SerialOptions } from './types.js';

export class RealSerialConnection implements SerialConnection {
	private port: any = null;
	private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
	private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
	private dataCallback?: (data: string) => void;
	private errorCallback?: (error: Error) => void;
	private disconnectCallback?: () => void;
	private readLoopActive = false;

	async open(options: SerialOptions = { baudRate: 115200 }): Promise<void> {
		if (!('serial' in navigator)) {
			throw new Error('Web Serial API not supported in this browser.');
		}

		try {
			// Request port if not already selected
			if (!this.port) {
				this.port = await (navigator as any).serial.requestPort();
			}

			await this.port.open(options);

			this.reader = this.port.readable ? this.port.readable.getReader() : null;
			this.writer = this.port.writable ? this.port.writable.getWriter() : null;

			this.startReadLoop();

			console.log(`🔌 Real serial connected at ${options.baudRate} baud`);
		} catch (error) {
			throw new Error(`Failed to open serial port: ${error}`);
		}
	}

	async close(): Promise<void> {
		this.readLoopActive = false;

		try {
			if (this.reader) {
				await this.reader.cancel();
				this.reader.releaseLock();
				this.reader = null;
			}
			if (this.writer) {
				await this.writer.close();
				this.writer.releaseLock();
				this.writer = null;
			}
			if (this.port) {
				await this.port.close();
				this.port = null;
			}
			console.log('🔌 Real serial disconnected');
		} catch (error) {
			console.error('Error closing serial port:', error);
		}
	}

	async write(data: string): Promise<void> {
		if (!this.writer) {
			throw new Error('Serial port not open');
		}

		const encoder = new TextEncoder();
		const encoded = encoder.encode(data);
		await this.writer.write(encoded);
	}

	async writeLine(line: string): Promise<void> {
		await this.write(line + '\n');
	}

	private async startReadLoop(): Promise<void> {
		if (!this.reader || this.readLoopActive) return;

		this.readLoopActive = true;
		const decoder = new TextDecoder();
		let buffer = '';

		try {
			while (this.readLoopActive && this.reader) {
				const { value, done } = await this.reader.read();
				if (done) break;
				if (!value) continue;

				buffer += decoder.decode(value, { stream: true });

				let idx;
				while ((idx = buffer.indexOf('\n')) !== -1) {
					const line = buffer.slice(0, idx).trim();
					buffer = buffer.slice(idx + 1);
					if (line.length > 0 && this.dataCallback) {
						this.dataCallback(line);
					}
				}
			}
		} catch (error) {
			console.warn('Serial read loop ended:', error);
			if (this.errorCallback) {
				this.errorCallback(error as Error);
			}
		} finally {
			this.readLoopActive = false;
			if (this.disconnectCallback) {
				this.disconnectCallback();
			}
		}
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
		return this.port !== null && this.readLoopActive;
	}

	// Legacy compatibility - returns old-style connection object
	getLegacyConnection(): any {
		return {
			port: this.port,
			reader: this.reader,
			writer: this.writer
		};
	}
}
