import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from "recharts";
import { CalcInputs, CalcOutputs, MasterData, DuctCalcWithMeta, UnitSystem } from "@/dpl/types";
import { CalculationMode } from "@/dpl/calcEngine";
import { extractCalculationDetails } from "@/dpl/interpolation";

interface ProofOfMethodPanelProps {
  ductId: string;
  inputs: CalcInputs;
  masterData: MasterData;
  results: CalcOutputs;
  calculationMode: CalculationMode;
  unitSystem: UnitSystem;
  registration: DuctCalcWithMeta;
}

export function ProofOfMethodPanel({
  ductId,
  inputs,
  masterData,
  results,
  calculationMode,
  registration,
}: ProofOfMethodPanelProps) {
  // Filter master data rows for this duct
  const relevantRows = useMemo(() => {
    return masterData.rows.filter(row => row.id === ductId);
  }, [ductId, masterData]);

  // Extract calculation details for visualization
  const calcDetails = useMemo(() => {
    return extractCalculationDetails(ductId, inputs, masterData, registration);
  }, [ductId, inputs, masterData, registration]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!calcDetails || calcDetails.dimension === '2D') return null;
    
    const { interpolationPoints } = calcDetails;
    return interpolationPoints.map((point: any) => ({
      parameter: point.x,
      C: point.y,
    }));
  }, [calcDetails]);

  // Get current calculation point for marker
  const currentPoint = useMemo(() => {
    if (!calcDetails || !calcDetails.parameterInfo.length) return null;
    const param = calcDetails.parameterInfo[0];
    const meta = results._meta as any;
    const cValue = meta?.C || 0;
    return { parameter: param.value, C: cValue };
  }, [calcDetails, results]);

  // Get table columns
  const tableColumns = useMemo(() => {
    if (relevantRows.length === 0) return [];
    const firstRow = relevantRows[0];
    return Object.keys(firstRow).filter(key => 
      key !== 'id' && !key.startsWith('Input_') && !key.startsWith('dropdown_')
    );
  }, [relevantRows]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Calculation Details - {ductId}</span>
          <Badge variant={calculationMode === "interpolated" ? "default" : "secondary"}>
            {calculationMode === "interpolated" ? "Interpolated" : "Legacy"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="breakdown">Calculation</TabsTrigger>
            <TabsTrigger value="data">Master Data</TabsTrigger>
            <TabsTrigger value="chart">Visualization</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Input Parameters</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(inputs).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-muted/50 rounded">
                    <span className="font-medium">{key}:</span>
                    <span>{typeof value === 'number' ? value.toFixed(4) : value}</span>
                  </div>
                ))}
              </div>
            </div>

            {calcDetails && calcDetails.parameterInfo.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Interpolation Parameters</h3>
                <div className="grid grid-cols-2 gap-2">
                  {calcDetails.parameterInfo.map((param) => (
                    <div key={param.name} className="flex justify-between p-2 bg-muted/50 rounded">
                      <span className="font-medium">{param.name}:</span>
                      <span>{param.value.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Calculation Results</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(results).map(([key, value]) => {
                  if (key === '_meta') return null;
                  return (
                    <div key={key} className="flex justify-between p-2 bg-muted/50 rounded">
                      <span className="font-medium">{key}:</span>
                      <span>{typeof value === 'number' ? value.toFixed(4) : value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {(() => {
              const meta = results._meta as any;
              return meta?.C && (
                <div className="p-4 bg-primary/10 rounded border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Loss Coefficient (C):</span>
                    <span className="text-2xl font-bold text-primary">{meta.C.toFixed(4)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {calculationMode === "interpolated" 
                      ? "Calculated using linear interpolation from master data table"
                      : "Retrieved from discrete master data lookup"}
                  </p>
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="data">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableColumns.map(col => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relevantRows.map((row, idx) => (
                    <TableRow key={idx}>
                      {tableColumns.map(col => (
                        <TableCell key={col}>
                          {typeof row[col] === 'number' ? row[col].toFixed(4) : row[col] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Showing {relevantRows.length} rows from master data table for duct {ductId}
            </p>
          </TabsContent>

          <TabsContent value="chart">
            {calcDetails?.dimension === '1D' && chartData && chartData.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Loss Coefficient (C) vs {calcDetails.parameterInfo[0]?.name || 'Parameter'}
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="parameter" 
                      label={{ value: calcDetails.parameterInfo[0]?.name || 'Parameter', position: 'insideBottom', offset: -5 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      label={{ value: 'Loss Coefficient (C)', angle: -90, position: 'insideLeft' }}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="C" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name={calculationMode === "interpolated" ? "Interpolated C" : "Legacy C"}
                      dot={{ r: 4 }}
                    />
                    {currentPoint && (
                      <ReferenceDot 
                        x={currentPoint.parameter} 
                        y={currentPoint.C} 
                        r={6} 
                        fill="hsl(var(--destructive))" 
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                        label="Current"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground">
                  {calculationMode === "interpolated" 
                    ? "Smooth curve shows interpolated values between data points"
                    : "Points show discrete lookup values from master data"}
                </p>
              </div>
            ) : calcDetails?.dimension === '2D' ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>2D visualization for multi-parameter interpolation coming soon.</p>
                <p className="text-sm mt-2">This duct uses {calcDetails.parameterInfo.length} parameters for interpolation.</p>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No interpolation data available for visualization.</p>
                <p className="text-sm mt-2">This may be a direct calculation without lookup tables.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
