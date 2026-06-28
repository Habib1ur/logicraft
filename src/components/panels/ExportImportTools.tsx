import { ClipboardCopy, Download } from 'lucide-react';
import { CollapsiblePanel } from '../CollapsiblePanel';
import { copyToClipboard, downloadTextFile } from '../../utils/storage';
import { truthTableToCsv } from '../../lib/truthTable';
import type { SimplificationResult, TruthTableResult } from '../../types';

type Props = {
  table?: TruthTableResult;
  simplification?: SimplificationResult;
  outputFormat: 'binary' | 'boolean';
  showIntermediate: boolean;
  projectJson: string;
};

export function ExportImportTools({ table, simplification, outputFormat, showIntermediate, projectJson }: Props) {
  const format = (value: boolean) => (outputFormat === 'binary' ? (value ? '1' : '0') : value ? 'True' : 'False');
  const csv = table ? truthTableToCsv(table, showIntermediate, format) : '';
  const solutionText = simplification
    ? [
        `Original: ${simplification.original}`,
        `Simplified SOP: ${simplification.simplifiedSOP}`,
        `Simplified POS: ${simplification.simplifiedPOS}`,
        `Minterms: ${simplification.mintermNotation}`,
        `Maxterms: ${simplification.maxtermNotation}`,
        '',
        'Canonical SOP:',
        simplification.canonicalSOP,
        '',
        'Canonical POS:',
        simplification.canonicalPOS
      ].join('\n')
    : projectJson;

  return (
    <CollapsiblePanel id="exports" title="Export Tools" subtitle="CSV, JSON, clipboard, and full text solution." icon={<Download size={20} />}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button type="button" className="tool-btn" disabled={!table} onClick={() => downloadTextFile('truth-table.csv', csv, 'text/csv;charset=utf-8')}>
          <Download size={17} /> CSV
        </button>
        <button type="button" className="tool-btn" onClick={() => downloadTextFile('truthcraft-project.json', projectJson, 'application/json')}>
          <Download size={17} /> JSON
        </button>
        <button type="button" className="tool-btn" disabled={!table} onClick={() => copyToClipboard(csv)}>
          <ClipboardCopy size={17} /> Copy Table
        </button>
        <button type="button" className="tool-btn" disabled={!simplification} onClick={() => copyToClipboard(simplification?.simplifiedSOP ?? '')}>
          <ClipboardCopy size={17} /> Copy Simplified
        </button>
        <button type="button" className="tool-btn sm:col-span-2 lg:col-span-4" onClick={() => downloadTextFile('truthcraft-solution.txt', solutionText)}>
          <Download size={17} /> Export Full Solution as Text
        </button>
      </div>
    </CollapsiblePanel>
  );
}
