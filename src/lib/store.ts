import { writable } from 'svelte/store';
import type { Key, Connection, LogLine } from './types.js';

// Serial connection state
export const connectionState = writable<{
	connected: boolean;
	connection: Connection | null;
	serialSupported: boolean;
}>({
	connected: false,
	connection: null,
	serialSupported: false
});

// Macro pad state
export const macropadState = writable<{
	keys: Key[];
	activeKeyIndex: number | null;
	layout: {
		rows: number;
		cols: number;
	};
}>({
	keys: [
		// Row 1
		{ id: 0, label: 'Copy', color: '#00FF00' },
		{ id: 1, label: 'Paste', color: '#0000FF' },
		{ id: 2, label: 'Undo', color: '#FF0000' },
		{ id: 3, label: 'Save', color: '#FFFF00' },
		// Row 2
		{ id: 4, label: 'Cmd+Tab', color: '#FF00FF' },
		{ id: 5, label: 'Lock', color: '#00FFFF' },
		{ id: 6, label: 'Redo', color: '#80FF00' },
		{ id: 7, label: 'Escape', color: '#FF8000' },
		// Row 3
		{ id: 8, label: 'Play/Pause', color: '#8000FF' },
		{ id: 9, label: 'Prev', color: '#0080FF' },
		{ id: 10, label: 'Next', color: '#FF0080' },
		{ id: 11, label: 'Delete', color: '#800000' },
		// Row 4
		{ id: 12, label: 'Enter', color: '#008000' },
		{ id: 13, label: 'Backspace', color: '#000080' },
		{ id: 14, label: 'Home', color: '#808000' },
		{ id: 15, label: 'End', color: '#800080' }
	],
	activeKeyIndex: null,
	layout: {
		rows: 4,
		cols: 4
	}
});

// Serial monitor state
export const monitorState = writable<{
	log: LogLine[];
	txInput: string;
	maxLogLines: number;
}>({
	log: [],
	txInput: '',
	maxLogLines: 200
});

// UI state
export const uiState = writable<{
	theme: 'light' | 'dark' | 'system';
	sidebarOpen: boolean;
	currentView: 'overview' | 'keyconfig' | 'settings';
}>({
	theme: 'system',
	sidebarOpen: true,
	currentView: 'overview'
});

// Actions for connection management
export const connectionActions = {
	setSerialSupported: (supported: boolean) => {
		connectionState.update((state) => ({
			...state,
			serialSupported: supported
		}));
	},

	setConnection: (connection: Connection | null, connected: boolean) => {
		connectionState.update((state) => ({
			...state,
			connection,
			connected
		}));
	}
};

// Actions for macropad management
export const macropadActions = {
	setActiveKey: (index: number | null) => {
		macropadState.update((state) => ({
			...state,
			activeKeyIndex: index
		}));
	},

	updateKey: (index: number, updates: Partial<Key>) => {
		macropadState.update((state) => ({
			...state,
			keys: state.keys.map((key, i) => (i === index ? { ...key, ...updates } : key))
		}));
	},

	resetKeys: () => {
		macropadState.update((state) => ({
			...state,
			keys: state.keys.map((key, index) => ({
				...key,
				id: index,
				label: `Key ${index}`,
				color: '#333333'
			}))
		}));
	}
};

// Actions for monitor management
export const monitorActions = {
	addLog: (message: string) => {
		monitorState.update((state) => {
			const newLog: LogLine = {
				timestamp: new Date(),
				message
			};

			let updatedLog = [...state.log, newLog];

			// Keep only the last maxLogLines entries
			if (updatedLog.length > state.maxLogLines) {
				updatedLog = updatedLog.slice(updatedLog.length - state.maxLogLines);
			}

			return {
				...state,
				log: updatedLog
			};
		});
	},

	setTxInput: (input: string) => {
		monitorState.update((state) => ({
			...state,
			txInput: input
		}));
	},

	clearLog: () => {
		monitorState.update((state) => ({
			...state,
			log: []
		}));
	}
};

// Actions for UI management
export const uiActions = {
	setTheme: (theme: 'light' | 'dark' | 'system') => {
		uiState.update((state) => ({
			...state,
			theme
		}));
	},

	toggleSidebar: () => {
		uiState.update((state) => ({
			...state,
			sidebarOpen: !state.sidebarOpen
		}));
	},

	setCurrentView: (view: 'overview' | 'keyconfig' | 'settings') => {
		uiState.update((state) => ({
			...state,
			currentView: view
		}));
	}
};
