export interface SerialOptions {
	baudRate: number;
	dataBits?: 7 | 8;
	stopBits?: 1 | 2;
	parity?: 'none' | 'even' | 'odd';
	flowControl?: 'none' | 'hardware';
}

export interface SerialConnection {
	open(options?: SerialOptions): Promise<void>;
	close(): Promise<void>;
	write(data: string): Promise<void>;
	writeLine(line: string): Promise<void>;
	onData(callback: (data: string) => void): void;
	onError(callback: (error: Error) => void): void;
	onDisconnect(callback: () => void): void;
	isOpen(): boolean;
}

export interface MacroPadCommand {
	cmd: string;
	[key: string]: any;
}

export interface MacroPadResponse {
	status?: 'ok' | 'error';
	cmd?: string;
	reason?: string;
	[key: string]: any;
}

export type SerialMode = 'real' | 'emulated' | 'auto';
