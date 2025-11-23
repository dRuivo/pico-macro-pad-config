# Development Guide

This guide covers development practices, patterns, and workflows for the Pico MacroPad Configurator project.

## Development Environment Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Recommended package manager
- **VS Code**: Recommended editor with extensions:
  - Svelte for VS Code
  - TypeScript and JavaScript
  - Prettier - Code formatter
  - ESLint
  - Tailwind CSS IntelliSense

### Initial Setup

```bash
# Clone and setup
git clone <repository-url>
cd pico-macro-pad-config
pnpm install

# Verify setup
pnpm check
pnpm lint
pnpm test

# Start development
pnpm dev
```

### IDE Configuration

**VS Code Settings (.vscode/settings.json):**

```json
{
	"editor.formatOnSave": true,
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	},
	"svelte.enable-ts-plugin": true,
	"typescript.preferences.includePackageJsonAutoImports": "on"
}
```

## Project Structure

```
src/
├── app.css                 # Global styles and design system
├── app.d.ts               # TypeScript ambient declarations
├── app.html               # HTML template
├── lib/                   # Reusable components and utilities
│   ├── components/        # UI components
│   │   ├── KeyGrid.svelte
│   │   ├── KeypadMockup.svelte
│   │   └── SerialLog.svelte
│   ├── types.ts          # TypeScript type definitions
│   ├── store.ts          # Svelte stores and state management
│   └── serial.ts         # Web Serial API wrapper
├── routes/               # SvelteKit routes
│   └── +page.svelte     # Main application page
└── static/              # Static assets
    └── robots.txt
```

## Development Patterns

### Svelte 5 Modern Patterns

#### Component Structure

```svelte
<script lang="ts">
	// 1. Imports
	import { onMount } from 'svelte';
	import type { ComponentType } from './types.js';

	// 2. Props interface
	interface Props {
		title: string;
		items?: Item[];
		disabled?: boolean;
	}

	// 3. Props destructuring (Svelte 5 pattern)
	let { title, items = [], disabled = false }: Props = $props();

	// 4. Local state
	let selectedIndex = $state<number | null>(null);

	// 5. Derived values
	let filteredItems = $derived(items.filter((item) => !item.hidden));

	// 6. Reactive statements
	$: console.log('Title changed:', title);

	// 7. Functions
	function handleClick(index: number) {
		selectedIndex = index;
	}

	// 8. Lifecycle
	onMount(() => {
		// Initialization logic
	});
</script>

<!-- 9. Markup -->
<div class="component">
	<h2>{title}</h2>
	{#each filteredItems as item, index (item.id)}
		<button onclick={() => handleClick(index)}>
			{item.label}
		</button>
	{/each}
</div>

<!-- 10. Styles -->
<style>
	.component {
		/* Component-specific styles */
	}
</style>
```

#### Store Usage Pattern

```svelte
<script lang="ts">
	import { connectionState, connectionActions } from '$lib/store';

	// Subscribe to store
	$: ({ connected, connection } = $connectionState);

	// Use store actions
	function handleConnect() {
		connectionActions.setConnection(newConnection, true);
	}
</script>
```

### TypeScript Best Practices

#### Strict Type Definitions

```typescript
// Define precise interfaces
interface MacroKey {
	readonly id: number;
	label: string;
	color: string;
}

// Use union types for state
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Generic constraints
interface Store<T> {
	subscribe: (callback: (value: T) => void) => () => void;
	set: (value: T) => void;
	update: (fn: (value: T) => T) => void;
}
```

#### Type Guards

```typescript
function isValidKey(obj: unknown): obj is MacroKey {
	return typeof obj === 'object' && obj !== null && 'id' in obj && 'label' in obj && 'color' in obj;
}

function assertConnection(conn: unknown): asserts conn is Connection {
	if (!conn || typeof conn !== 'object') {
		throw new Error('Invalid connection object');
	}
}
```

### State Management Patterns

#### Store Architecture

```typescript
// 1. Define state shape
interface AppState {
	user: User | null;
	preferences: UserPreferences;
	cache: Map<string, unknown>;
}

// 2. Create store
export const appState = writable<AppState>(initialState);

// 3. Define actions
export const appActions = {
	setUser: (user: User) => {
		appState.update((state) => ({ ...state, user }));
	},

	updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
		appState.update((state) => ({
			...state,
			preferences: { ...state.preferences, [key]: value }
		}));
	}
};

// 4. Derived stores
export const isLoggedIn = derived(appState, ($state) => $state.user !== null);
```

#### Local Component State

```svelte
<script lang="ts">
	// Prefer local state for component-specific data
	let inputValue = $state('');
	let isLoading = $state(false);

	// Use stores for shared state
	$: ({ connected } = $connectionState);
</script>
```

### Error Handling Patterns

#### Async Function Error Handling

```typescript
async function handleSerialCommand(command: string) {
	try {
		setLoading(true);
		const result = await sendCommand(command);
		handleSuccess(result);
	} catch (error) {
		if (error instanceof SerialError) {
			handleSerialError(error);
		} else if (error instanceof ValidationError) {
			handleValidationError(error);
		} else {
			handleUnknownError(error);
		}
	} finally {
		setLoading(false);
	}
}
```

#### Error Boundaries

```svelte
<!-- Component-level error handling -->
<script lang="ts">
	let errorState = $state<string | null>(null);

	async function safeOperation() {
		try {
			errorState = null;
			await riskyOperation();
		} catch (error) {
			errorState = error instanceof Error ? error.message : 'Unknown error';
		}
	}
</script>

{#if errorState}
	<div class="error-message">
		Error: {errorState}
		<button onclick={() => (errorState = null)}>Dismiss</button>
	</div>
{/if}
```

### CSS Architecture

#### Design System Usage

```css
/* Use CSS custom properties */
.button {
	padding: var(--space-3) var(--space-4);
	background: var(--color-primary-500);
	border-radius: var(--radius-md);
	font-family: var(--font-body);
}

/* Responsive patterns */
.grid {
	display: grid;
	gap: var(--space-4);
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

@media (max-width: 768px) {
	.grid {
		grid-template-columns: 1fr;
		gap: var(--space-2);
	}
}
```

#### Component Styling

```svelte
<style>
	/* Component-scoped styles */
	.component {
		/* Use design system tokens */
		background: var(--app-panel-bg);
		border: 1px solid var(--app-border);

		/* Logical properties for internationalization */
		padding-inline: var(--space-4);
		margin-block: var(--space-2);

		/* Modern CSS features */
		container-type: inline-size;
	}

	/* Container queries for responsive components */
	@container (max-width: 300px) {
		.component {
			padding-inline: var(--space-2);
		}
	}
</style>
```

## Testing Strategies

### Unit Testing

```typescript
// Component testing with Vitest
import { render, screen, fireEvent } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import KeyGrid from '../KeyGrid.svelte';

test('KeyGrid renders all keys', () => {
	const keys = Array.from({ length: 16 }, (_, i) => ({
		id: i,
		label: `Key ${i}`,
		color: '#FF0000'
	}));

	render(KeyGrid, { keys });

	expect(screen.getAllByRole('button')).toHaveLength(16);
});

test('KeyGrid handles key clicks', async () => {
	let clickedIndex: number | undefined;
	const handleClick = (index: number) => {
		clickedIndex = index;
	};

	const keys = [{ id: 0, label: 'Test', color: '#FF0000' }];
	render(KeyGrid, { keys, onkeyclick: handleClick });

	await fireEvent.click(screen.getByText('Test'));
	expect(clickedIndex).toBe(0);
});
```

### Integration Testing

```typescript
// Store testing
import { get } from 'svelte/store';
import { connectionState, connectionActions } from '../store';

test('connection state management', () => {
	// Initial state
	expect(get(connectionState).connected).toBe(false);

	// Update state
	const mockConnection = { port: null, reader: null, writer: null };
	connectionActions.setConnection(mockConnection, true);

	// Verify update
	const state = get(connectionState);
	expect(state.connected).toBe(true);
	expect(state.connection).toBe(mockConnection);
});
```

### E2E Testing

```typescript
// Playwright tests
import { test, expect } from '@playwright/test';

test('device connection workflow', async ({ page }) => {
	await page.goto('/');

	// Check initial state
	await expect(page.locator('button:has-text("Connect Device")')).toBeVisible();

	// Mock Web Serial API
	await page.addInitScript(() => {
		// Mock implementation
	});

	// Test connection flow
	await page.click('button:has-text("Connect Device")');
	await expect(page.locator('button:has-text("Disconnect")')).toBeVisible();
});
```

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
pnpm build
npx vite-bundle-analyzer dist
```

### Code Splitting

```typescript
// Dynamic imports for large features
const DevTools = lazy(() => import('./DevTools.svelte'));

// Conditional loading
{#if showDevTools}
  {#await DevTools then component}
    <svelte:component this={component} />
  {/await}
{/if}
```

### Store Optimization

```typescript
// Selective store subscriptions
$: ({ connected } = $connectionState); // Only subscribe to needed fields

// Derived stores for computed values
export const connectedDeviceCount = derived(connectionState, ($state) => $state.connections.length);
```

## Debugging Techniques

### Browser DevTools

```typescript
// Debug store state
import { connectionState } from '$lib/store';

// In browser console
connectionState.subscribe((state) => console.log('Connection state:', state));
```

### Svelte DevTools

- Install Svelte DevTools browser extension
- Inspect component tree and store state
- Profile component render performance

### Serial Communication Debugging

```typescript
// Enable verbose logging
const DEBUG_SERIAL = true;

function debugLog(direction: 'TX' | 'RX', data: string) {
	if (DEBUG_SERIAL) {
		console.log(`[${direction}] ${new Date().toISOString()} ${data}`);
	}
}
```

## Git Workflow

### Branch Strategy

```bash
# Feature development
git checkout -b feature/macro-editor
git commit -m "feat: add macro key editor component"
git push origin feature/macro-editor

# Bug fixes
git checkout -b fix/serial-connection-timeout
git commit -m "fix: handle serial connection timeouts gracefully"

# Releases
git checkout -b release/v1.1.0
git commit -m "chore: prepare v1.1.0 release"
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/updates
- `chore:` Maintenance tasks

### Code Review Checklist

#### Before Submitting PR

- [ ] All tests pass locally
- [ ] TypeScript compilation succeeds
- [ ] Linting passes without errors
- [ ] Manual testing completed
- [ ] Documentation updated if needed

#### Review Criteria

- [ ] Code follows established patterns
- [ ] TypeScript types are comprehensive
- [ ] Error handling is appropriate
- [ ] Performance impact is acceptable
- [ ] Accessibility requirements met

## Deployment

### Production Build

```bash
# Create optimized build
pnpm build

# Test production build locally
pnpm preview
```

### Environment Configuration

```typescript
// Environment-specific settings
export const config = {
	apiUrl: import.meta.env.PROD ? 'https://api.example.com' : 'http://localhost:3000',
	debugMode: import.meta.env.DEV,
	version: import.meta.env.VITE_VERSION || 'development'
};
```

### Vercel Deployment

```json
// vercel.json
{
	"framework": "svelte-kit",
	"buildCommand": "pnpm build",
	"outputDirectory": "dist",
	"devCommand": "pnpm dev",
	"installCommand": "pnpm install"
}
```

## Common Issues and Solutions

### Development Issues

#### Hot Module Replacement Not Working

```bash
# Clear Vite cache
rm -rf node_modules/.vite
pnpm dev
```

#### TypeScript Errors in VS Code

```bash
# Restart TypeScript server
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

# Check tsconfig.json validity
pnpm check
```

### Runtime Issues

#### Web Serial API Permissions

```typescript
// Handle permission states
async function checkPermissions() {
	const permission = await navigator.permissions.query({ name: 'serial' });
	return permission.state; // 'granted', 'denied', 'prompt'
}
```

#### Memory Leaks

```typescript
// Cleanup subscriptions
onMount(() => {
	const unsubscribe = store.subscribe(handler);

	return () => {
		unsubscribe();
	};
});
```

## Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Web Serial API Specification](https://web.dev/serial/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Testing](https://playwright.dev/)
