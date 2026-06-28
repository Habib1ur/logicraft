import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, HistoryItem, PanelState, SavedProject, ThemeMode } from '../types';

interface AppStore {
  expression: string;
  theme: ThemeMode;
  settings: AppSettings;
  history: HistoryItem[];
  panelStates: Record<string, PanelState>;
  setExpression: (expression: string) => void;
  setTheme: (theme: ThemeMode) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addToHistory: (expression: string) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  toggleFavorite: (id: string) => void;
  setPanelState: (panelId: string, state: Partial<PanelState>) => void;
  resetApp: () => void;
  importProject: (project: SavedProject) => void;
}

export const DEFAULT_SETTINGS: AppSettings = {
  variableOrder: ['A', 'B', 'C', 'D', 'E', 'F'],
  outputFormat: 'binary',
  showIntermediateColumns: true,
  generateMode: 'auto',
  showSopPos: true,
  learningMode: true,
  maxVariables: 6,
  rowsPerPage: 32,
};

const DEFAULT_PANEL_STATE: PanelState = {
  collapsed: false,
  hidden: false,
  minimized: false,
};

const initialPanels: Record<string, PanelState> = {
  expression: { ...DEFAULT_PANEL_STATE },
  gates: { ...DEFAULT_PANEL_STATE },
  table: { ...DEFAULT_PANEL_STATE },
  simplification: { ...DEFAULT_PANEL_STATE },
  explanation: { ...DEFAULT_PANEL_STATE, collapsed: true },
  settings: { ...DEFAULT_PANEL_STATE, collapsed: true },
  history: { ...DEFAULT_PANEL_STATE, collapsed: true },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      expression: 'A.B + C\'',
      theme: 'system',
      settings: DEFAULT_SETTINGS,
      history: [],
      panelStates: initialPanels,
      setExpression: (expression) => set({ expression }),
      setTheme: (theme) => set({ theme }),
      updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
      addToHistory: (expression) => {
        const clean = expression.trim();
        if (!clean) return;
        const existing = get().history.find((item) => item.expression === clean);
        if (existing) {
          set((state) => ({
            history: [
              { ...existing, createdAt: new Date().toISOString() },
              ...state.history.filter((item) => item.id !== existing.id),
            ].slice(0, 30),
          }));
          return;
        }
        const item: HistoryItem = {
          id: crypto.randomUUID(),
          expression: clean,
          createdAt: new Date().toISOString(),
          favorite: false,
        };
        set((state) => ({ history: [item, ...state.history].slice(0, 30) }));
      },
      deleteHistoryItem: (id) => set((state) => ({ history: state.history.filter((item) => item.id !== id) })),
      clearHistory: () => set({ history: [] }),
      toggleFavorite: (id) =>
        set((state) => ({
          history: state.history.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item)),
        })),
      setPanelState: (panelId, state) =>
        set((store) => ({
          panelStates: {
            ...store.panelStates,
            [panelId]: { ...(store.panelStates[panelId] ?? DEFAULT_PANEL_STATE), ...state },
          },
        })),
      resetApp: () =>
        set({
          expression: 'A.B + C\'',
          settings: DEFAULT_SETTINGS,
          panelStates: initialPanels,
        }),
      importProject: (project) =>
        set({
          expression: project.expression || '',
          settings: { ...DEFAULT_SETTINGS, ...project.settings },
          history: Array.isArray(project.history) ? project.history : get().history,
        }),
    }),
    {
      name: 'truthcraft-app-state',
      partialize: (state) => ({
        expression: state.expression,
        theme: state.theme,
        settings: state.settings,
        history: state.history,
        panelStates: state.panelStates,
      }),
    },
  ),
);
