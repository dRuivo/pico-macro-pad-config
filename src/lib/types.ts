export type Key = {
	id: number;
	label: string;
	color: string;
};
export type Connection = {
	port: SerialPort | null;
	reader: ReadableStreamDefaultReader<Uint8Array> | null;
	writer: WritableStreamDefaultWriter<Uint8Array> | null;
};
export type LogLine = {
	timestamp: Date;
	message: string;
};

// Add Web Serial API types if not available
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

interface Serial {
	requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
	getPorts(): Promise<SerialPort[]>;
}

interface Navigator {
	serial: Serial;
}

interface SerialPortRequestOptions {
	filters?: SerialPortFilter[];
}

interface SerialPortFilter {
	usbVendorId?: number;
	usbProductId?: number;
}
