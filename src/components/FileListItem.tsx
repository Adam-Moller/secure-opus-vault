import { FileKey, Trash2, Briefcase, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FileRegistryEntry } from "@/utils/fileRegistry";
import { getItemCountLabel } from "@/utils/fileRegistry";
import { formatDistanceToNow } from "date-fns";

interface FileListItemProps {
  file: FileRegistryEntry;
  onOpen: (fileName: string) => void;
  onDelete: (fileName: string) => void;
}

export const FileListItem = ({ file, onOpen, onDelete }: FileListItemProps) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Desconhecido";
    }
  };

  const IconComponent = file.crmType === "workforce" ? Store : Briefcase;
  const crmTypeLabel = file.crmType === "workforce" ? "Gestão" : "Vendas";

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <IconComponent className="w-8 h-8 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">{file.fileName}</h3>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {crmTypeLabel}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{getItemCountLabel(file)}</p>
                <p>Última abertura: {formatDate(file.lastOpened)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={() => onOpen(file.fileName)} size="sm">
              Abrir
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file.fileName);
              }}
              size="sm"
              variant="ghost"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
