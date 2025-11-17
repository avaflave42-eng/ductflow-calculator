# Master Data Generation

The DPL calculator uses master table data from `DPL_data-2.xlsx`.

## Initial Setup

Run this command once to generate the master data TypeScript file:

```bash
bun scripts/generateMasterData.ts
```

This will:
- Read `src/dpl/DPL_data-2.xlsx`
- Parse all rows from the "Master Table" sheet
- Generate `src/dpl/masterData.ts` with type-safe data
- The generated file is ~4600 rows of duct fitting data

## Updating Data

Whenever `DPL_data-2.xlsx` is updated:
1. Replace the file at `src/dpl/DPL_data-2.xlsx`
2. Run `bun scripts/generateMasterData.ts` again
3. Commit the updated `masterData.ts`

## Why Not Load Excel at Runtime?

The data is pre-converted to TypeScript because:
- **Faster**: No runtime parsing overhead
- **Type-safe**: TypeScript validates the data structure
- **Bundled**: Data is included in the build, no external file loading
- **Reliable**: No risk of missing/corrupt Excel files in production
