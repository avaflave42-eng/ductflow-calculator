import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const paletteItems = [
  { id: 'straight', label: 'Straight Duct', typeId: 'Straight' },
  { id: 'a8a', label: 'A8A — Conical Expansion', typeId: 'A8A' },
  { id: 'a11e', label: 'A11E — 90° Elbow', typeId: 'A11E' },
  { id: 'a7', label: 'A7 Series', typeId: 'A7' },
  { id: 'a10', label: 'A10 Series', typeId: 'A10' },
];

export const DuctPalette = () => {
  return (
    <div className="h-full bg-background border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Component Palette</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drag components to canvas
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-2">
          {paletteItems.map((item) => (
            <Card
              key={item.id}
              draggable={true}
              className="p-3 cursor-move hover:bg-accent transition-colors"
              onDragStart={(e) => {
                e.dataTransfer.setData('ductType', item.typeId);
              }}
            >
              <div className="text-sm font-medium">{item.label}</div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
