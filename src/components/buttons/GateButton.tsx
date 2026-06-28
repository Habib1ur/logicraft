type Props = {
  label: string;
  insert?: string;
  hint?: string;
  onClick: (value?: string) => void;
  variant?: 'primary' | 'soft' | 'danger';
};

export function GateButton({ label, insert, hint, onClick, variant = 'soft' }: Props) {
  const classes = {
    primary: 'border-indigo-200 bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 dark:border-indigo-500',
    soft: 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 active:bg-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-indigo-600 dark:hover:bg-slate-800',
    danger: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900'
  }[variant];

  return (
    <button
      type="button"
      onClick={() => onClick(insert)}
      className={`min-h-11 rounded-2xl border px-3 py-2 text-sm font-bold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${classes}`}
      aria-label={hint ?? `Insert ${label}`}
      title={hint}
    >
      {label}
    </button>
  );
}
