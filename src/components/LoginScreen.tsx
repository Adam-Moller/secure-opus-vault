import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lock, FileKey, Upload, FolderOpen, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  isFileSystemSupported,
  loadFromFileSystem,
  uploadEncryptedFile,
  loadFromIndexedDB,
} from "@/utils/fileStorage";
import type { EncryptedData } from "@/types/opportunity";
import type { CRMType } from "@/types/crmData";
import { getFileRegistry, removeFileFromRegistry } from "@/utils/fileRegistry";
import { FileListItem } from "@/components/FileListItem";
import { deleteFromIndexedDB } from "@/utils/indexedDB";

interface LoginScreenProps {
  onLogin: (data: EncryptedData, password: string, fileHandle?: FileSystemFileHandle) => void;
  onCreateNew: (password: string, fileName: string, crmType: CRMType) => void;
}

export const LoginScreen = ({ onLogin, onCreateNew }: LoginScreenProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileRegistry, setFileRegistry] = useState(getFileRegistry());
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [crmType, setCrmType] = useState<CRMType>("sales");
  const { toast } = useToast();
  const supportsFileSystem = isFileSystemSupported();

  useEffect(() => {
    setFileRegistry(getFileRegistry());
  }, []);

  const handleQuickOpen = (fileName: string) => {
    setSelectedFileName(fileName);
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      toast({
        title: "Senha Necessária",
        description: "Por favor, insira sua senha",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await loadFromIndexedDB(selectedFileName, password);
      onLogin(data, password);
    } catch (error: any) {
      toast({
        title: "Erro ao Abrir Arquivo",
        description: error.message || "Falha ao descriptografar arquivo. Verifique sua senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowPasswordDialog(false);
      setPassword("");
    }
  };

  const handleLoadFromFileSystem = async () => {
    if (!password.trim()) {
      toast({
        title: "Senha Necessária",
        description: "Por favor, insira sua senha mestra",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (supportsFileSystem) {
        const { data, handle } = await loadFromFileSystem(password);
        onLogin(data, password, handle);
      } else {
        const data = await uploadEncryptedFile(password);
        onLogin(data, password);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao Carregar Arquivo",
        description: error.message || "Falha ao carregar e descriptografar arquivo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setShowCreateDialog(true);
  };

  const handleCreateSubmit = () => {
    if (!newFileName.trim()) {
      toast({
        title: "Nome do Arquivo Necessário",
        description: "Por favor, insira um nome para seu arquivo CRM",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword.trim()) {
      toast({
        title: "Senha Necessária",
        description: "Por favor, crie uma senha mestra",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Senha Muito Curta",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    const sanitizedFileName = newFileName.trim().replace(/[^a-zA-Z0-9-_\s]/g, "");
    onCreateNew(newPassword, sanitizedFileName, crmType);
    setShowCreateDialog(false);
    setNewFileName("");
    setNewPassword("");
    setCrmType("sales");
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Excluir "${fileName}" da sua lista de arquivos? Isso removerá do armazenamento local.`)) {
      return;
    }

    try {
      await deleteFromIndexedDB(fileName);
      removeFileFromRegistry(fileName);
      setFileRegistry(getFileRegistry());
      toast({
        title: "Arquivo Removido",
        description: "Arquivo foi excluído do armazenamento local",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir arquivo",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <FileKey className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">CRM Seguro</CardTitle>
            <CardDescription>
              Seu gerenciador de oportunidades offline e criptografado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fileRegistry.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Seus Arquivos CRM</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {fileRegistry.map((file) => (
                    <FileListItem
                      key={file.fileName}
                      file={file}
                      onOpen={handleQuickOpen}
                      onDelete={handleDeleteFile}
                    />
                  ))}
                </div>
              </div>
            )}

            {fileRegistry.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleCreateNew}
                className="w-full"
                variant="default"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Arquivo CRM
              </Button>

              <Button
                onClick={() => setShowPasswordDialog(true)}
                className="w-full"
                variant="outline"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                {supportsFileSystem ? "Abrir do Sistema de Arquivos" : "Carregar do Dispositivo"}
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>✓ 100% Offline - Sem nuvem, sem rastreamento</p>
              <p>✓ Criptografia de nível militar (AES-256)</p>
              <p>✓ Seus dados permanecem no seu dispositivo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Dialog for Quick Open */}
      <Dialog open={showPasswordDialog && !selectedFileName} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Arquivo do {supportsFileSystem ? "Sistema de Arquivos" : "Dispositivo"}</DialogTitle>
            <DialogDescription>
              Insira sua senha mestra para descriptografar o arquivo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fs-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha
              </Label>
              <Input
                id="fs-password"
                type="password"
                placeholder="Insira a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLoadFromFileSystem()}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLoadFromFileSystem} disabled={isLoading}>
              <Upload className="w-4 h-4 mr-2" />
              Abrir Arquivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog for Registry File */}
      <Dialog open={showPasswordDialog && !!selectedFileName} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir {selectedFileName}</DialogTitle>
            <DialogDescription>
              Insira sua senha para descriptografar este arquivo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quick-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha
              </Label>
              <Input
                id="quick-password"
                type="password"
                placeholder="Insira a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPasswordDialog(false);
              setSelectedFileName("");
              setPassword("");
            }}>
              Cancelar
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={isLoading}>
              Abrir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New File Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Arquivo CRM</DialogTitle>
            <DialogDescription>
              Escolha o tipo de CRM, um nome para seu arquivo e defina uma senha mestra
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Tipo de CRM</Label>
              <RadioGroup value={crmType} onValueChange={(value) => setCrmType(value as CRMType)}>
                <div className="flex items-center space-x-2 rounded-md border border-input p-3 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="sales" id="sales" />
                  <Label htmlFor="sales" className="flex-1 cursor-pointer font-normal">
                    <div className="font-semibold">CRM de Vendas</div>
                    <div className="text-xs text-muted-foreground">Gerenciar oportunidades e negociações</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border border-input p-3 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="workforce" id="workforce" />
                  <Label htmlFor="workforce" className="flex-1 cursor-pointer font-normal">
                    <div className="font-semibold">Gestão de Lojas</div>
                    <div className="text-xs text-muted-foreground">Gerenciar lojas, funcionários e visitas</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-filename">
                Nome do Arquivo
              </Label>
              <Input
                id="new-filename"
                placeholder="ex: Escolas-CRM, Startups-CRM"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Apenas letras, números, hífens e sublinhados
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha Mestra
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Pelo menos 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setNewFileName("");
              setNewPassword("");
              setCrmType("sales");
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubmit}>
              Criar Arquivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
