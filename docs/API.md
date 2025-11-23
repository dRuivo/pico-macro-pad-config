# API Documentation

This document describes the internal APIs and interfaces used in the Pico MacroPad Configurator web application.

## Store APIs

### Connection State Store

#### `connectionState`

Manages device connection status and Web Serial API integration.

**State Shape:**

```typescript
{
	connected: boolean; // Whether device is currently connected
	connection: Connection | null; // Active serial connection object
	serialSupported: boolean; // Browser Web Serial API support
}
```

**Actions:**

```typescript
connectionActions.setSerialSupported(supported: boolean)
connectionActions.setConnection(connection: Connection | null, connected: boolean)
```

**Usage Example:**

```typescript
import { connectionState, connectionActions } from '$lib/store';

// Subscribe to connection status
$: ({ connected, connection, serialSupported } = $connectionState);

// Check browser support
onMount(() => {
	connectionActions.setSerialSupported('serial' in navigator);
});

// Establish connection
const conn = await openPort(port, 115200);
connectionActions.setConnection(conn, true);
```

### Macro Pad State Store

#### `macropadState`

Manages the 4×4 macro key configuration and selection state.

**State Shape:**

```typescript
{
  keys: Key[];                 // Array of 16 macro definitions
  activeKeyIndex: number | null; // Currently selected key (0-15)
  layout: {
    rows: number;              // Grid rows (always 4)
    cols: number;              // Grid columns (always 4)
  };
}
```

**Key Object Structure:**

```typescript
type Key = {
	id: number; // Unique identifier (0-15)
	label: string; // Display name (e.g., "Copy", "Paste")
	color: string; // Hex color code (e.g., "#FF0000")
};
```

**Actions:**

```typescript
macropadActions.setActiveKey(index: number | null)
macropadActions.updateKey(index: number, updates: Partial<Key>)
macropadActions.resetKeys()
```

**Usage Example:**

```typescript
import { macropadState, macropadActions } from '$lib/store';

// Subscribe to key state
$: ({ keys, activeKeyIndex, layout } = $macropadState);

// Select a key
function handleKeyClick(index: number) {
	macropadActions.setActiveKey(index);
}

// Update key configuration
macropadActions.updateKey(0, {
	label: 'New Action',
	color: '#00FF00'
});
```

### Monitor State Store

#### `monitorState`

Manages serial communication logging and input state.

**State Shape:**

```typescript
{
  log: LogLine[];      // Serial communication history
  txInput: string;     // Current input buffer (deprecated in current UI)
  maxLogLines: number; // Maximum log entries to retain
}
```

**LogLine Structure:**

```typescript
type LogLine = {
	timestamp: Date; // When message was logged
	message: string; // Content (e.g., "TX: {...}", "RX: {...}")
};
```

**Actions:**

```typescript
monitorActions.addLog(message: string)
monitorActions.setTxInput(input: string)
monitorActions.clearLog()
monitorActions.setMaxLogLines(count: number)
```

**Usage Example:**

```typescript
import { monitorState, monitorActions } from '$lib/store';

// Subscribe to log
$: ({ log } = $monitorState);

// Add log entry
monitorActions.addLog('TX: {"cmd":"get_config"}');
monitorActions.addLog('RX: {"cmd":"config","macros":[...]}');

// Display log
{#each log as logLine}
  <div>[{logLine.timestamp.toLocaleTimeString()}] {logLine.message}</div>
{/each}
```

### UI State Store

#### `uiState`

Manages application-wide UI preferences and view state.

**State Shape:**

```typescript
{
	theme: 'light' | 'dark' | 'system'; // Color theme preference
	sidebarOpen: boolean; // Sidebar visibility
	currentView: 'overview' | 'keyconfig' | 'settings'; // Active view
}
```

**Actions:**

```typescript
uiActions.setTheme(theme: 'light' | 'dark' | 'system')
uiActions.toggleSidebar()
uiActions.setCurrentView(view: 'overview' | 'keyconfig' | 'settings')
```

## Serial Communication API

### Core Functions

#### `requestPort()`

Opens browser device selection dialog for Web Serial API.

```typescript
async function requestPort(): Promise<SerialPort>;
```

**Returns:** Selected serial port object
**Throws:** Error if Web Serial API not supported or user cancels

**Example:**

```typescript
try {
	const port = await requestPort();
	console.log('User selected port:', port);
} catch (error) {
	console.error('Port selection failed:', error);
}
```

#### `openPort(port, baudRate)`

Establishes serial connection with specified parameters.

```typescript
async function openPort(port: SerialPort, baudRate: number = 115200): Promise<Connection>;
```

**Parameters:**

- `port`: SerialPort object from `requestPort()`
- `baudRate`: Communication speed (default: 115200)

**Returns:** Connection object with reader/writer streams
**Throws:** Error if connection fails

**Example:**

```typescript
const connection = await openPort(port, 115200);
console.log('Connected with reader/writer streams');
```

#### `closePort(connection)`

Cleanly closes serial connection and releases resources.

```typescript
async function closePort(connection: Connection): Promise<void>;
```

**Parameters:**

- `connection`: Active connection from `openPort()`

**Example:**

```typescript
await closePort(connection);
console.log('Connection closed safely');
```

#### `writeLine(connection, data)`

Sends text data with newline terminator to device.

```typescript
async function writeLine(connection: Connection, line: string): Promise<void>;
```

**Parameters:**

- `connection`: Active connection
- `line`: Text to send (newline automatically appended)

**Example:**

```typescript
await writeLine(connection, '{"cmd":"get_config"}');
```

#### `startReadLoop(connection, callback)`

Begins continuous reading from device with line-by-line callbacks.

```typescript
async function startReadLoop(connection: Connection, onLine: (line: string) => void): Promise<void>;
```

**Parameters:**

- `connection`: Active connection
- `onLine`: Callback function for each received line

**Example:**

```typescript
startReadLoop(connection, (line) => {
	console.log('Received:', line);
	monitorActions.addLog('RX: ' + line);
});
```

## Component APIs

### KeyGrid Component

Interactive 4×4 grid layout for macro key configuration.

**Props:**

```typescript
interface Props {
	keys: Key[]; // Array of 16 macro definitions
	activeIndex?: number | null; // Currently selected key
	onkeyclick?: (index: number) => void; // Click handler
}
```

**Usage:**

```svelte
<KeyGrid {keys} activeIndex={activeKeyIndex} onkeyclick={handleKeyClick} />
```

**Features:**

- Responsive grid layout
- Visual feedback for active key
- Hover states and animations
- Accessibility support with keyboard navigation

### KeypadMockup Component

SVG-based realistic device representation with wireframe styling.

**Props:**

```typescript
interface Props {
	keys: Key[]; // Array of 16 macro definitions
	activeIndex?: number | null; // Currently selected key
	onkeyclick?: (index: number) => void; // Click handler
}
```

**Usage:**

```svelte
<KeypadMockup {keys} activeIndex={activeKeyIndex} onkeyclick={handleKeyClick} />
```

**Features:**

- Wireframe-style SVG design
- Raspberry Pi Pico representation
- PCB traces and mounting holes
- Interactive key buttons with proper scaling
- Color-coded visual feedback
- Responsive design for mobile devices

### SerialLog Component

Real-time serial communication monitor with input capabilities.

**Props:**
None (uses stores internally)

**Usage:**

```svelte
<SerialLog />
```

**Features:**

- Real-time log display with timestamps
- Command input with Enter key support
- Automatic scrolling to latest entries
- Error handling and status feedback
- Connection-aware input state

## Type Definitions

### Core Types

#### `Connection`

```typescript
type Connection = {
	port: SerialPort | null; // Serial port handle
	reader: ReadableStreamDefaultReader<Uint8Array> | null; // Data reader stream
	writer: WritableStreamDefaultWriter<Uint8Array> | null; // Data writer stream
};
```

#### `Key`

```typescript
type Key = {
	id: number; // Unique identifier (0-15)
	label: string; // Display name
	color: string; // Hex color code
};
```

#### `LogLine`

```typescript
type LogLine = {
	timestamp: Date; // When message was received/sent
	message: string; // Content of the communication
};
```

### Web Serial API Types

Extended type definitions for Web Serial API:

#### `SerialPort`

```typescript
interface SerialPort {
	open(options: { baudRate: number }): Promise<void>;
	close(): Promise<void>;
	readable: ReadableStream<Uint8Array> | null;
	writable: WritableStream<Uint8Array> | null;
	getInfo(): SerialPortInfo;
}
```

#### `SerialPortInfo`

```typescript
interface SerialPortInfo {
	usbVendorId?: number; // USB vendor identifier
	usbProductId?: number; // USB product identifier
}
```

#### `Serial`

```typescript
interface Serial extends EventTarget {
	requestPort(): Promise<SerialPort>;
	getPorts(): Promise<SerialPort[]>;
	addEventListener(type: 'connect' | 'disconnect', listener: EventListener): void;
}
```

## Error Handling

### Common Error Patterns

#### Web Serial API Errors

```typescript
try {
	const port = await requestPort();
} catch (error) {
	if (error.name === 'NotSupportedError') {
		// Web Serial API not available
	} else if (error.name === 'NotAllowedError') {
		// User denied permission
	}
}
```

#### Connection Errors

```typescript
try {
	await openPort(port, 115200);
} catch (error) {
	if (error.name === 'InvalidStateError') {
		// Port already open or unavailable
	} else if (error.name === 'NetworkError') {
		// Device disconnected during operation
	}
}
```

#### Communication Errors

```typescript
try {
	await writeLine(connection, command);
} catch (error) {
	// Handle write failures
	monitorActions.addLog('Error: ' + error.message);
}
```

## Browser Compatibility

### Supported Browsers

- **Chrome**: 89+ (Full support)
- **Edge**: 89+ (Full support)
- **Opera**: 76+ (Full support)
- **Firefox**: Not supported (Web Serial API not implemented)
- **Safari**: Not supported (Web Serial API not implemented)

### Feature Detection

```typescript
const isSerialSupported = 'serial' in navigator;
if (!isSerialSupported) {
	// Show browser compatibility message
	// Suggest Chrome or Edge
}
```

### Progressive Enhancement

The application gracefully degrades when Web Serial API is not available:

- Connection UI is disabled
- Informational messages guide users to compatible browsers
- Core UI remains functional for demonstration purposes
