# Component Documentation

This document provides detailed documentation for all UI components in the Pico MacroPad Configurator.

## Core Components

### KeyGrid Component

**File:** `src/lib/KeyGrid.svelte`

A traditional 4×4 grid layout component for displaying and interacting with macro keys.

#### **Props Interface**

```typescript
interface Props {
	keys: Key[]; // Array of 16 macro definitions
	activeIndex?: number | null; // Currently selected key index (0-15)
	onkeyclick?: (index: number) => void; // Click event handler
}
```

#### **Usage Example**

```svelte
<script lang="ts">
	import KeyGrid from '$lib/KeyGrid.svelte';
	import { macropadState, macropadActions } from '$lib/store';

	$: ({ keys, activeKeyIndex } = $macropadState);

	function handleKeyClick(index: number) {
		macropadActions.setActiveKey(index);
	}
</script>

<KeyGrid {keys} activeIndex={activeKeyIndex} onkeyclick={handleKeyClick} />
```

#### **Features**

- **4×4 Grid Layout**: CSS Grid-based responsive layout
- **Visual Feedback**: Hover states, active selection highlighting
- **Accessibility**: ARIA labels, keyboard navigation support
- **Color Coding**: Keys display their configured RGB colors
- **Interactive**: Click handling with proper event delegation

#### **Styling Classes**

- `.key-grid`: Main container with CSS Grid
- `.key-button`: Individual key button styling
- `.key-button.active`: Highlighted active key state
- `.key-button:hover`: Hover effect styling

#### **Responsive Behavior**

- Desktop: Fixed grid with hover effects
- Mobile: Touch-friendly button sizes, reduced gaps

---

### KeypadMockup Component

**File:** `src/lib/KeypadMockup.svelte`

SVG-based realistic representation of the physical macro pad device with wireframe styling.

#### **Props Interface**

```typescript
interface Props {
	keys: Key[]; // Array of 16 macro definitions
	activeIndex?: number | null; // Currently selected key index (0-15)
	onkeyclick?: (index: number) => void; // Click event handler
}
```

#### **Usage Example**

```svelte
<script lang="ts">
	import KeypadMockup from '$lib/KeypadMockup.svelte';

	let mockupView = true;
</script>

{#if mockupView}
	<KeypadMockup {keys} activeIndex={activeKeyIndex} onkeyclick={handleKeyClick} />
{/if}
```

#### **Visual Elements**

##### **Device Board**

- **PCB Outline**: Green circuit board representation
- **Mounting Holes**: Four corner mounting points
- **Connection Traces**: Dashed lines showing circuit connections
- **Grid Pattern**: Subtle dot pattern overlay

##### **Raspberry Pi Pico**

- **Realistic Positioning**: Mounted at top of device
- **USB Connector**: Visual representation of micro-USB port
- **Pin Headers**: Individual pins shown as small circles
- **Labeling**: "Raspberry Pi Pico" text

##### **Macro Keys**

- **Wireframe Style**: Dashed borders for inactive keys
- **Solid Selection**: Active keys get solid borders and light fill
- **Color Indicators**: Center dots showing RGB color assignment
- **Key Numbers**: Small index numbers (0-15) in corners
- **Labels**: Key function text at bottom

#### **Interaction Features**

- **Click Handling**: Same as KeyGrid, supports key selection
- **Keyboard Navigation**: Tab/Enter navigation support
- **Hover Effects**: Subtle opacity changes on hover
- **Focus States**: Proper outline for accessibility

#### **SVG Structure**

```xml
<svg viewBox="0 0 [width] [height]">
  <!-- Background and board -->
  <defs>...</defs>
  <rect class="pcb-board">...</rect>

  <!-- Raspberry Pi Pico -->
  <g class="pico-representation">...</g>

  <!-- Connection traces -->
  <g class="traces">...</g>

  <!-- Macro keys -->
  <g class="key-button" data-index="0">...</g>
  <!-- ... 15 more keys ... -->
</svg>
```

#### **Responsive Scaling**

- **Container Sizing**: Max-width with auto scaling
- **Mobile Optimization**: Touch-friendly target sizes
- **Aspect Ratio**: Maintains proper device proportions

---

### SerialLog Component

**File:** `src/lib/SerialLog.svelte`

Real-time serial communication monitor with command input capabilities.

#### **Props Interface**

```typescript
// No external props - uses internal store subscriptions
```

#### **Internal State**

```typescript
// Store subscriptions
$: ({ connected, connection } = $connectionState);
$: ({ log } = $monitorState);

// Local state
let inputValue = ''; // Command input buffer
```

#### **Usage Example**

```svelte
<script lang="ts">
	import SerialLog from '$lib/SerialLog.svelte';
</script>

<section class="serial-section">
	<h3>Serial Monitor</h3>
	<SerialLog />
</section>
```

#### **Features**

##### **Command Input**

- **Text Field**: Command entry with placeholder text
- **Enter Key Support**: Submit commands with Enter key
- **Send Button**: Alternative submission method
- **Connection-Aware**: Disabled when device not connected
- **Input Validation**: Prevents empty command submission

##### **Log Display**

- **Real-time Updates**: Automatic scroll to latest entries
- **Timestamps**: Formatted time for each log entry
- **TX/RX Indicators**: Clear direction markers for communication
- **Scrollable**: Fixed height with overflow scrolling
- **Monospace Font**: Better readability for JSON data

##### **Error Handling**

- **Connection Errors**: Graceful handling of disconnections
- **Send Failures**: Error messages logged to display
- **Input Sanitization**: Safe handling of user input

#### **Log Entry Format**

```
[HH:MM:SS] TX: {"cmd":"get_config"}
[HH:MM:SS] RX: {"cmd":"config","macros":[...]}
[HH:MM:SS] Error: Device disconnected
```

#### **Styling Structure**

```css
.section-content {
	/* Container layout */
}

.serial-input {
	/* Input row with flex layout */
}

.serial-input input {
	/* Text input styling */
}

.serial-log {
	/* Log display container */
	max-height: 400px;
	overflow-y: auto;
	font-family: var(--font-mono);
}

.serial-log pre {
	/* Log text formatting */
}
```

---

## Utility Components

### Button Component Pattern

Standard button implementation used throughout the application.

#### **CSS Classes**

```css
.btn {
	/* Base button styles */
	padding: var(--space-2) var(--space-4);
	border-radius: var(--radius-md);
	font-family: var(--font-body);
	cursor: pointer;
	transition: all 0.2s ease;
}

.btn-primary {
	background: var(--color-primary-500);
	color: var(--color-neutral-0);
}

.btn-secondary {
	background: var(--color-neutral-200);
	color: var(--color-neutral-900);
}

.btn-ghost {
	background: transparent;
	border: 1px solid var(--color-neutral-300);
}

.btn-sm {
	padding: var(--space-1) var(--space-3);
	font-size: var(--text-sm);
}

.btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
```

#### **Usage Patterns**

```svelte
<!-- Primary action -->
<button class="btn btn-primary" onclick={handleSubmit}> Submit </button>

<!-- Secondary action -->
<button class="btn btn-secondary" onclick={handleCancel}> Cancel </button>

<!-- Toggle button -->
<button class="btn btn-ghost btn-sm" class:active={isActive} onclick={handleToggle}>
	Toggle
</button>

<!-- Disabled state -->
<button class="btn btn-primary" onclick={handleAction} disabled={!isReady}>
	{#if loading}Loading...{:else}Action{/if}
</button>
```

## Component Communication Patterns

### Parent-Child Communication

#### **Props Down**

```svelte
<!-- Parent component -->
<script lang="ts">
  let selectedIndex = 0;
  let items = [...];
</script>

<ChildComponent {items} activeIndex={selectedIndex} onselect={handleSelect} />
```

#### **Events Up**

```svelte
<!-- Child component -->
<script lang="ts">
	interface Props {
		items: Item[];
		onselect?: (index: number) => void;
	}

	let { items, onselect }: Props = $props();

	function handleItemClick(index: number) {
		onselect?.(index);
	}
</script>
```

### Store-Based Communication

#### **Shared State**

```svelte
<!-- Component A -->
<script lang="ts">
	import { sharedState, sharedActions } from '$lib/store';

	$: ({ value } = $sharedState);

	function updateValue(newValue: string) {
		sharedActions.setValue(newValue);
	}
</script>
```

```svelte
<!-- Component B -->
<script lang="ts">
	import { sharedState } from '$lib/store';

	$: ({ value } = $sharedState);
	// Automatically reactive to changes from Component A
</script>
```

## Accessibility Guidelines

### Keyboard Navigation

```svelte
<script lang="ts">
	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Enter':
			case ' ':
				event.preventDefault();
				handleActivate();
				break;
			case 'Escape':
				handleCancel();
				break;
			case 'ArrowUp':
			case 'ArrowDown':
				handleNavigation(event.key);
				break;
		}
	}
</script>

<div role="button" tabindex="0" onkeydown={handleKeydown} aria-label="Macro key configuration">
	Content
</div>
```

### ARIA Attributes

```svelte
<!-- Descriptive labels -->
<button aria-label="Configure macro key {index}: {key.label}">
	{key.label}
</button>

<!-- State indicators -->
<div role="status" aria-live="polite" aria-label="Connection status">
	{connected ? 'Connected' : 'Disconnected'}
</div>

<!-- Form validation -->
<input type="text" aria-describedby="error-message" aria-invalid={hasError} />
{#if hasError}
	<div id="error-message" role="alert">Please enter a valid command</div>
{/if}
```

### Focus Management

```svelte
<script lang="ts">
	import { onMount, tick } from 'svelte';

	let dialogElement: HTMLElement;

	async function openDialog() {
		await tick();
		dialogElement.focus();
	}

	function trapFocus(event: KeyboardEvent) {
		if (event.key === 'Tab') {
			// Implement focus trapping logic
		}
	}
</script>

<div bind:this={dialogElement} tabindex="-1" onkeydown={trapFocus} class="dialog">
	Dialog content
</div>
```

## Performance Considerations

### Component Optimization

#### **Reactive Updates**

```svelte
<script lang="ts">
	// Expensive computation - use derived
	let computedValue = $derived.by(() => {
		return expensiveOperation(inputData);
	});

	// Selective reactivity
	$: if (criticalValue) {
		handleCriticalChange();
	}
</script>
```

#### **Event Delegation**

```svelte
<!-- Good: Single event handler -->
<div onclick={handleGridClick}>
	{#each items as item, index}
		<button data-index={index}>
			{item.label}
		</button>
	{/each}
</div>

<!-- Avoid: Multiple event handlers -->
{#each items as item, index}
	<button onclick={() => handleClick(index)}>
		{item.label}
	</button>
{/each}
```

#### **Conditional Rendering**

```svelte
<!-- Lazy component loading -->
{#if showExpensiveComponent}
	{#await import('./ExpensiveComponent.svelte') then Component}
		<svelte:component this={Component} />
	{/await}
{/if}

<!-- Conditional DOM creation -->
{#if isVisible}
	<ComplexComponent />
{/if}
```

## Testing Components

### Unit Testing Setup

```typescript
// KeyGrid.test.ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import KeyGrid from '../KeyGrid.svelte';

const mockKeys = Array.from({ length: 16 }, (_, i) => ({
	id: i,
	label: `Key ${i}`,
	color: '#FF0000'
}));

test('renders all keys', () => {
	render(KeyGrid, { keys: mockKeys });
	expect(screen.getAllByRole('button')).toHaveLength(16);
});

test('handles key selection', async () => {
	let selectedIndex: number | undefined;

	render(KeyGrid, {
		keys: mockKeys,
		onkeyclick: (index) => {
			selectedIndex = index;
		}
	});

	await fireEvent.click(screen.getByText('Key 5'));
	expect(selectedIndex).toBe(5);
});
```

### Integration Testing

```typescript
// Component with stores
test('updates on store changes', () => {
	const { component } = render(SerialLog);

	// Trigger store update
	monitorActions.addLog('Test message');

	expect(screen.getByText(/Test message/)).toBeInTheDocument();
});
```

## Common Patterns and Anti-Patterns

### ✅ Good Patterns

#### **Clear Props Interface**

```svelte
<script lang="ts">
	interface Props {
		// Required props
		title: string;
		items: Item[];

		// Optional props with defaults
		disabled?: boolean;
		maxItems?: number;

		// Event handlers
		onselect?: (item: Item) => void;
		onchange?: (value: string) => void;
	}

	let { title, items, disabled = false, maxItems = 10, onselect, onchange }: Props = $props();
</script>
```

#### **Consistent Naming**

```svelte
<!-- Event handlers -->
function handleSubmit() { }
function handleCancel() { }
function handleKeyPress() { }

<!-- Element references -->
let dialogElement: HTMLElement;
let inputElement: HTMLInputElement;

<!-- State variables -->
let isLoading = false;
let hasError = false;
let selectedIndex = null;
```

### ❌ Anti-Patterns to Avoid

#### **Avoid Deep Prop Drilling**

```svelte
<!-- Bad: Passing props through multiple levels -->
<Parent>
	<Child {deepProp}>
		<GrandChild {deepProp}>
			<GreatGrandChild {deepProp} />
		</GrandChild>
	</Child>
</Parent>

<!-- Good: Use stores for shared state -->
<Parent>
	<Child>
		<GrandChild>
			<GreatGrandChild />
			<!-- Accesses store directly -->
		</GrandChild>
	</Child>
</Parent>
```

#### **Avoid Excessive Reactivity**

```svelte
<!-- Bad: Reactive to every change -->
$: console.log('Every update:', someValue);
$: expensiveOperation(someValue);

<!-- Good: Conditional reactivity -->
$: if (someValue > threshold) {
  expensiveOperation(someValue);
}
```

#### **Avoid Inline Event Handlers**

```svelte
<!-- Bad: Creates new function on every render -->
<button onclick={() => handleClick(item.id)}>
	{item.label}
</button>

<!-- Good: Use event delegation or stable references -->
<button data-id={item.id} onclick={handleClick}>
	{item.label}
</button>
```
