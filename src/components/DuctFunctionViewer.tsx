import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { A8AFunctionDetails } from "./A8AFunctionDetails";

interface DuctFunctionViewerProps {
  ductId: string;
  masterData: any;
  calculationMode: "legacy" | "interpolated";
}

export function DuctFunctionViewer({ ductId, masterData, calculationMode }: DuctFunctionViewerProps) {
  // Filter master data rows for this duct
  const relevantRows = useMemo(() => {
    return masterData.rows.filter((row: any) => row.id === ductId);
  }, [ductId, masterData]);

  // Determine if this is 1D or 2D data by checking column names
  const dataStructure = useMemo(() => {
    if (relevantRows.length === 0) return { dimension: "unknown", params: [] };
    
    const firstRow = relevantRows[0];
    const keys = Object.keys(firstRow).filter(k => k !== 'id' && k !== 'C' && k !== 'NAME' && k !== 'PATH');
    
    // Check for common 2D patterns
    const has2DPattern = keys.length >= 2 && (
      keys.some(k => k.toLowerCase().includes('theta')) ||
      keys.some(k => k.toLowerCase().includes('angle')) ||
      keys.some(k => k.includes('/') && keys.filter(k2 => k2.includes('/')).length > 1)
    );
    
    return {
      dimension: has2DPattern ? "2D" : "1D",
      params: keys,
      primaryParam: keys[0],
      secondaryParam: keys[1] || null,
    };
  }, [relevantRows]);

  // Prepare chart data for 1D visualization
  const chart1DData = useMemo(() => {
    if (dataStructure.dimension !== "1D" || !dataStructure.primaryParam) return [];
    
    return relevantRows
      .map((row: any) => ({
        x: row[dataStructure.primaryParam],
        C: row.C,
        name: row.NAME || "",
      }))
      .sort((a, b) => a.x - b.x);
  }, [relevantRows, dataStructure]);

  // Prepare chart data for 2D visualization (scatter plot representation)
  const chart2DData = useMemo(() => {
    if (dataStructure.dimension !== "2D" || !dataStructure.primaryParam || !dataStructure.secondaryParam) return [];
    
    return relevantRows.map((row: any) => ({
      x: row[dataStructure.primaryParam],
      y: row[dataStructure.secondaryParam],
      C: row.C,
      name: row.NAME || "",
    }));
  }, [relevantRows, dataStructure]);

  // Get all unique column names for table headers
  const tableColumns = useMemo(() => {
    if (relevantRows.length === 0) return [];
    const firstRow = relevantRows[0];
    return Object.keys(firstRow).filter(key => key !== 'id');
  }, [relevantRows]);

  const methodBadge = calculationMode === "legacy" ? (
    <Badge variant="outline" className="ml-2">Legacy Method</Badge>
  ) : (
    <Badge variant="default" className="ml-2">Interpolation Method</Badge>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          Duct Function Data: {ductId}
          {methodBadge}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {relevantRows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No master data found for {ductId}
          </div>
        ) : (
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className={`grid w-full ${ductId === "A8A" ? "grid-cols-3" : "grid-cols-2"}`}>
              <TabsTrigger value="chart">Visualization</TabsTrigger>
              <TabsTrigger value="data">Master Data Table</TabsTrigger>
              {ductId === "A8A" && <TabsTrigger value="details">Function Details</TabsTrigger>}
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Data Structure: {dataStructure.dimension} ({relevantRows.length} data points)
              </div>

              {dataStructure.dimension === "1D" && chart1DData.length > 0 && (
                <ChartContainer
                  config={{
                    C: {
                      label: "Loss Coefficient (C)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[400px] w-full"
                >
                  <ResponsiveContainer>
                    <LineChart data={chart1DData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="x" 
                        label={{ value: dataStructure.primaryParam, position: 'insideBottom', offset: -5 }}
                        className="text-xs"
                      />
                      <YAxis 
                        label={{ value: 'Loss Coefficient (C)', angle: -90, position: 'insideLeft' }}
                        className="text-xs"
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="C" 
                        stroke="var(--color-C)" 
                        strokeWidth={2}
                        dot={{ fill: "var(--color-C)", r: 4 }}
                        name="Loss Coefficient (C)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {dataStructure.dimension === "2D" && chart2DData.length > 0 && (
                <ChartContainer
                  config={{
                    C: {
                      label: "Loss Coefficient (C)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[400px] w-full"
                >
                  <ResponsiveContainer>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        name={dataStructure.primaryParam}
                        label={{ value: dataStructure.primaryParam, position: 'insideBottom', offset: -5 }}
                        className="text-xs"
                      />
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        name={dataStructure.secondaryParam}
                        label={{ value: dataStructure.secondaryParam, angle: -90, position: 'insideLeft' }}
                        className="text-xs"
                      />
                      <ZAxis type="number" dataKey="C" range={[50, 400]} name="Loss Coefficient (C)" />
                      <ChartTooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      {dataStructure.primaryParam}
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                      {data.x}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      {dataStructure.secondaryParam}
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                      {data.y}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Loss Coefficient (C)
                                    </span>
                                    <span className="font-bold">
                                      {data.C.toFixed(4)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Scatter 
                        name="Data Points" 
                        data={chart2DData} 
                        fill="var(--color-C)"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {dataStructure.dimension === "unknown" && (
                <div className="text-center py-8 text-muted-foreground">
                  Unable to determine data structure for visualization
                </div>
              )}
            </TabsContent>

            <TabsContent value="data">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableColumns.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relevantRows.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        {tableColumns.map((col) => (
                          <TableCell key={col}>
                            {typeof row[col] === 'number' ? row[col].toFixed(4) : row[col]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Total rows: {relevantRows.length}
              </div>
            </TabsContent>
            
            {/* Function Details Tab - A8A specific */}
            {ductId === "A8A" && (
              <TabsContent value="details">
                <A8AFunctionDetails masterData={masterData} />
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
