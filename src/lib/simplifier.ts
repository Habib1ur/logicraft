import type { SimplificationResultType, TruthTableResult } from '../types';

interface Implicant {
  bits: string;
  covers: Set<number>;
}

export function simplifyFromTruthTable(table: TruthTableResult): SimplificationResultType {
  const variables = table.variables;
  const rowCount = 2 ** variables.length;
  const minterms = table.rows.filter((row) => row.output === 1).map((row) => row.index);
  const maxterms = table.rows.filter((row) => row.output === 0).map((row) => row.index);
  const isTautology = minterms.length === rowCount;
  const isContradiction = minterms.length === 0;

  const sopImplicants = minimizeMinterms(minterms, variables.length);
  const posImplicants = minimizeMinterms(maxterms, variables.length);

  const simplifiedSop = isContradiction
    ? '0'
    : isTautology
      ? '1'
      : sopImplicants.map((implicant) => implicantToSopTerm(implicant.bits, variables)).join(' + ');

  const simplifiedPos = isTautology
    ? '1'
    : isContradiction
      ? '0'
      : posImplicants.map((implicant) => implicantToPosClause(implicant.bits, variables)).join('.');

  const canonicalSop = isContradiction ? '0' : minterms.map((index) => mintermToProduct(index, variables)).join(' + ');
  const canonicalPos = isTautology ? '1' : maxterms.map((index) => maxtermToSum(index, variables)).join('.');

  const mintermNotation = `F(${variables.join(',')}) = Σm(${minterms.join(',')})`;
  const maxtermNotation = `F(${variables.join(',')}) = ΠM(${maxterms.join(',')})`;

  return {
    original: table.expression,
    simplifiedSop,
    simplifiedPos,
    canonicalSop,
    canonicalPos,
    mintermNotation,
    maxtermNotation,
    minterms,
    maxterms,
    variables,
    isTautology,
    isContradiction,
    steps: buildLearningSteps(table.expression, variables, minterms, maxterms, simplifiedSop, simplifiedPos),
  };
}

function buildLearningSteps(expression: string, variables: string[], minterms: number[], maxterms: number[], sop: string, pos: string): string[] {
  const totalRows = 2 ** variables.length;
  return [
    `TruthCraft detected variables ${variables.join(', ') || 'none'} from ${expression}.`,
    `${variables.length} variable(s) create ${totalRows} truth-table row(s).`,
    `Rows where F = 1 are minterms: ${minterms.length ? minterms.join(', ') : 'none'}.`,
    `Rows where F = 0 are maxterms: ${maxterms.length ? maxterms.join(', ') : 'none'}.`,
    `The simplified SOP groups the 1-output rows into larger implicants: ${sop}.`,
    `The simplified POS groups the 0-output rows and converts them into product-of-sums form: ${pos}.`,
  ];
}

function minimizeMinterms(minterms: number[], variableCount: number): Implicant[] {
  if (minterms.length === 0) return [];
  if (minterms.length === 2 ** variableCount) return [{ bits: '-'.repeat(variableCount), covers: new Set(minterms) }];

  let groups = new Map<number, Implicant[]>();
  minterms.forEach((minterm) => {
    const bits = toBinaryBits(minterm, variableCount);
    const ones = countOnes(bits);
    const list = groups.get(ones) ?? [];
    list.push({ bits, covers: new Set([minterm]) });
    groups.set(ones, list);
  });

  const primeMap = new Map<string, Implicant>();

  while (groups.size > 0) {
    const nextGroups = new Map<number, Implicant[]>();
    const used = new Set<string>();
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => a - b);

    for (const key of sortedKeys) {
      const current = groups.get(key) ?? [];
      const next = groups.get(key + 1) ?? [];
      for (const a of current) {
        for (const b of next) {
          const combinedBits = combineBits(a.bits, b.bits);
          if (!combinedBits) continue;
          used.add(signature(a));
          used.add(signature(b));
          const covers = new Set([...a.covers, ...b.covers]);
          const combined: Implicant = { bits: combinedBits, covers };
          const ones = countOnes(combinedBits);
          const list = nextGroups.get(ones) ?? [];
          if (!list.some((item) => item.bits === combined.bits)) list.push(combined);
          nextGroups.set(ones, list);
        }
      }
    }

    groups.forEach((items) => {
      items.forEach((item) => {
        if (!used.has(signature(item))) primeMap.set(item.bits, item);
      });
    });

    groups = nextGroups;
  }

  return selectEssentialImplicants(Array.from(primeMap.values()), minterms);
}

function selectEssentialImplicants(primes: Implicant[], minterms: number[]): Implicant[] {
  const uncovered = new Set(minterms);
  const selected = new Map<string, Implicant>();

  minterms.forEach((minterm) => {
    const covering = primes.filter((prime) => prime.covers.has(minterm));
    if (covering.length === 1) {
      selected.set(covering[0].bits, covering[0]);
      covering[0].covers.forEach((covered) => uncovered.delete(covered));
    }
  });

  while (uncovered.size > 0) {
    const best = primes
      .filter((prime) => !selected.has(prime.bits))
      .map((prime) => ({
        prime,
        score: Array.from(prime.covers).filter((item) => uncovered.has(item)).length,
        literals: countLiterals(prime.bits),
      }))
      .sort((a, b) => b.score - a.score || a.literals - b.literals)[0];

    if (!best || best.score === 0) break;
    selected.set(best.prime.bits, best.prime);
    best.prime.covers.forEach((covered) => uncovered.delete(covered));
  }

  return Array.from(selected.values()).sort((a, b) => a.bits.localeCompare(b.bits));
}

function combineBits(a: string, b: string): string | null {
  let differences = 0;
  let combined = '';
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === b[i]) combined += a[i];
    else {
      differences += 1;
      combined += '-';
    }
    if (differences > 1) return null;
  }
  return differences === 1 ? combined : null;
}

function toBinaryBits(value: number, length: number): string {
  return value.toString(2).padStart(length, '0');
}

function countOnes(bits: string): number {
  return bits.split('').filter((bit) => bit === '1').length;
}

function countLiterals(bits: string): number {
  return bits.split('').filter((bit) => bit !== '-').length;
}

function signature(implicant: Implicant): string {
  return `${implicant.bits}:${Array.from(implicant.covers).sort((a, b) => a - b).join(',')}`;
}

function mintermToProduct(index: number, variables: string[]): string {
  const bits = toBinaryBits(index, variables.length);
  return bits
    .split('')
    .map((bit, position) => (bit === '1' ? variables[position] : `${variables[position]}'`))
    .join('.');
}

function maxtermToSum(index: number, variables: string[]): string {
  const bits = toBinaryBits(index, variables.length);
  const clause = bits
    .split('')
    .map((bit, position) => (bit === '0' ? variables[position] : `${variables[position]}'`))
    .join(' + ');
  return `(${clause})`;
}

function implicantToSopTerm(bits: string, variables: string[]): string {
  const literals = bits
    .split('')
    .flatMap((bit, position) => {
      if (bit === '-') return [];
      return bit === '1' ? variables[position] : `${variables[position]}'`;
    });
  return literals.length ? literals.join('.') : '1';
}

function implicantToPosClause(bits: string, variables: string[]): string {
  const literals = bits
    .split('')
    .flatMap((bit, position) => {
      if (bit === '-') return [];
      return bit === '1' ? `${variables[position]}'` : variables[position];
    });
  return literals.length ? `(${literals.join(' + ')})` : '0';
}
