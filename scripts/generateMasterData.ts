import * as fs from 'fs';
import * as path from 'path';
import { loadMasterDataFromExcel } from '../src/dpl/loadMasterData';

/**
 * Script to parse DPL_data-2.xlsx and generate src/dpl/masterData.ts
 * Run with: bun scripts/generateMasterData.ts
 */

const EXCEL_FILE = path.join(__dirname, '../src/dpl/DPL_data-2.xlsx');
const OUTPUT_FILE = path.join(__dirname, '../src/dpl/masterData.ts');

function generateMasterDataFile() {
  console.log('📖 Reading Excel file:', EXCEL_FILE);
  
  const masterData = loadMasterDataFromExcel(EXCEL_FILE);
  
  console.log(`✓ Parsed ${masterData.rows.length} rows from Excel`);

  // Generate TypeScript file
  const tsContent = `// Auto-generated from DPL_data-2.xlsx on ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - Run 'bun scripts/generateMasterData.ts' to regenerate
// This file contains ~${masterData.rows.length} rows of duct fitting data

import { MasterData } from "./types";

export const masterData: MasterData = {
  rows: ${JSON.stringify(masterData.rows, null, 2)}
};
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
  console.log(`✅ Generated ${OUTPUT_FILE}`);
  console.log(`✅ Total rows: ${masterData.rows.length}`);
  console.log(`✅ File size: ${(tsContent.length / 1024).toFixed(1)} KB`);
}

try {
  generateMasterDataFile();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
