import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Popular icons for badges
const popularIconNames = [
  "Star", "Award", "Trophy", "Medal", "Target", "Flag",
  "Heart", "ThumbsUp", "Smile", "Zap", "Flame", "Rocket",
  "Crown", "Gem", "Shield", "CheckCircle", "BadgeCheck",
  "GraduationCap", "Briefcase", "Users", "UserCheck",
  "CalendarCheck", "Clock", "TrendingUp", "BarChart",
  "DollarSign", "Percent", "Gift", "Package", "ShoppingBag",
  "Store", "Building", "Home", "MapPin", "Navigation",
  "Phone", "Mail", "MessageCircle", "Bell", "Bookmark",
  "Folder", "FileText", "Clipboard", "Edit", "Settings",
  "Coffee", "Sun", "Moon", "Cloud", "Umbrella",
  "Sparkles", "PartyPopper", "Cake", "Music", "Camera"
];

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

export function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return popularIconNames;
    return popularIconNames.filter(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const getIcon = (iconName: string): LucideIcon | null => {
    const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[iconName];
    if (IconComponent && typeof IconComponent === 'function') {
      return IconComponent;
    }
    return null;
  };

  const SelectedIconComponent = getIcon(selectedIcon);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg border-2 border-primary flex items-center justify-center bg-muted">
          {SelectedIconComponent ? (
            <SelectedIconComponent className="w-6 h-6 text-primary" />
          ) : (
            <span className="text-xs text-muted-foreground">?</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Ícone selecionado</p>
          <p className="text-xs text-muted-foreground">{selectedIcon || "Nenhum"}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ícone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-48 border rounded-lg p-2">
        <div className="grid grid-cols-6 gap-2">
          {filteredIcons.map((iconName) => {
            const IconComponent = getIcon(iconName);
            if (!IconComponent) return null;
            
            const isSelected = selectedIcon === iconName;
            
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => onSelectIcon(iconName)}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  transition-all duration-200 hover:scale-110
                  ${isSelected 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                    : 'bg-muted hover:bg-accent'
                  }
                `}
                title={iconName}
              >
                <IconComponent className="w-5 h-5" />
              </button>
            );
          })}
        </div>
        {filteredIcons.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Nenhum ícone encontrado
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
