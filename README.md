# Pico MacroPad Configurator

A modern web-based configuration tool for the Raspberry Pi Pico 4×4 RGB Macro Pad. Built with **SvelteKit 5**, **TypeScript**, and **TailwindCSS 4**, this application provides an intuitive interface for configuring macro keys, testing device functionality, and monitoring serial communication.

## 🚀 Features

- **Web Serial API Integration**: Direct browser-to-device communication
- **Serial Emulation**: Mock device for development and testing without hardware
- **Real-time Configuration**: Live macro testing and instant feedback
- **Dual View Modes**: Grid view and realistic device mockup
- **Modern UI/UX**: Clean wireframe-style design with accessibility features
- **Serial Monitor**: Built-in terminal for device communication and debugging
- **Development Tools**: Comprehensive testing page with multiple connection modes
- **Type-Safe**: Full TypeScript implementation with proper type definitions
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🛠️ Technology Stack

- **Framework**: SvelteKit 5 with modern reactivity
- **Styling**: TailwindCSS 4 with custom design system
- **Language**: TypeScript for type safety
- **Build Tool**: Vite for fast development
- **Deployment**: Vercel adapter for seamless hosting
- **Testing**: Vitest with Playwright browser testing

## 📋 Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm
- **Modern Browser** with Web Serial API support (Chrome 89+, Edge 89+)
- **USB Connection** to Raspberry Pi Pico device

## 🚦 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pico-macro-pad-config

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Development Commands

```bash
# Development server with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Run linter and formatter
pnpm lint
pnpm format

# Run tests
pnpm test

# Access development tools
# Visit http://localhost:5173/dev for serial emulation testing
```

### Development Workflow

#### **Serial Emulation for Development**

The application includes a comprehensive serial emulation layer that allows development and testing without physical hardware:

```typescript
import { createSerialConnection } from '$lib/serial.js';

// Emulated connection for development
const emulatedSerial = createSerialConnection('emulated', {
	emulatorOptions: {
		connectionDelay: 1000,
		deviceType: 'stable' // or 'unstable', 'slow'
	}
});

// Real hardware connection
const realSerial = createSerialConnection('real');

// Auto-detection (fallback to emulated if Web Serial unavailable)
const autoSerial = createSerialConnection('auto');
```

#### **Development Features**

- **Mock MacroPad Device**: Realistic command/response simulation
- **Multiple Device Types**: Stable, unstable, and slow response patterns
- **Protocol Testing**: Validate JSON command parsing and responses
- **Error Simulation**: Test error handling and edge cases
- **Development Page**: Visit `/dev` route for comprehensive testing interface

````

## 🏗️ Project Architecture

### Core Components

#### **Main Application** (`src/routes/+page.svelte`)

- Central layout and navigation
- Connection management UI
- View toggle between Grid and Device modes
- Integration of all sub-components

#### **KeyGrid** (`src/lib/KeyGrid.svelte`)

- Traditional 4×4 grid layout
- Interactive key buttons with hover states
- Color-coded visual feedback
- Click handling for key selection

#### **KeypadMockup** (`src/lib/KeypadMockup.svelte`)

- SVG-based realistic device representation
- Wireframe-style design matching the protocol documentation
- Raspberry Pi Pico visualization
- PCB traces and mounting holes
- Accessible with keyboard navigation

#### **SerialLog** (`src/lib/SerialLog.svelte`)

- Real-time serial communication monitor
- Command input with Enter key support
- Scrollable log with timestamps
- Error handling and status feedback

### State Management (`src/lib/store.ts`)

Centralized Svelte stores for application state:

#### **Connection State**

```typescript
connectionState: {
	connected: boolean; // Device connection status
	connection: Connection | null; // Active serial connection
	serialSupported: boolean; // Browser compatibility
}
````

#### **Macro Pad State**

```typescript
macropadState: {
  keys: Key[];                 // Array of 16 macro definitions
  activeKeyIndex: number | null; // Currently selected key
  layout: { rows: 4, cols: 4 }; // Device layout configuration
}
```

#### **Monitor State**

```typescript
monitorState: {
  log: LogLine[];             // Serial communication history
  txInput: string;            // Current input buffer
  maxLogLines: number;        // Log retention limit
}
```

### Serial Communication (`src/lib/serial.ts`)

Web Serial API wrapper providing:

- **`requestPort()`**: Browser device selection dialog
- **`openPort(port, baudRate)`**: Establish serial connection
- **`closePort(connection)`**: Clean disconnection
- **`writeLine(connection, data)`**: Send commands to device
- **`startReadLoop(connection, callback)`**: Continuous data reception

### Type Definitions (`src/lib/types.ts`)

Comprehensive TypeScript interfaces:

```typescript
type Key = {
	id: number; // Unique identifier (0-15)
	label: string; // Display name
	color: string; // Hex color code
};

type Connection = {
	port: SerialPort | null; // Serial port handle
	reader: ReadableStreamDefaultReader<Uint8Array> | null; // Data reader
	writer: WritableStreamDefaultWriter<Uint8Array> | null; // Data writer
};

type LogLine = {
	timestamp: Date; // When message was received/sent
	message: string; // Content of the communication
};
```

## 🎨 Design System

### CSS Custom Properties (`src/app.css`)

The application uses a comprehensive design system with CSS custom properties:

```css
:root {
	/* Spacing Scale */
	--space-1: 0.25rem; /* 4px */
	--space-2: 0.5rem; /* 8px */
	--space-3: 0.75rem; /* 12px */
	--space-4: 1rem; /* 16px */
	--space-6: 1.5rem; /* 24px */

	/* Typography */
	--font-body: 'Inter', system-ui, sans-serif;
	--font-mono: 'SF Mono', 'Monaco', 'Consolas', monospace;

	/* Colors */
	--color-primary-500: #3b82f6;
	--color-neutral-0: #ffffff;
	--color-neutral-50: #f9fafb;
	--color-neutral-900: #111827;

	/* Effects */
	--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
	--radius-sm: 0.125rem;
	--radius-lg: 0.5rem;
}
```

### Component Styling

- **Wireframe Aesthetic**: Clean lines, minimal colors, professional appearance
- **Accessibility First**: Proper focus states, ARIA labels, keyboard navigation
- **Responsive Design**: Mobile-first approach with breakpoint adjustments
- **Interactive Feedback**: Hover states, loading indicators, status colors

## 🔌 Device Integration

### Communication Protocol

The application implements the JSON-based protocol defined in `protocol.md`:

#### **Get Configuration**

```json
{ "cmd": "get_config" }
```

#### **Set Configuration**

```json
{
	"cmd": "set_config",
	"macros": [
		{
			"key_code": 67, // HID key code
			"modifier": 8, // Modifier bitmask
			"consumer_code": 0, // Media key usage
			"color": 65280, // RGB as integer
			"description": "Copy" // Human-readable label
		}
		// ... 16 total macros
	]
}
```

#### **Test Macro**

```json
{ "cmd": "test_macro", "index": 4 }
```

### Connection Workflow

1. **Browser Compatibility Check**: Verify Web Serial API support
2. **Device Selection**: User chooses device from browser dialog
3. **Connection Establishment**: Open serial port at 115200 baud
4. **Real-time Communication**: Bidirectional JSON message exchange
5. **Live Testing**: Immediate macro execution for configuration verification

## 🧪 Testing

The project includes comprehensive testing setup:

### Unit Testing

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch
```

### Browser Testing

```bash
# End-to-end tests with Playwright
pnpm test:browser
```

### Type Checking

```bash
# TypeScript compilation check
pnpm check

# Continuous type checking
pnpm check:watch
```

## 🚀 Deployment

### Production Build

```bash
pnpm build
```

### Vercel Deployment

The project is configured with Vercel adapter for seamless hosting:

1. Connect repository to Vercel
2. Automatic deployments on push to main branch
3. Preview deployments for pull requests

### Environment Configuration

No environment variables required for basic functionality. The application runs entirely in the browser using Web APIs.

## 🛠️ Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled with comprehensive type coverage
- **Prettier**: Automatic code formatting
- **ESLint**: Code quality and consistency enforcement
- **Svelte**: Modern Svelte 5 patterns with `$props()` and `$state()`

### Component Patterns

```typescript
// Modern Svelte 5 component structure
<script lang="ts">
  interface Props {
    title: string;
    items?: Item[];
  }

  let { title, items = [] }: Props = $props();

  function handleClick(item: Item) {
    // Event handling logic
  }
</script>
```

### State Management Best Practices

- Use stores for shared state across components
- Implement action functions for state mutations
- Maintain reactivity with `$:` statements
- Keep component state local when possible

## 🔧 Troubleshooting

### Common Issues

#### **Web Serial API Not Supported**

- **Solution**: Use Chrome 89+, Edge 89+, or other Chromium-based browsers
- **Firefox**: Not supported (Web Serial API not implemented)

#### **Device Not Detected**

- **Solution**: Ensure proper USB connection and driver installation
- **Check**: Device appears in system USB devices list

#### **Permission Denied**

- **Solution**: Re-trigger browser permission dialog
- **Linux**: May require udev rules for non-root access

#### **Connection Timeout**

- **Solution**: Verify baud rate (115200) and device firmware compatibility
- **Check**: Device responds to simple test commands

### Debug Mode

Enable verbose logging:

```javascript
// In browser console
localStorage.setItem('debug', 'true');
location.reload();
```

## 📚 Additional Resources

- [Web Serial API Documentation](https://web.dev/serial/)
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Device Protocol Specification](./docs/PROTOCOL.md)

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Implement** changes with tests
4. **Submit** pull request with description

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/new-functionality

# Make changes and test
pnpm test
pnpm check
pnpm lint

# Commit with conventional commits
git commit -m "feat: add new macro configuration feature"

# Push and create PR
git push origin feature/new-functionality
```

---

**Built with ❤️ for the maker community**

(Documentation written by Copilot)
