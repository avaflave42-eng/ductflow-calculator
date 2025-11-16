import { useState, useMemo, useRef } from "react";
import { ductDefinitions } from "@/dpl/ductDefinitions";
import { applyDynamicDropdowns } from "@/dpl/dynamicDropdowns";
import { applyInputLabelsFromMasterData } from "@/dpl/masterDataHelpers";
import { categoriesMap } from "@/dpl/categoriesMap";
import { constraintsByDuct } from "@/dpl/constraints";
import { masterData } from "@/dpl/mockMasterData";
import { ductRegistry } from "@/dpl/registry";
import { runDuctCalculation } from "@/dpl/calcEngine";
import { UnitConverter } from "@/dpl/unitConverter";
import { UnitSystem, CalcOutputs, CalcInputs } from "@/dpl/types";
import { CalculationMode } from "@/dpl/calcEngine";
import { ProofOfMethodPanel } from "@/components/ProofOfMethodPanel";
import { DuctFunctionViewer } from "@/components/DuctFunctionViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ThemeToggle } from "@/components/theme-toggle";

const DPLCalculator = () => {
  const [selectedDuctId, setSelectedDuctId] = useState<string>("A7A");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [calculationMode, setCalculationMode] = useState<CalculationMode>("legacy");
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<CalcOutputs | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [expandedShapes, setExpandedShapes] = useState<Set<string>>(new Set(["Round"]));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Elbows"]));
  const [calcInputs, setCalcInputs] = useState<CalcInputs>({});
  const [showProofOfMethod, setShowProofOfMethod] = useState(false);
  const [showFunctionViewer, setShowFunctionViewer] = useState(false);
  const proofPanelRef = useRef<HTMLDivElement>(null);
  const functionViewerRef = useRef<HTMLDivElement>(null);

  // Apply dynamic dropdowns and input labels from master data
  const selectedDuct = useMemo(() => {
    const baseDuct = ductDefinitions.find((d) => d.id === selectedDuctId);
    if (!baseDuct) return undefined;
    
    // First apply input labels from master data
    const ductWithLabels = applyInputLabelsFromMasterData(baseDuct, masterData);
    
    // Then apply dynamic dropdowns
    return applyDynamicDropdowns(ductWithLabels, masterData);
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
    setShowProofOfMethod(false);
    setShowFunctionViewer(false);
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
      mode: calculationMode,
    };

    // Convert raw inputs to standard units and store
    const convertedInputs: CalcInputs = {};
    selectedDuct.inputs.forEach((field) => {
      const rawValue = rawInputs[field.label];
      if (rawValue !== undefined && rawValue !== "") {
        const numValue = Number(rawValue);
        convertedInputs[field.entryKey] = UnitConverter.inputToStandard(
          field.label,
          numValue
        );
      }
    });
    setCalcInputs(convertedInputs);

    const result = runDuctCalculation(rawInputs, ctx);

    if (result.errors) {
      setErrors(result.errors);
      setResults(null);
      setShowProofOfMethod(false);
    } else {
      setErrors([]);
      setResults(result.outputs ?? null);
    }
  };

  const scrollToProof = () => {
    setShowProofOfMethod(true);
    setTimeout(() => proofPanelRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const scrollToCalculator = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setShowProofOfMethod(false), 500);
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
              <Card className="h-fit bg-input-section border-input-section">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-input-section-foreground">Input Parameters ({selectedDuct?.id || "N/A"})</CardTitle>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="calc-mode" className="text-xs text-input-section-foreground/70">
                        {calculationMode === "legacy" ? "Legacy" : "Interpolated"}
                      </Label>
                      <Switch
                        id="calc-mode"
                        checked={calculationMode === "interpolated"}
                        onCheckedChange={(checked) => setCalculationMode(checked ? "interpolated" : "legacy")}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-input-section-foreground">
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
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleCalculate} className="flex-1">
                      Calculate
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowFunctionViewer(!showFunctionViewer);
                        setTimeout(() => {
                          functionViewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 100);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      {showFunctionViewer ? "Hide" : "View"} Function Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Output Results */}
              <Card className="h-fit bg-output-section border-output-section">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-output-section-foreground">Output</CardTitle>
                </CardHeader>
                <CardContent className="text-output-section-foreground">
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
                <CardContent className="flex flex-col items-center justify-center h-[calc(100%-4rem)] gap-4">
                  <p className="text-muted-foreground text-sm">Duct diagram will be displayed here</p>
                  {results && (
                    <Button variant="outline" onClick={scrollToProof}>
                      Show Calculation Details
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Duct Function Viewer - Below Main Content */}
      {showFunctionViewer && selectedDuct && (
        <div ref={functionViewerRef} className="container mx-auto px-6 py-8">
          <DuctFunctionViewer
            ductId={selectedDuctId}
            masterData={masterData}
            calculationMode={calculationMode}
            onClose={() => setShowFunctionViewer(false)}
          />
        </div>
      )}

      {/* Proof of Method Panel - Below Main Content */}
      {showProofOfMethod && results && selectedDuct && ductRegistry[selectedDuctId] && (
        <div ref={proofPanelRef} className="container mx-auto px-6 py-8">
          <ProofOfMethodPanel
            ductId={selectedDuctId}
            inputs={calcInputs}
            masterData={masterData}
            results={results}
            calculationMode={calculationMode}
            unitSystem={unitSystem}
            registration={ductRegistry[selectedDuctId]}
          />
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={scrollToCalculator}>
              Return to Calculator
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DPLCalculator;
