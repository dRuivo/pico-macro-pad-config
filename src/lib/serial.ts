// Simple serial connection wrapper
export async function requestPort() {
	if (!('serial' in navigator)) {
		throw new Error('Web Serial API not supported in this browser.');
	}

	// Later you can filter by USB vendor/productId
	const port = await (navigator.serial as any).requestPort();
	return port;
}

export async function openPort(port: any, baudRate = 115200) {
	await port.open({ baudRate });

	const reader = port.readable ? port.readable.getReader() : null;
	const writer = port.writable ? port.writable.getWriter() : null;

	return { port, reader, writer };
}

export async function closePort(conn: any) {
	if (!conn) return;
	try {
		if (conn.reader) {
			await conn.reader.cancel();
			conn.reader.releaseLock();
		}
		if (conn.writer) {
			await conn.writer.close();
			conn.writer.releaseLock();
		}
		await conn.port.close();
	} catch (err) {
		console.error('Error closing port:', err);
	}
}

// Write a single line (appends '\n')
export async function writeLine(conn: any, line: string) {
	if (!conn || !conn.writer) return;
	const encoder = new TextEncoder();
	const data = encoder.encode(line + '\n');
	await conn.writer.write(data);
}

// Basic read loop, calls onLine for every complete line
export async function startReadLoop(conn: any, onLine: (line: string) => void) {
	if (!conn || !conn.reader) return;

	const decoder = new TextDecoder();
	let buffer = '';

	try {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const { value, done } = await conn.reader.read();
			if (done) break;
			if (!value) continue;

			buffer += decoder.decode(value, { stream: true });

			let idx;
			while ((idx = buffer.indexOf('\n')) !== -1) {
				const line = buffer.slice(0, idx).trim();
				buffer = buffer.slice(idx + 1);
				if (line.length > 0) {
					onLine(line);
				}
			}
		}
	} catch (err) {
		console.warn('Read loop ended:', err);
	}
}
