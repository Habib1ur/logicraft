import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, PanelState, SavedExpression } from '../types';

const defaultPanels = {
  expression: { collapsed: false, hidden: false, minimized: false },
  gates: { collapsed: false, hidden: false, minimized: false },
  table: { collapsed: false, hidden: false, minimized: false },
  simplification: { collapsed: false, hidden: false, minimized: false },
  explanation: { collapsed: true, hidden: false, minimized: false },
  settings: { collapsed: true, hidden: false, minimized: false },
  history: { collapsed: true, hidden: false, minimized: false }
} satisfies Record<string, PanelState>;

const defaultSettings: AppSettings = {
  variableOrder: ['A', 'B', 'C', 'D', 'E', 'F'],
  outputFormat: 'binary',
  showIntermediate: true,
  autoGenerate: true,
  showSopPos: true,
  learningMode: false,
  theme: 'system',
  maxRowsPerPage: 32
};

type AppState = {
  expression: string;
  cursorPosition: number;
  settings: AppSettings;
  history: SavedExpression[];
  panelStates: Record<string, PanelState>;
  setExpression: (expression: string) => void;
  setCursorPosition: (position: number) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setVariableOrderFromText: (text: string) => void;
  insertAtCursor: (text: string) => void;
  backspaceAtCursor: () => void;
  clearExpression: () => void;
  saveExpression: (expression?: string) => void;
  loadExpression: (expression: string) => void;
  deleteHistoryItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  togglePanel: (panelId: string, key: keyof PanelState) => void;
  showPanel: (panelId: string) => void;
  resetApp: () => void;
  importProject: (data: Partial<Pick<AppState, 'expression' | 'settings' | 'history' | 'panelStates'>>) => void;
};

const makeSavedExpression = (expression: string): SavedExpression => ({
  id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
  expression,
  createdAt: new Date().toISOString(),
  favorite: false
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      expression: 'A.B + C\'',
      cursorPosition: 0,
      settings: defaultSettings,
      history: [],
      panelStates: defaultPanels,

      setExpression: (expression) => set({ expression }),
      setCursorPosition: (cursorPosition) => set({ cursorPosition }),
      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
      setVariableOrderFromText: (text) => {
        const variableOrder = text
          .toUpperCase()
          .replace(/[^A-Z]/g, '')
          .split('')
          .filter((value, index, array) => array.indexOf(value) === index)
          .slice(0, 10);
        set((state) => ({ settings: { ...state.settings, variableOrder } }));
      },
      insertAtCursor: (text) => {
        const { expression, cursorPosition } = get();
        const before = expression.slice(0, cursorPosition);
        const after = expression.slice(cursorPosition);
        set({ expression: `${before}${text}${after}`, cursorPosition: cursorPosition + text.length });
      },
      backspaceAtCursor: () => {
        const { expression, cursorPosition } = get();
        if (cursorPosition <= 0) return;
        set({
          expression: expression.slice(0, cursorPosition - 1) + expression.slice(cursorPosition),
          cursorPosition: cursorPosition - 1
        });
      },
      clearExpression: () => set({ expression: '', cursorPosition: 0 }),
      saveExpression: (expression = get().expression) => {
        const clean = expression.trim();
        if (!clean) return;
        set((state) => {
          const existing = state.history.find((item) => item.expression === clean);
          if (existing) {
            return {
              history: [existing, ...state.history.filter((item) => item.id !== existing.id)].slice(0, 40)
            };
          }
          return { history: [makeSavedExpression(clean), ...state.history].slice(0, 40) };
        });
      },
      loadExpression: (expression) => set({ expression, cursorPosition: expression.length }),
      deleteHistoryItem: (id) => set((state) => ({ history: state.history.filter((item) => item.id !== id) })),
      toggleFavorite: (id) =>
        set((state) => ({
          history: state.history.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item))
        })),
      togglePanel: (panelId, key) =>
        set((state) => ({
          panelStates: {
            ...state.panelStates,
            [panelId]: {
              ...(state.panelStates[panelId] ?? { collapsed: false, hidden: false, minimized: false }),
              [key]: !state.panelStates[panelId]?.[key]
            }
          }
        })),
      showPanel: (panelId) =>
        set((state) => ({
          panelStates: {
            ...state.panelStates,
            [panelId]: { ...(state.panelStates[panelId] ?? defaultPanels.expression), hidden: false, minimized: false }
          }
        })),
      resetApp: () => set({ expression: 'A.B + C\'', cursorPosition: 0, settings: defaultSettings, panelStates: defaultPanels }),
      importProject: (data) =>
        set((state) => ({
          expression: data.expression ?? state.expression,
          settings: data.settings ? { ...state.settings, ...data.settings } : state.settings,
          history: data.history ?? state.history,
          panelStates: data.panelStates ? { ...state.panelStates, ...data.panelStates } : state.panelStates
        }))
    }),
    {
      name: 'truthcraft-app-state',
      partialize: (state) => ({
        expression: state.expression,
        settings: state.settings,
        history: state.history,
        panelStates: state.panelStates
      })
    }
  )
);
