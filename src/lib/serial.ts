import { SerialFactory } from './serial/factory.js';
import type {
	SerialConnection,
	SerialMode,
	SerialOptions,
	MacroPadCommand,
	MacroPadResponse
} from './serial/types.js';

// Re-export types and factory for new API
export {
	SerialFactory,
	type SerialConnection,
	type SerialMode,
	type SerialOptions,
	type MacroPadCommand,
	type MacroPadResponse
};

// Global serial connection instance
let globalConnection: SerialConnection | null = null;

/**
 * Create a new serial connection with the specified mode
 * @param mode - 'real' for hardware, 'emulated' for development, 'auto' for automatic detection
 * @param options - Additional configuration options
 */
export function createSerialConnection(
	mode?: SerialMode,
	options?: {
		emulatorOptions?: {
			connectionDelay?: number;
			deviceType?: 'stable' | 'unstable' | 'slow';
		};
	}
): SerialConnection {
	return SerialFactory.create({ mode, ...options });
}

/**
 * Get or create the global serial connection instance
 */
export function getSerialConnection(): SerialConnection {
	if (!globalConnection) {
		globalConnection = SerialFactory.createWithFallback();
	}
	return globalConnection;
}

/**
 * Set the global serial connection instance
 */
export function setSerialConnection(connection: SerialConnection): void {
	globalConnection = connection;
}
