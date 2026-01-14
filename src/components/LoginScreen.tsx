import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lock, FileKey, Upload, Plus, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  uploadEncryptedFile,
  loadFromIndexedDB,
  saveToIndexedDB,
} from "@/utils/fileStorage";
import type { EncryptedData } from "@/types/opportunity";
import type { CRMType } from "@/types/crmData";
import { verifyRegistryIntegrity, syncRegistryWithIndexedDB, removeFileFromRegistry, type VerifiedFileEntry } from "@/utils/fileRegistry";
import { FileListItem } from "@/components/FileListItem";
import { deleteFromIndexedDB } from "@/utils/indexedDB";

interface LoginScreenProps {
  onLogin: (data: EncryptedData, password: string, fileHandle?: FileSystemFileHandle) => void;
  onCreateNew: (password: string, fileName: string, crmType: CRMType) => void;
}

export const LoginScreen = ({ onLogin, onCreateNew }: LoginScreenProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedFiles, setVerifiedFiles] = useState<VerifiedFileEntry[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [crmType, setCrmType] = useState<CRMType>("sales");
  const { toast } = useToast();

  // Carrega e verifica arquivos na inicialização
  useEffect(() => {
    const loadAndVerifyFiles = async () => {
      setIsVerifying(true);
      try {
        // Sincroniza registry com IndexedDB (adiciona arquivos órfãos)
        await syncRegistryWithIndexedDB();
        
        // Verifica integridade de todos os arquivos
        const verified = await verifyRegistryIntegrity();
        setVerifiedFiles(verified);
      } catch (error) {
        console.error("[LoginScreen] Error verifying files:", error);
      } finally {
        setIsVerifying(false);
      }
    };
    
    loadAndVerifyFiles();
  }, []);

  const refreshFileList = async () => {
    const verified = await verifyRegistryIntegrity();
    setVerifiedFiles(verified);
  };

  const handleQuickOpen = (fileName: string) => {
    setSelectedFileName(fileName);
    setShowPasswordDialog(true);
  };

  const handleImportForFile = (fileName: string) => {
    setSelectedFileName(fileName);
    setShowImportDialog(true);
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
      console.log("[LoginScreen] Loading file:", selectedFileName);
      const data = await loadFromIndexedDB(selectedFileName, password);
      console.log("[LoginScreen] File loaded successfully:", {
        fileName: data.fileName,
        crmType: data.crmType,
        dataType: typeof data.data,
        isArray: Array.isArray(data.data)
      });
      onLogin(data, password);
    } catch (error: any) {
      console.error("[LoginScreen] Error loading file:", error);
      toast({
        title: "Erro ao Abrir Arquivo",
        description: error.message || "Falha ao descriptografar arquivo. Verifique sua senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowPasswordDialog(false);
      setPassword("");
      setSelectedFileName("");
    }
  };

  const handleImportSubmit = async () => {
    if (!password.trim()) {
      toast({
        title: "Senha Necessária",
        description: "Por favor, insira a senha do arquivo de backup",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Importa arquivo e salva no IndexedDB
      const data = await uploadEncryptedFile(password);
      await saveToIndexedDB(data, password);
      console.log("[LoginScreen] Backup imported and saved to IndexedDB:", data.fileName);
      
      // Atualiza a lista de arquivos verificados
      await refreshFileList();
      
      toast({
        title: "Backup Importado",
        description: `${data.fileName} restaurado com sucesso`,
      });
      
      // Fecha dialog e faz login
      setShowImportDialog(false);
      setSelectedFileName("");
      const pwd = password;
      setPassword("");
      onLogin(data, pwd);
    } catch (error: any) {
      toast({
        title: "Erro ao Importar",
        description: error.message || "Falha ao importar backup",
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
      await refreshFileList();
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4 overflow-y-auto pb-safe">
        <Card className="w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
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
            {isVerifying ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Verificando arquivos...</p>
              </div>
            ) : verifiedFiles.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Seus Arquivos CRM</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {verifiedFiles.map((file) => (
                    <FileListItem
                      key={file.fileName}
                      file={file}
                      onOpen={handleQuickOpen}
                      onDelete={handleDeleteFile}
                      onImport={handleImportForFile}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {verifiedFiles.length > 0 && (
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
            </div>

            {/* Seção de Restaurar Backup - separada e secundária */}
            <div className="pt-4 border-t">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Restaurar Backup
                </h4>
                <p className="text-xs text-muted-foreground">
                  Importe um arquivo .enc salvo anteriormente para restaurar seus dados
                </p>
                <Button
                  onClick={() => setShowImportDialog(true)}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Arquivo .enc
                </Button>
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>✓ 100% Offline - Sem nuvem, sem rastreamento</p>
              <p>✓ Criptografia de nível militar (AES-256)</p>
              <p>✓ Seus dados permanecem no seu dispositivo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Dialog for Opening File */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        setShowPasswordDialog(open);
        if (!open) {
          setSelectedFileName("");
          setPassword("");
        }
      }}>
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

      {/* Import Backup Dialog */}
      <Dialog open={showImportDialog} onOpenChange={(open) => {
        setShowImportDialog(open);
        if (!open) {
          setSelectedFileName("");
          setPassword("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Backup</DialogTitle>
            <DialogDescription>
              {selectedFileName 
                ? `Selecione o arquivo de backup para "${selectedFileName}"`
                : "Selecione um arquivo .enc e insira a senha para restaurar"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha do Backup
              </Label>
              <Input
                id="import-password"
                type="password"
                placeholder="Insira a senha do arquivo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleImportSubmit()}
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
              setShowImportDialog(false);
              setSelectedFileName("");
              setPassword("");
            }}>
              Cancelar
            </Button>
            <Button onClick={handleImportSubmit} disabled={isLoading}>
              <Upload className="w-4 h-4 mr-2" />
              Selecionar e Importar
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