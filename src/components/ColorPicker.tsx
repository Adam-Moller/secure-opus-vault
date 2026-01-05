import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Predefined color palette for badges
const colorPalette = [
  { name: "Ouro", hex: "#FFD700" },
  { name: "Prata", hex: "#C0C0C0" },
  { name: "Bronze", hex: "#CD7F32" },
  { name: "Vermelho", hex: "#FF6B6B" },
  { name: "Teal", hex: "#4ECDC4" },
  { name: "Azul Céu", hex: "#45B7D1" },
  { name: "Verde Menta", hex: "#96CEB4" },
  { name: "Amarelo", hex: "#FFEAA7" },
  { name: "Lilás", hex: "#DDA0DD" },
  { name: "Verde Água", hex: "#98D8C8" },
  { name: "Mostarda", hex: "#F7DC6F" },
  { name: "Roxo", hex: "#BB8FCE" },
  { name: "Azul Claro", hex: "#85C1E9" },
  { name: "Laranja", hex: "#F8B500" },
  { name: "Esmeralda", hex: "#2ECC71" },
  { name: "Vermelho Forte", hex: "#E74C3C" },
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(selectedColor || "#FFD700");

  const handleCustomColorChange = (value: string) => {
    setCustomColor(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onSelectColor(value);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
          style={{ backgroundColor: selectedColor || "#FFD700" }}
        />
        <div className="flex-1">
          <p className="text-sm font-medium">Cor selecionada</p>
          <p className="text-xs text-muted-foreground uppercase">{selectedColor || "#FFD700"}</p>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {colorPalette.map((color) => {
          const isSelected = selectedColor === color.hex;
          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => onSelectColor(color.hex)}
              className={`
                w-8 h-8 rounded-full transition-all duration-200 hover:scale-110
                ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-border'}
              `}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="custom-color" className="text-xs whitespace-nowrap">
          Cor personalizada:
        </Label>
        <div className="flex items-center gap-2 flex-1">
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              onSelectColor(e.target.value);
            }}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          <Input
            id="custom-color"
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            placeholder="#RRGGBB"
            className="flex-1 font-mono text-xs uppercase"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  );
}
