// src/lib/types/protocol.ts

// One macro entry (matches firmware struct + JSON)
export interface MacroKey {
	key_code: number; // HID key code (0–255)
	modifier: number; // Modifier bitmask (0–255)
	consumer_code: number; // 16-bit consumer usage (0 = none)
	color: number; // RGB as 0xRRGGBB (stored as decimal)
	description?: string; // Optional in commands, present in responses
}

// --- Commands (host → device) ---

export interface GetConfigCommand {
	cmd: 'get_config';
}

export interface SetConfigCommand {
	cmd: 'set_config';
	macros: MacroKey[]; // expected length: 16
}

export interface TestMacroCommand {
	cmd: 'test_macro';
	index: number; // 0–15
}

// Union of all commands we can send
export type HostCommand = GetConfigCommand | SetConfigCommand | TestMacroCommand;

// --- Messages (device → host) ---

// Full config response
export interface ConfigMessage {
	cmd: 'config';
	macros: MacroKey[]; // always 16
}

// Generic status / error response
export interface StatusMessage {
	status: 'ok' | 'error';
	cmd?: string; // echoed command name, e.g. "set_config"
	reason?: string; // error reason when status === "error"
}

// Union of all messages we might receive from the device
export type DeviceMessage = ConfigMessage | StatusMessage;

// --- Utility helpers ---

export function isConfigMessage(msg: any): msg is ConfigMessage {
	return msg && msg.cmd === 'config' && Array.isArray(msg.macros);
}

export function isStatusMessage(msg: any): msg is StatusMessage {
	return msg && typeof msg.status === 'string';
}
