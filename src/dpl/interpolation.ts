/**
 * Interpolation utilities for duct pressure loss calculations
 * Provides 1D and 2D linear interpolation for lookup tables
 */

export interface DataPoint1D {
  x: number;
  y: number;
}

export interface DataPoint2D {
  x: number;
  y: number;
  z: number;
}

/**
 * 1D Linear Interpolation
 * Interpolates between two points to find y value at target x
 * 
 * @param x - Target x value
 * @param points - Array of {x, y} data points (must be sorted by x)
 * @returns Interpolated y value
 */
export function interpolate1D(x: number, points: DataPoint1D[]): number {
  if (points.length === 0) return 0;
  if (points.length === 1) return points[0].y;

  // Sort points by x to ensure proper interpolation
  const sorted = [...points].sort((a, b) => a.x - b.x);

  // Handle edge cases - extrapolation
  if (x <= sorted[0].x) return sorted[0].y;
  if (x >= sorted[sorted.length - 1].x) return sorted[sorted.length - 1].y;

  // Find bracketing points
  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];

    if (x >= p1.x && x <= p2.x) {
      // Linear interpolation formula: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
      const slope = (p2.y - p1.y) / (p2.x - p1.x);
      return p1.y + slope * (x - p1.x);
    }
  }

  return sorted[sorted.length - 1].y;
}

/**
 * 2D Bilinear Interpolation
 * Interpolates between four corner points to find z value at target (x, y)
 * 
 * @param x - Target x value
 * @param y - Target y value
 * @param points - Array of {x, y, z} data points
 * @returns Interpolated z value
 */
export function interpolate2D(x: number, y: number, points: DataPoint2D[]): number {
  if (points.length === 0) return 0;
  if (points.length === 1) return points[0].z;

  // Get unique sorted x and y values
  const xValues = [...new Set(points.map(p => p.x))].sort((a, b) => a - b);
  const yValues = [...new Set(points.map(p => p.y))].sort((a, b) => a - b);

  // Handle edge cases
  if (xValues.length === 1) {
    // Only one x value, do 1D interpolation on y
    const yPoints = points.filter(p => p.x === xValues[0]).map(p => ({ x: p.y, y: p.z }));
    return interpolate1D(y, yPoints);
  }
  if (yValues.length === 1) {
    // Only one y value, do 1D interpolation on x
    const xPoints = points.filter(p => p.y === yValues[0]).map(p => ({ x: p.x, y: p.z }));
    return interpolate1D(x, xPoints);
  }

  // Clamp to grid bounds
  const x_clamped = Math.max(xValues[0], Math.min(x, xValues[xValues.length - 1]));
  const y_clamped = Math.max(yValues[0], Math.min(y, yValues[yValues.length - 1]));

  // Find bracketing x values
  let x1 = xValues[0], x2 = xValues[0];
  for (let i = 0; i < xValues.length - 1; i++) {
    if (x_clamped >= xValues[i] && x_clamped <= xValues[i + 1]) {
      x1 = xValues[i];
      x2 = xValues[i + 1];
      break;
    }
  }
  if (x_clamped >= xValues[xValues.length - 1]) {
    x1 = x2 = xValues[xValues.length - 1];
  }

  // Find bracketing y values
  let y1 = yValues[0], y2 = yValues[0];
  for (let i = 0; i < yValues.length - 1; i++) {
    if (y_clamped >= yValues[i] && y_clamped <= yValues[i + 1]) {
      y1 = yValues[i];
      y2 = yValues[i + 1];
      break;
    }
  }
  if (y_clamped >= yValues[yValues.length - 1]) {
    y1 = y2 = yValues[yValues.length - 1];
  }

  // Find the four corner points
  const findPoint = (px: number, py: number): number => {
    const point = points.find(p => p.x === px && p.y === py);
    return point ? point.z : 0;
  };

  const z11 = findPoint(x1, y1); // bottom-left
  const z12 = findPoint(x1, y2); // top-left
  const z21 = findPoint(x2, y1); // bottom-right
  const z22 = findPoint(x2, y2); // top-right

  // If points are the same (single cell), return the value
  if (x1 === x2 && y1 === y2) return z11;

  // Bilinear interpolation
  if (x1 === x2) {
    // Vertical interpolation only
    const t = (y_clamped - y1) / (y2 - y1);
    return z11 + t * (z12 - z11);
  }
  if (y1 === y2) {
    // Horizontal interpolation only
    const t = (x_clamped - x1) / (x2 - x1);
    return z11 + t * (z21 - z11);
  }

  // Full bilinear interpolation
  const tx = (x_clamped - x1) / (x2 - x1);
  const ty = (y_clamped - y1) / (y2 - y1);

  const z1 = z11 * (1 - tx) + z21 * tx; // interpolate along y1
  const z2 = z12 * (1 - tx) + z22 * tx; // interpolate along y2
  const z = z1 * (1 - ty) + z2 * ty;     // interpolate along x

  return z;
}

/**
 * Helper function to extract 1D data points from master data rows
 */
export function extract1DPoints(
  rows: any[],
  xKey: string,
  yKey: string = "C"
): DataPoint1D[] {
  return rows
    .filter(row => row[xKey] !== undefined && row[yKey] !== undefined)
    .map(row => ({
      x: row[xKey],
      y: row[yKey]
    }));
}

/**
 * Helper function to extract 2D data points from master data rows
 */
export function extract2DPoints(
  rows: any[],
  xKey: string,
  yKey: string,
  zKey: string = "C"
): DataPoint2D[] {
  return rows
    .filter(row => 
      row[xKey] !== undefined && 
      row[yKey] !== undefined && 
      row[zKey] !== undefined
    )
    .map(row => ({
      x: row[xKey],
      y: row[yKey],
      z: row[zKey]
    }));
}

/**
 * Extract calculation details for visualization
 * Analyzes duct type and prepares data for Proof of Method panel
 */
export function extractCalculationDetails(
  ductId: string,
  inputs: any,
  masterData: any,
  registration: any
): {
  relevantRows: any[];
  parameterInfo: { name: string; value: number }[];
  interpolationPoints: DataPoint1D[] | DataPoint2D[];
  dimension: '1D' | '2D';
} | null {
  const relevantRows = masterData.rows.filter((row: any) => row.id === ductId);
  
  if (relevantRows.length === 0) {
    return null;
  }

  // Determine dimension based on unique parameter columns
  const firstRow = relevantRows[0];
  const parameterColumns = Object.keys(firstRow).filter(
    key => !['id', 'C', 'K'].includes(key) && 
           !key.startsWith('Input_') && 
           !key.startsWith('dropdown_') &&
           typeof firstRow[key] === 'number'
  );

  // Simple heuristic: if we have 1-2 parameter columns, it's likely 1D or 2D
  if (parameterColumns.length === 0) {
    return null;
  }

  // For now, assume 1D if we have one clear parameter column
  const dimension = parameterColumns.length === 1 ? '1D' : '2D';
  
  let interpolationPoints: DataPoint1D[] | DataPoint2D[];
  let parameterInfo: { name: string; value: number }[] = [];

  if (dimension === '1D' && parameterColumns.length > 0) {
    const paramKey = parameterColumns[0];
    interpolationPoints = extract1DPoints(relevantRows, paramKey, 'C');
    
    // Try to find the parameter value from inputs
    const paramValue = inputs[`entry_${paramKey}`] || inputs.entry_2 || 0;
    parameterInfo = [{ name: paramKey, value: Number(paramValue) }];
  } else {
    // 2D case
    interpolationPoints = [];
    parameterInfo = parameterColumns.map(col => ({
      name: col,
      value: 0 // Would need to map from inputs properly
    }));
  }

  return {
    relevantRows,
    parameterInfo,
    interpolationPoints,
    dimension,
  };
}
