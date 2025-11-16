import { useState, useMemo } from "react";
import { ductDefinitions } from "@/dpl/ductDefinitions";
import { applyDynamicDropdowns } from "@/dpl/dynamicDropdowns";
import { categoriesMap } from "@/dpl/categoriesMap";
import { constraintsByDuct } from "@/dpl/constraints";
import { masterData } from "@/dpl/mockMasterData";
import { ductRegistry } from "@/dpl/registry";
import { runDuctCalculation } from "@/dpl/calcEngine";
import { UnitConverter } from "@/dpl/unitConverter";
import { UnitSystem, CalcOutputs } from "@/dpl/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ThemeToggle } from "@/components/theme-toggle";

const DPLCalculator = () => {
  const [selectedDuctId, setSelectedDuctId] = useState<string>("A7A");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<CalcOutputs | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [expandedShapes, setExpandedShapes] = useState<Set<string>>(new Set(["Round"]));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Elbows"]));

  // Apply dynamic dropdowns from master data
  const selectedDuct = useMemo(() => {
    const baseDuct = ductDefinitions.find((d) => d.id === selectedDuctId);
    if (!baseDuct) return undefined;
    return applyDynamicDropdowns(baseDuct, masterData);
  }, [selectedDuctId]);

  const toggleShape = (shape: string) => {
    setExpandedShapes(prev => {
      const next = new Set(prev);
      if (next.has(shape)) {
        next.delete(shape);
      } else {
        next.add(shape);
      }
      return next;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleDuctChange = (newDuctId: string) => {
    setSelectedDuctId(newDuctId);
    setRawInputs({});
    setResults(null);
    setErrors([]);
  };

  const handleUnitSystemChange = (newSystem: UnitSystem) => {
    setUnitSystem(newSystem);
  };

  const handleInputChange = (label: string, value: string) => {
    setRawInputs((prev) => ({ ...prev, [label]: value }));
  };

  const handleCalculate = () => {
    if (!selectedDuct) return;

    const ctx = {
      duct: selectedDuct,
      unitSystem,
      constraints: constraintsByDuct[selectedDuctId] ?? [],
      masterData,
      registry: ductRegistry,
    };

    const result = runDuctCalculation(rawInputs, ctx);

    if (result.errors) {
      setErrors(result.errors);
      setResults(null);
    } else {
      setErrors([]);
      setResults(result.outputs ?? null);
    }
  };


  const getDisplayLabel = (label: string) => {
    return UnitConverter.getDisplayLabel(label, unitSystem);
  };

  // Separate branch and main outputs
  const branchOutputs = results ? Object.entries(results).filter(([label]) => 
    label.toLowerCase().includes("branch") && !label.startsWith("_")
  ) : [];
  
  const mainOutputs = results ? Object.entries(results).filter(([label]) => 
    label.toLowerCase().includes("main") && !label.startsWith("_")
  ) : [];
  
  const standardOutputs = results ? Object.entries(results).filter(([label]) => 
    !label.toLowerCase().includes("branch") && !label.toLowerCase().includes("main") && !label.startsWith("_")
  ) : [];

  const hasOutputs = branchOutputs.length > 0 || mainOutputs.length > 0 || standardOutputs.length > 0;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Duct Pressure Loss Calculator (SMACNA)
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Label className="text-sm text-muted-foreground">Unit System:</Label>
            <Select value={unitSystem} onValueChange={(val) => handleUnitSystemChange(val as UnitSystem)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imperial">Imperial</SelectItem>
                <SelectItem value="metric">Metric</SelectItem>
              </SelectContent>
            </Select>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - 3-Level Duct Selection Tree */}
        <aside className="w-80 border-r bg-sidebar overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-sidebar">
            <h2 className="font-semibold text-sidebar-foreground">Duct Fitting Cases</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {Object.entries(categoriesMap).map(([shape, categories]) => (
                <Collapsible
                  key={shape}
                  open={expandedShapes.has(shape)}
                  onOpenChange={() => toggleShape(shape)}
                  className="mb-2"
                >
                  <CollapsibleTrigger className="flex items-center w-full px-3 py-2 text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
                    <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${expandedShapes.has(shape) ? '' : '-rotate-90'}`} />
                    {shape}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-4 mt-1 space-y-1">
                      {Object.entries(categories).map(([category, ductIds]) => (
                        <Collapsible
                          key={`${shape}-${category}`}
                          open={expandedCategories.has(`${shape}-${category}`)}
                          onOpenChange={() => toggleCategory(`${shape}-${category}`)}
                        >
                          <CollapsibleTrigger className="flex items-center w-full px-3 py-1.5 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
                            <ChevronRight className={`h-3 w-3 mr-2 transition-transform ${expandedCategories.has(`${shape}-${category}`) ? 'rotate-90' : ''}`} />
                            {category}
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-5 mt-1 space-y-0.5">
                              {ductIds.map((ductId) => {
                                const ductDef = ductDefinitions.find(d => d.id === ductId);
                                if (!ductDef) return null;
                                return (
                                  <button
                                    key={ductId}
                                    onClick={() => handleDuctChange(ductId)}
                                    className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors ${
                                      selectedDuctId === ductId
                                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                                    }`}
                                  >
                                    {ductDef.name}
                                  </button>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="h-full flex flex-col">
            {/* Top Section - Inputs and Outputs */}
            <div className="grid grid-cols-2 gap-6 p-6 border-b">
              {/* Input Parameters */}
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Input Parameters ({selectedDuct?.id || "N/A"})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDuct?.inputs.map((field) => (
                    <div key={field.entryKey} className="grid grid-cols-2 items-center gap-3">
                      <Label htmlFor={field.entryKey} className="text-sm">
                        {getDisplayLabel(field.label)}:
                      </Label>
                      {field.type === "number" && (
                        <Input
                          id={field.entryKey}
                          type="number"
                          step="any"
                          value={rawInputs[field.label] ?? ""}
                          onChange={(e) => handleInputChange(field.label, e.target.value)}
                          className="h-9"
                        />
                      )}
                      {field.type === "select" && field.options && (
                        <Select
                          value={rawInputs[field.label] ?? ""}
                          onValueChange={(val) => handleInputChange(field.label, val)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                  <Button onClick={handleCalculate} className="w-full mt-4">
                    Calculate
                  </Button>
                </CardContent>
              </Card>

              {/* Output Results */}
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Output</CardTitle>
                </CardHeader>
                <CardContent>
                  {errors.length > 0 && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc pl-4 space-y-1">
                          {errors.map((err, idx) => (
                            <li key={idx} className="text-sm">{err}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {!hasOutputs && errors.length === 0 && (
                    <div className="text-sm text-muted-foreground space-y-2">
                      {selectedDuct?.outputs.map((output) => (
                        <div key={output.key} className="flex justify-between py-1">
                          <span>{getDisplayLabel(output.label)}:</span>
                          <span>N/A</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {hasOutputs && (
                    <div className="space-y-4">
                      {/* Branch Outputs */}
                      {branchOutputs.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-foreground">Branch</h3>
                          <div className="space-y-2">
                            {branchOutputs.map(([label, value]) => {
                              const { label: displayLabel, value: displayValue } =
                                UnitConverter.formatOutputForDisplay(label, value, unitSystem);
                              return (
                                <div key={label} className="flex justify-between text-sm py-1">
                                  <span className="text-muted-foreground">{displayLabel}:</span>
                                  <span className="font-medium text-foreground">{displayValue}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Main Outputs */}
                      {mainOutputs.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-foreground">Main</h3>
                          <div className="space-y-2">
                            {mainOutputs.map(([label, value]) => {
                              const { label: displayLabel, value: displayValue } =
                                UnitConverter.formatOutputForDisplay(label, value, unitSystem);
                              return (
                                <div key={label} className="flex justify-between text-sm py-1">
                                  <span className="text-muted-foreground">{displayLabel}:</span>
                                  <span className="font-medium text-foreground">{displayValue}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Standard Outputs */}
                      {standardOutputs.length > 0 && (
                        <div className="space-y-2">
                          {standardOutputs.map(([label, value]) => {
                            const { label: displayLabel, value: displayValue } =
                              UnitConverter.formatOutputForDisplay(label, value, unitSystem);
                            return (
                              <div key={label} className="flex justify-between text-sm py-1">
                                <span className="text-muted-foreground">{displayLabel}:</span>
                                <span className="font-medium text-foreground">{displayValue}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Section - Duct Diagram */}
            <div className="flex-1 p-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Duct Diagram</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[calc(100%-4rem)]">
                  <p className="text-muted-foreground text-sm">Duct diagram will be displayed here</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DPLCalculator;
