import type { SerialConnection, SerialMode } from './types.js';
import { RealSerialConnection } from './realSerial.js';
import { EmulatedSerialConnection } from './emulatedSerial.js';

export class SerialFactory {
	private static mode: SerialMode = import.meta.env.DEV ? 'emulated' : 'real';
	private static forcedMode: SerialMode | null = null;

	/**
	 * Create a serial connection based on environment and configuration
	 */
	static create(
		options: {
			mode?: SerialMode;
			emulatorOptions?: {
				connectionDelay?: number;
				deviceType?: 'stable' | 'unstable' | 'slow';
			};
		} = {}
	): SerialConnection {
		let actualMode = options.mode || this.forcedMode || this.mode;

		// Handle 'auto' mode - fallback to emulated if Web Serial not available
		if (actualMode === 'auto') {
			actualMode = this.isRealSerialSupported() ? 'real' : 'emulated';
		}

		if (actualMode === 'emulated') {
			console.log('🎭 Creating emulated serial connection');
			return new EmulatedSerialConnection(options.emulatorOptions);
		} else {
			console.log('🔌 Creating real serial connection');
			return new RealSerialConnection();
		}
	}

	/**
	 * Get current serial mode
	 */
	static getMode(): SerialMode {
		return this.forcedMode || this.mode;
	}

	/**
	 * Set default mode for all future connections
	 */
	static setMode(mode: SerialMode): void {
		this.mode = mode;
		console.log(`Serial mode set to: ${mode}`);
	}

	/**
	 * Force a specific mode (overrides environment detection)
	 */
	static setForceMode(mode: SerialMode | null): void {
		this.forcedMode = mode;
		console.log(`Serial mode forced to: ${mode || 'auto'}`);
	}

	/**
	 * Check if real serial is supported in current environment
	 */
	static isRealSerialSupported(): boolean {
		return typeof navigator !== 'undefined' && 'serial' in navigator;
	}

	/**
	 * Create connection with automatic fallback
	 * Tries real serial first, falls back to emulated if not supported
	 */
	static createWithFallback(
		options: {
			preferEmulated?: boolean;
			emulatorOptions?: {
				connectionDelay?: number;
				deviceType?: 'stable' | 'unstable' | 'slow';
			};
		} = {}
	): SerialConnection {
		if (options.preferEmulated || !this.isRealSerialSupported()) {
			console.log('🎭 Using emulated serial (fallback or preference)');
			return new EmulatedSerialConnection(options.emulatorOptions);
		}

		console.log('🔌 Using real serial connection');
		return new RealSerialConnection();
	}
}
