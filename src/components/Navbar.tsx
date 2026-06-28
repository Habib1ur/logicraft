import { Download, FileJson, RotateCcw, Save, Upload } from 'lucide-react';
import { useRef } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '../store/useAppStore';
import { downloadTextFile } from '../utils/storage';

type Props = {
  projectJson: string;
};

export function Navbar({ projectJson }: Props) {
  const saveExpression = useAppStore((state) => state.saveExpression);
  const importProject = useAppStore((state) => state.importProject);
  const resetApp = useAppStore((state) => state.resetApp);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    try {
      importProject(JSON.parse(text));
    } catch {
      alert('Invalid project JSON. Please import a valid TruthCraft project file.');
    }
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-lg font-black text-white shadow-lg shadow-indigo-500/25">
            TC
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-950 dark:text-white sm:text-xl">TruthCraft</h1>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">Truth tables, Boolean simplification, and digital logic learning.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <button className="nav-btn" type="button" onClick={() => saveExpression()} aria-label="Save current expression">
            <Save size={16} /> <span>Save</span>
          </button>
          <button className="nav-btn" type="button" onClick={() => downloadTextFile('truthcraft-project.json', projectJson, 'application/json')} aria-label="Export project JSON">
            <FileJson size={16} /> <span>Export</span>
          </button>
          <button className="nav-btn" type="button" onClick={() => fileInputRef.current?.click()} aria-label="Import project JSON">
            <Upload size={16} /> <span>Import</span>
          </button>
          <button className="nav-btn" type="button" onClick={() => downloadTextFile('truthcraft-full-solution.txt', projectJson)} aria-label="Download project data as text">
            <Download size={16} /> <span className="hidden sm:inline">Text</span>
          </button>
          <button className="nav-btn-danger" type="button" onClick={resetApp} aria-label="Reset app">
            <RotateCcw size={16} /> <span>Reset</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => handleImport(event.target.files?.[0])}
            aria-label="Import TruthCraft JSON file"
          />
        </div>
      </div>
    </nav>
  );
}
