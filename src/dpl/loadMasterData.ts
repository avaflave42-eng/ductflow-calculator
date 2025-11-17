import * as XLSX from 'xlsx';
import { MasterData } from './types';

/**
 * Loads and parses the master data from DPL_data-2.xlsx
 * This function is used by the generator script to create masterData.ts
 */
export function loadMasterDataFromExcel(filePath: string): MasterData {
  const workbook = XLSX.readFile(filePath);
  const sheetName = 'Master Table';
  const worksheet = workbook.Sheets[sheetName];
  
  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found in Excel file`);
  }

  // Convert sheet to JSON with header row
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { 
    raw: false,
    defval: null 
  });

  // Transform to MasterData format
  const rows = rawData.map((row: any) => {
    const transformedRow: any = { id: row.ID || '' };
    
    // Copy all columns to the row object
    Object.keys(row).forEach(key => {
      const value = row[key];
      
      // Convert numeric strings to numbers
      if (value !== null && value !== '' && value !== 'N/A') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && key !== 'ID') {
          transformedRow[key] = numValue;
        } else {
          transformedRow[key] = value;
        }
      } else {
        transformedRow[key] = value;
      }
    });
    
    return transformedRow;
  });

  return { rows };
}
