# TruthCraft

TruthCraft is a lightweight, frontend-only truth table generator and Boolean algebra learning tool built with React, TypeScript, Vite, Tailwind CSS, Zustand, and Lucide React.

## Features

- Boolean expression input with variables A-Z
- Gate button panel for AND, OR, NOT, NAND, NOR, XOR, XNOR, constants, parentheses, complement, clear, and backspace
- Automatic variable detection
- Truth table generation with optional intermediate columns
- Minterm and maxterm notation support:
  - `F(A,B,C)=Σm(0,2,4,6)`
  - `F(A,B,C)=ΠM(1,3,5,7)`
- Boolean simplification using a Quine-McCluskey style implicant cover
- Canonical SOP and POS generation
- Simplified SOP and POS generation
- Export truth table as CSV
- Export/import project JSON
- Copy table and simplified expression
- LocalStorage history, saved expressions, favorites, settings, and panel states
- Collapsible, minimizable, hide/show panels
- Dark/light/system theme
- Responsive dashboard layout
- Accessible labels, keyboard-friendly controls, and horizontal table scrolling on mobile

## Supported syntax

Examples:

```txt
A.B + C'
A + B
!A
~(A+B)
A && B
A || B
A NAND B
A NOR B
A XOR B
A XNOR B
(A + B).C'
F(A,B,C)=Σm(0,2,4,6)
F(A,B,C)=ΠM(1,3,5,7)
```

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Project structure

```txt
src/
  components/
    buttons/
    panels/
    table/
  lib/
    booleanParser.ts
    truthTable.ts
    simplifier.ts
  store/
    useAppStore.ts
  types/
  utils/
  App.tsx
  main.tsx
```

## Notes

This app has no backend and no database. All saved work is stored in the browser using LocalStorage through Zustand persistence.
