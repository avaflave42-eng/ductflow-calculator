// PLACEHOLDER: Run 'bun scripts/generateMasterData.ts' to generate the real data
// This will parse DPL_data-2.xlsx and create ~4600 rows of duct fitting data

import { MasterData } from "./types";

// Temporary: Re-export mockMasterData until generation script is run
import { masterData as mockData } from "./mockMasterData";

export const masterData: MasterData = mockData;

// After running the script, this file will contain all real data from Excel
