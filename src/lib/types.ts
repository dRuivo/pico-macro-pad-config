export type Key = {
	id: number;
	label: string;
	color: string;
};

export type LogLine = {
	timestamp: Date;
	message: string;
};

// Web Serial API types (if not available in environment)
declare global {
	interface Navigator {
		serial?: Serial;
	}
}

interface Serial {
	requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
	getPorts(): Promise<SerialPort[]>;
}

interface SerialPort {
	open(options: { baudRate: number }): Promise<void>;
	close(): Promise<void>;
	readable: ReadableStream<Uint8Array> | null;
	writable: WritableStream<Uint8Array> | null;
	getInfo(): SerialPortInfo;
}

interface SerialPortInfo {
	usbVendorId?: number;
	usbProductId?: number;
}

interface SerialPortRequestOptions {
	filters?: SerialPortFilter[];
}

interface SerialPortFilter {
	usbVendorId?: number;
	usbProductId?: number;
}
