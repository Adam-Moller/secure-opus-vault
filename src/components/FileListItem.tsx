import { FileKey, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FileRegistryEntry } from "@/utils/fileRegistry";
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
      return "Unknown";
    }
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileKey className="w-8 h-8 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{file.fileName}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{file.opportunityCount} opportunities</p>
                <p>Last opened: {formatDate(file.lastOpened)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={() => onOpen(file.fileName)} size="sm">
              Open
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
