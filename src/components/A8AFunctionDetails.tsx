import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { MasterData } from "@/dpl/types";

interface A8AFunctionDetailsProps {
  masterData: MasterData;
}

export function A8AFunctionDetails({ masterData }: A8AFunctionDetailsProps) {
  // Filter A8A rows
  const a8aRows = useMemo(() => {
    return masterData.rows.filter((row) => row.id === "A8A");
  }, [masterData]);

  // Get unique Re values
  const uniqueRe = useMemo(() => {
    const reValues = Array.from(new Set(a8aRows.map((row) => row.Re as number)));
    return reValues.sort((a, b) => a - b);
  }, [a8aRows]);

  // Selected Re plane
  const [selectedRe, setSelectedRe] = useState<number>(uniqueRe[0] || 50000);

  // Filter rows for selected Re
  const rowsForRe = useMemo(() => {
    return a8aRows.filter((row) => row.Re === selectedRe);
  }, [a8aRows, selectedRe]);

  // Get unique A1/A and ANGLE values for this Re plane
  const uniqueAreaRatios = useMemo(() => {
    const values = Array.from(new Set(rowsForRe.map((row) => row["A1/A"] as number)));
    return values.sort((a, b) => a - b);
  }, [rowsForRe]);

  const uniqueAngles = useMemo(() => {
    const values = Array.from(new Set(rowsForRe.map((row) => row.ANGLE as number)));
    return values.sort((a, b) => a - b);
  }, [rowsForRe]);

  // Legacy (Nearest Match) logic - matches A8A_calc behavior
  const legacyGridData = useMemo(() => {
    const gridData: any[] = [];
    
    // Create a denser grid for visualization
    const areaStep = (Math.max(...uniqueAreaRatios) - Math.min(...uniqueAreaRatios)) / 20;
    const angleStep = (Math.max(...uniqueAngles) - Math.min(...uniqueAngles)) / 20;
    
    for (let area = Math.min(...uniqueAreaRatios); area <= Math.max(...uniqueAreaRatios); area += areaStep) {
      for (let angle = Math.min(...uniqueAngles); angle <= Math.max(...uniqueAngles); angle += angleStep) {
        // Apply A8A_calc nearest-match logic
        
        // Match A1/A (prefer smallest >= area, else largest)
        const validAreaRows = rowsForRe.filter((row) => row["A1/A"] >= area);
        const closestArea = validAreaRows.length > 0
          ? Math.min(...validAreaRows.map((row) => row["A1/A"]))
          : Math.max(...rowsForRe.map((row) => row["A1/A"]));
        
        const areaFiltered = rowsForRe.filter((row) => row["A1/A"] === closestArea);
        
        // Match ANGLE
        let closestRow;
        if (angle < 90) {
          const validAngleRows = areaFiltered.filter((row) => row.ANGLE >= angle);
          closestRow = validAngleRows.length > 0
            ? validAngleRows.sort((a, b) => a.ANGLE - b.ANGLE)[0]
            : areaFiltered.sort((a, b) => b.ANGLE - a.ANGLE)[0];
        } else {
          const validAngleRows = areaFiltered.filter((row) => row.ANGLE <= angle);
          closestRow = validAngleRows.length > 0
            ? validAngleRows.sort((a, b) => b.ANGLE - a.ANGLE)[0]
            : areaFiltered.sort((a, b) => a.ANGLE - b.ANGLE)[0];
        }
        
        gridData.push({
          x: area,
          y: angle,
          C: closestRow.C,
        });
      }
    }
    
    return gridData;
  }, [rowsForRe, uniqueAreaRatios, uniqueAngles]);

  // Interpolated logic - bilinear interpolation
  const interpolatedGridData = useMemo(() => {
    const gridData: any[] = [];
    
    // Create a denser grid for smooth visualization
    const areaStep = (Math.max(...uniqueAreaRatios) - Math.min(...uniqueAreaRatios)) / 20;
    const angleStep = (Math.max(...uniqueAngles) - Math.min(...uniqueAngles)) / 20;
    
    for (let area = Math.min(...uniqueAreaRatios); area <= Math.max(...uniqueAreaRatios); area += areaStep) {
      for (let angle = Math.min(...uniqueAngles); angle <= Math.max(...uniqueAngles); angle += angleStep) {
        // Bilinear interpolation
        
        // Find surrounding points
        const lowerAreas = uniqueAreaRatios.filter(a => a <= area);
        const upperAreas = uniqueAreaRatios.filter(a => a >= area);
        const lowerAngles = uniqueAngles.filter(ang => ang <= angle);
        const upperAngles = uniqueAngles.filter(ang => ang >= angle);
        
        const area1 = lowerAreas.length > 0 ? Math.max(...lowerAreas) : Math.min(...uniqueAreaRatios);
        const area2 = upperAreas.length > 0 ? Math.min(...upperAreas) : Math.max(...uniqueAreaRatios);
        const angle1 = lowerAngles.length > 0 ? Math.max(...lowerAngles) : Math.min(...uniqueAngles);
        const angle2 = upperAngles.length > 0 ? Math.min(...upperAngles) : Math.max(...uniqueAngles);
        
        // Get C values at corners
        const getC = (a: number, ang: number) => {
          const row = rowsForRe.find(r => r["A1/A"] === a && r.ANGLE === ang);
          return row ? row.C : 0;
        };
        
        const C11 = getC(area1, angle1);
        const C12 = getC(area1, angle2);
        const C21 = getC(area2, angle1);
        const C22 = getC(area2, angle2);
        
        // Bilinear interpolation
        let C: number;
        if (area1 === area2 && angle1 === angle2) {
          C = C11;
        } else if (area1 === area2) {
          const t = (angle - angle1) / (angle2 - angle1);
          C = C11 * (1 - t) + C12 * t;
        } else if (angle1 === angle2) {
          const t = (area - area1) / (area2 - area1);
          C = C11 * (1 - t) + C21 * t;
        } else {
          const tx = (area - area1) / (area2 - area1);
          const ty = (angle - angle1) / (angle2 - angle1);
          C = C11 * (1 - tx) * (1 - ty) +
              C21 * tx * (1 - ty) +
              C12 * (1 - tx) * ty +
              C22 * tx * ty;
        }
        
        gridData.push({
          x: area,
          y: angle,
          C: C,
        });
      }
    }
    
    return gridData;
  }, [rowsForRe, uniqueAreaRatios, uniqueAngles]);

  // Color scale for C values
  const cMin = Math.min(...rowsForRe.map(r => r.C));
  const cMax = Math.max(...rowsForRe.map(r => r.C));
  
  const getColor = (c: number) => {
    const normalized = (c - cMin) / (cMax - cMin);
    const hue = (1 - normalized) * 240; // Blue (240) to Red (0)
    return `hsl(${hue}, 70%, 50%)`;
  };

  if (a8aRows.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            No data available for A8A
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Re Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Reynolds Number Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedRe.toString()} onValueChange={(v) => setSelectedRe(Number(v))}>
            <div className="flex gap-6">
              {uniqueRe.map((re) => (
                <div key={re} className="flex items-center space-x-2">
                  <RadioGroupItem value={re.toString()} id={`re-${re}`} />
                  <Label htmlFor={`re-${re}`}>Re = {re.toLocaleString()}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          <p className="text-sm text-muted-foreground mt-2">
            Showing C surface for Re = {selectedRe.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Side-by-side visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interpolated (New) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New (Interpolated)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="A1/A" 
                  label={{ value: 'A1/A (Area Ratio)', position: 'bottom', offset: 40 }}
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="ANGLE" 
                  label={{ value: 'ANGLE (degrees)', angle: -90, position: 'left', offset: 40 }}
                  domain={['dataMin', 'dataMax']}
                />
                <ZAxis type="number" dataKey="C" range={[50, 50]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border border-border rounded-md p-2 shadow-lg">
                          <p className="text-sm">A1/A: {data.x.toFixed(2)}</p>
                          <p className="text-sm">ANGLE: {data.y.toFixed(1)}°</p>
                          <p className="text-sm font-bold">C: {data.C.toFixed(4)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  data={interpolatedGridData} 
                  fill="#8884d8"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill={getColor(payload.C)}
                        stroke="none"
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Smooth bilinear interpolation between data points
            </p>
          </CardContent>
        </Card>

        {/* Legacy (Nearest Match) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Legacy (Nearest Match)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="A1/A" 
                  label={{ value: 'A1/A (Area Ratio)', position: 'bottom', offset: 40 }}
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="ANGLE" 
                  label={{ value: 'ANGLE (degrees)', angle: -90, position: 'left', offset: 40 }}
                  domain={['dataMin', 'dataMax']}
                />
                <ZAxis type="number" dataKey="C" range={[50, 50]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border border-border rounded-md p-2 shadow-lg">
                          <p className="text-sm">A1/A: {data.x.toFixed(2)}</p>
                          <p className="text-sm">ANGLE: {data.y.toFixed(1)}°</p>
                          <p className="text-sm font-bold">C: {data.C.toFixed(4)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  data={legacyGridData} 
                  fill="#82ca9d"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill={getColor(payload.C)}
                        stroke="none"
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Stepped surface using A8A_calc nearest-match logic
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Raw Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Master Data for Re = {selectedRe.toLocaleString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Re</TableHead>
                  <TableHead>A1/A</TableHead>
                  <TableHead>ANGLE</TableHead>
                  <TableHead>C</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rowsForRe
                  .sort((a, b) => {
                    if (a["A1/A"] !== b["A1/A"]) return a["A1/A"] - b["A1/A"];
                    return a.ANGLE - b.ANGLE;
                  })
                  .map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.Re.toLocaleString()}</TableCell>
                      <TableCell>{row["A1/A"]}</TableCell>
                      <TableCell>{row.ANGLE}</TableCell>
                      <TableCell>{typeof row.C === 'number' ? row.C.toFixed(4) : row.C}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
