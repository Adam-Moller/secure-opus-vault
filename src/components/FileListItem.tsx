import { Trash2, Briefcase, Store, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VerifiedFileEntry } from "@/utils/fileRegistry";
import { getItemCountLabel } from "@/utils/fileRegistry";
import { formatDistanceToNow } from "date-fns";

interface FileListItemProps {
  file: VerifiedFileEntry;
  onOpen: (fileName: string) => void;
  onDelete: (fileName: string) => void;
  onImport: (fileName: string) => void;
}

export const FileListItem = ({ file, onOpen, onDelete, onImport }: FileListItemProps) => {
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
    <Card className={`hover:bg-accent/50 transition-colors ${!file.hasData ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <IconComponent className={`w-8 h-8 shrink-0 ${file.hasData ? 'text-primary' : 'text-yellow-500'}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">{file.fileName}</h3>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {crmTypeLabel}
                </Badge>
                {!file.hasData && (
                  <Badge variant="outline" className="text-xs shrink-0 border-yellow-500 text-yellow-600 bg-yellow-50">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Backup necessário
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                {file.hasData ? (
                  <>
                    <p>{getItemCountLabel(file)}</p>
                    <p>Última abertura: {formatDate(file.lastOpened)}</p>
                  </>
                ) : (
                  <p className="text-yellow-600">Dados não encontrados - importe um backup</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {file.hasData ? (
              <Button onClick={() => onOpen(file.fileName)} size="sm">
                Abrir
              </Button>
            ) : (
              <Button onClick={() => onImport(file.fileName)} size="sm" variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                Importar
              </Button>
            )}
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
