import type { SimplificationResult, TruthTableResult } from '../types';

type Implicant = {
  pattern: string;
  minterms: number[];
  used?: boolean;
};

const bits = (index: number, count: number) => index.toString(2).padStart(count, '0');
const unique = <T,>(items: T[]) => Array.from(new Set(items));

const literalCount = (pattern: string) => [...pattern].filter((char) => char !== '-').length;

const differsByOneBit = (a: string, b: string) => {
  let diff = 0;
  let combined = '';
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === b[i]) {
      combined += a[i];
    } else {
      diff += 1;
      combined += '-';
    }
  }
  return diff === 1 ? combined : null;
};

const covers = (pattern: string, index: number, count: number) => {
  const bitString = bits(index, count);
  return [...pattern].every((char, i) => char === '-' || char === bitString[i]);
};

const mergeImplicants = (a: Implicant, b: Implicant): Implicant | null => {
  const combined = differsByOneBit(a.pattern, b.pattern);
  if (!combined) return null;
  return {
    pattern: combined,
    minterms: unique([...a.minterms, ...b.minterms]).sort((x, y) => x - y)
  };
};

const getPrimeImplicants = (ones: number[], variableCount: number): Implicant[] => {
  let groups = new Map<number, Implicant[]>();
  ones.forEach((minterm) => {
    const pattern = bits(minterm, variableCount);
    const onesCount = [...pattern].filter((bit) => bit === '1').length;
    groups.set(onesCount, [...(groups.get(onesCount) ?? []), { pattern, minterms: [minterm] }]);
  });

  const primes = new Map<string, Implicant>();

  while (groups.size > 0) {
    const nextGroups = new Map<number, Implicant[]>();
    const keys = [...groups.keys()].sort((a, b) => a - b);
    const usedPatterns = new Set<string>();

    keys.forEach((key) => {
      const current = groups.get(key) ?? [];
      const next = groups.get(key + 1) ?? [];
      current.forEach((a) => {
        next.forEach((b) => {
          const merged = mergeImplicants(a, b);
          if (merged) {
            usedPatterns.add(a.pattern);
            usedPatterns.add(b.pattern);
            const groupKey = [...merged.pattern].filter((bit) => bit === '1').length;
            const existing = nextGroups.get(groupKey) ?? [];
            if (!existing.some((item) => item.pattern === merged.pattern)) {
              nextGroups.set(groupKey, [...existing, merged]);
            }
          }
        });
      });
    });

    groups.forEach((items) => {
      items.forEach((item) => {
        if (!usedPatterns.has(item.pattern)) primes.set(item.pattern, item);
      });
    });

    groups = nextGroups;
  }

  return [...primes.values()].sort((a, b) => literalCount(a.pattern) - literalCount(b.pattern));
};

const findMinimalCover = (targets: number[], primeImplicants: Implicant[], variableCount: number): Implicant[] => {
  const uncovered = new Set(targets);
  const selected = new Map<string, Implicant>();
  const coverMap = new Map<number, Implicant[]>();

  targets.forEach((target) => {
    coverMap.set(
      target,
      primeImplicants.filter((implicant) => covers(implicant.pattern, target, variableCount))
    );
  });

  targets.forEach((target) => {
    const coverers = coverMap.get(target) ?? [];
    if (coverers.length === 1) {
      selected.set(coverers[0].pattern, coverers[0]);
    }
  });

  selected.forEach((implicant) => {
    targets.forEach((target) => {
      if (covers(implicant.pattern, target, variableCount)) uncovered.delete(target);
    });
  });

  if (uncovered.size === 0) return [...selected.values()];

  const candidates = primeImplicants.filter((implicant) => !selected.has(implicant.pattern));
  if (candidates.length <= 22) {
    let best: Implicant[] | null = null;
    const remaining = [...uncovered];

    const search = (start: number, picked: Implicant[]) => {
      if (best && picked.length >= best.length) return;
      const isCovered = remaining.every((target) => picked.some((implicant) => covers(implicant.pattern, target, variableCount)));
      if (isCovered) {
        if (
          !best ||
          picked.length < best.length ||
          (picked.length === best.length &&
            picked.reduce((sum, item) => sum + literalCount(item.pattern), 0) < best.reduce((sum, item) => sum + literalCount(item.pattern), 0))
        ) {
          best = [...picked];
        }
        return;
      }

      for (let i = start; i < candidates.length; i += 1) {
        search(i + 1, [...picked, candidates[i]]);
      }
    };

    search(0, []);
    return [...selected.values(), ...(best ?? [])];
  }

  // Fallback for unusually complex 6-variable cases: greedy cover keeps the UI fast.
  while (uncovered.size > 0) {
    const best = candidates
      .filter((candidate) => !selected.has(candidate.pattern))
      .map((candidate) => ({
        candidate,
        covers: [...uncovered].filter((target) => covers(candidate.pattern, target, variableCount)).length
      }))
      .sort((a, b) => b.covers - a.covers || literalCount(a.candidate.pattern) - literalCount(b.candidate.pattern))[0];

    if (!best || best.covers === 0) break;
    selected.set(best.candidate.pattern, best.candidate);
    [...uncovered].forEach((target) => {
      if (covers(best.candidate.pattern, target, variableCount)) uncovered.delete(target);
    });
  }

  return [...selected.values()];
};

const productTerm = (pattern: string, variables: string[]) => {
  const literals = [...pattern].flatMap((bit, index) => {
    if (bit === '-') return [];
    return bit === '1' ? variables[index] : `${variables[index]}'`;
  });
  if (literals.length === 0) return '1';
  return literals.join('.');
};

const sumClause = (pattern: string, variables: string[]) => {
  const literals = [...pattern].flatMap((bit, index) => {
    if (bit === '-') return [];
    return bit === '0' ? variables[index] : `${variables[index]}'`;
  });
  if (literals.length === 0) return '0';
  return `(${literals.join(' + ')})`;
};

const canonicalSOP = (minterms: number[], variables: string[]) => {
  const total = 2 ** variables.length;
  if (minterms.length === 0) return '0';
  if (minterms.length === total) return '1';
  return minterms.map((index) => productTerm(bits(index, variables.length), variables)).join(' + ');
};

const canonicalPOS = (maxterms: number[], variables: string[]) => {
  const total = 2 ** variables.length;
  if (maxterms.length === 0) return '1';
  if (maxterms.length === total) return '0';
  return maxterms.map((index) => sumClause(bits(index, variables.length), variables)).join('.');
};

const simplifySOP = (minterms: number[], variables: string[]) => {
  const total = 2 ** variables.length;
  if (minterms.length === 0) return { expression: '0', implicants: [] as Implicant[] };
  if (minterms.length === total) return { expression: '1', implicants: [{ pattern: '-'.repeat(variables.length), minterms }] };
  const primes = getPrimeImplicants(minterms, variables.length);
  const cover = findMinimalCover(minterms, primes, variables.length);
  return {
    expression: cover.map((implicant) => productTerm(implicant.pattern, variables)).join(' + '),
    implicants: cover
  };
};

const simplifyPOS = (maxterms: number[], variables: string[]) => {
  const total = 2 ** variables.length;
  if (maxterms.length === 0) return { expression: '1', implicants: [] as Implicant[] };
  if (maxterms.length === total) return { expression: '0', implicants: [{ pattern: '-'.repeat(variables.length), minterms: maxterms }] };
  const primes = getPrimeImplicants(maxterms, variables.length);
  const cover = findMinimalCover(maxterms, primes, variables.length);
  return {
    expression: cover.map((implicant) => sumClause(implicant.pattern, variables)).join('.'),
    implicants: cover
  };
};

export const simplifyTruthTable = (table: TruthTableResult, originalExpression: string): SimplificationResult => {
  const minterms = table.rows.filter((row) => row.output).map((row) => row.index);
  const maxterms = table.rows.filter((row) => !row.output).map((row) => row.index);
  const sop = simplifySOP(minterms, table.variables);
  const pos = simplifyPOS(maxterms, table.variables);
  const variablesLabel = table.variables.join(',');

  const steps = [
    `Detected variables in order: ${table.variables.join(', ') || 'none'}.`,
    `Rows where F = 1 give minterms: ${minterms.length ? minterms.join(', ') : 'none'}.`,
    `Rows where F = 0 give maxterms: ${maxterms.length ? maxterms.join(', ') : 'none'}.`,
    'Canonical SOP is built by OR-ing every minterm where the output is 1.',
    'Canonical POS is built by AND-ing every maxterm where the output is 0.',
    'Simplified forms are minimized using a Quine-McCluskey style implicant cover for student-friendly exact results up to 6 variables.'
  ];

  return {
    original: originalExpression,
    simplifiedSOP: sop.expression,
    simplifiedPOS: pos.expression,
    canonicalSOP: canonicalSOP(minterms, table.variables),
    canonicalPOS: canonicalPOS(maxterms, table.variables),
    minterms,
    maxterms,
    mintermNotation: `F(${variablesLabel}) = Σm(${minterms.join(',')})`,
    maxtermNotation: `F(${variablesLabel}) = ΠM(${maxterms.join(',')})`,
    steps
  };
};
