import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Popular icons for badges with Portuguese labels
const popularIcons = [
  { name: "Star", label: "Estrela" },
  { name: "Award", label: "Prêmio" },
  { name: "Trophy", label: "Troféu" },
  { name: "Medal", label: "Medalha" },
  { name: "Target", label: "Alvo" },
  { name: "Heart", label: "Coração" },
  { name: "ThumbsUp", label: "Joinha" },
  { name: "Flame", label: "Chama" },
  { name: "Rocket", label: "Foguete" },
  { name: "Crown", label: "Coroa" },
  { name: "Gem", label: "Diamante" },
  { name: "Shield", label: "Escudo" },
  { name: "CheckCircle", label: "Check" },
  { name: "BadgeCheck", label: "Verificado" },
  { name: "GraduationCap", label: "Formatura" },
  { name: "Briefcase", label: "Maleta" },
  { name: "TrendingUp", label: "Crescimento" },
  { name: "DollarSign", label: "Dinheiro" },
  { name: "Gift", label: "Presente" },
  { name: "Sparkles", label: "Brilho" },
  { name: "Zap", label: "Raio" },
  { name: "Users", label: "Equipe" },
  { name: "UserCheck", label: "Usuário OK" },
  { name: "Flag", label: "Bandeira" },
  { name: "Smile", label: "Sorriso" },
  { name: "Coffee", label: "Café" },
  { name: "Sun", label: "Sol" },
  { name: "PartyPopper", label: "Festa" },
  { name: "Music", label: "Música" },
  { name: "Camera", label: "Câmera" },
];

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

export function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  const getIcon = (iconName: string): LucideIcon | null => {
    const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[iconName];
    if (IconComponent && typeof IconComponent === 'function') {
      return IconComponent;
    }
    return null;
  };

  const SelectedIconComponent = getIcon(selectedIcon);
  const selectedLabel = popularIcons.find(i => i.name === selectedIcon)?.label || selectedIcon;

  return (
    <div className="space-y-2">
      <Select value={selectedIcon} onValueChange={onSelectIcon}>
        <SelectTrigger className="w-full h-12">
          <SelectValue>
            <div className="flex items-center gap-3">
              {SelectedIconComponent && (
                <SelectedIconComponent className="w-5 h-5 text-primary" />
              )}
              <span>{selectedLabel}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-background border shadow-lg z-50">
          {popularIcons.map(({ name, label }) => {
            const IconComponent = getIcon(name);
            return (
              <SelectItem key={name} value={name}>
                <div className="flex items-center gap-3">
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                  <span>{label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
