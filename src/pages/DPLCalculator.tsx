import { useState } from "react";
import { ductDefinitions } from "@/dpl/ductDefinitions";
import { constraintsByDuct } from "@/dpl/constraints";
import { masterData } from "@/dpl/mockMasterData";
import { ductRegistry } from "@/dpl/registry";
import { runDuctCalculation } from "@/dpl/calcEngine";
import { UnitConverter } from "@/dpl/unitConverter";
import { UnitSystem, CalcOutputs, DuctDefinition } from "@/dpl/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DPLCalculator = () => {
  const [selectedDuctId, setSelectedDuctId] = useState<string>("A7A");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<CalcOutputs | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const selectedDuct = ductDefinitions.find((d) => d.id === selectedDuctId);

  const handleDuctChange = (newDuctId: string) => {
    setSelectedDuctId(newDuctId);
    setRawInputs({});
    setResults(null);
    setErrors([]);
  };

  const handleUnitSystemChange = (newSystem: UnitSystem) => {
    setUnitSystem(newSystem);
    setRawInputs({});
    setResults(null);
    setErrors([]);
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Duct Pressure Loss Calculator
          </h1>
          <p className="text-muted-foreground">
            Internal engineering tool for HVAC duct pressure loss calculations
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Controls Card */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Select duct fitting and unit system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Duct Fitting</Label>
                <Select value={selectedDuctId} onValueChange={handleDuctChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ductDefinitions.map((duct) => (
                      <SelectItem key={duct.id} value={duct.id}>
                        {duct.id} - {duct.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Unit System</Label>
                <Select
                  value={unitSystem}
                  onValueChange={(val) => handleUnitSystemChange(val as UnitSystem)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imperial">Imperial (in, cfm, ft/min)</SelectItem>
                    <SelectItem value="metric">Metric (mm, m³/h, m/s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inputs Card */}
          <Card>
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>
                {selectedDuct?.name || "Select a duct fitting"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDuct?.inputs.map((field) => (
                <div key={field.entryKey} className="space-y-2">
                  <Label htmlFor={field.entryKey}>
                    {getDisplayLabel(field.label)}
                  </Label>
                  {field.type === "number" && (
                    <Input
                      id={field.entryKey}
                      type="number"
                      step="any"
                      value={rawInputs[field.label] ?? ""}
                      onChange={(e) => handleInputChange(field.label, e.target.value)}
                      placeholder={field.unitHint}
                    />
                  )}
                  {field.type === "select" && field.options && (
                    <Select
                      value={rawInputs[field.label] ?? ""}
                      onValueChange={(val) => handleInputChange(field.label, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label}`} />
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

              <Button onClick={handleCalculate} className="w-full">
                Calculate
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-1">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>Calculated outputs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(results).map(([label, value]) => {
                  if (label.startsWith("_")) return null;
                  const { label: displayLabel, value: displayValue } =
                    UnitConverter.formatOutputForDisplay(label, value, unitSystem);
                  return (
                    <div
                      key={label}
                      className="rounded-lg border bg-card p-4 space-y-1"
                    >
                      <div className="text-sm text-muted-foreground">
                        {displayLabel}
                      </div>
                      <div className="text-2xl font-semibold text-foreground">
                        {displayValue}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DPLCalculator;
