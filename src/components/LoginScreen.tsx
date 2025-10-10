import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, FileKey, Upload, FolderOpen, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  isFileSystemSupported,
  loadFromFileSystem,
  uploadEncryptedFile,
  loadFromIndexedDB,
} from "@/utils/fileStorage";
import type { EncryptedData } from "@/types/opportunity";
import { getFileRegistry, removeFileFromRegistry } from "@/utils/fileRegistry";
import { FileListItem } from "@/components/FileListItem";
import { deleteFromIndexedDB } from "@/utils/indexedDB";

interface LoginScreenProps {
  onLogin: (data: EncryptedData, password: string, fileHandle?: FileSystemFileHandle) => void;
  onCreateNew: (password: string, fileName: string) => void;
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
        title: "Password Required",
        description: "Please enter your password",
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
        title: "Error Opening File",
        description: error.message || "Failed to decrypt file. Check your password.",
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
        title: "Password Required",
        description: "Please enter your master password",
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
        title: "Error Loading File",
        description: error.message || "Failed to load and decrypt file",
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
        title: "File Name Required",
        description: "Please enter a name for your CRM file",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword.trim()) {
      toast({
        title: "Password Required",
        description: "Please create a master password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    const sanitizedFileName = newFileName.trim().replace(/[^a-zA-Z0-9-_\s]/g, "");
    onCreateNew(newPassword, sanitizedFileName);
    setShowCreateDialog(false);
    setNewFileName("");
    setNewPassword("");
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Delete "${fileName}" from your file list? This will remove it from local storage.`)) {
      return;
    }

    try {
      await deleteFromIndexedDB(fileName);
      removeFileFromRegistry(fileName);
      setFileRegistry(getFileRegistry());
      toast({
        title: "File Removed",
        description: "File has been deleted from local storage",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
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
            <CardTitle className="text-2xl">Secure CRM</CardTitle>
            <CardDescription>
              Your offline, encrypted opportunity manager
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fileRegistry.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Your CRM Files</h3>
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
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
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
                Create New CRM File
              </Button>

              <Button
                onClick={() => setShowPasswordDialog(true)}
                className="w-full"
                variant="outline"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                {supportsFileSystem ? "Open from File System" : "Upload from Device"}
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>✓ 100% Offline - No cloud, no tracking</p>
              <p>✓ Military-grade encryption (AES-256)</p>
              <p>✓ Your data stays on your device</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Dialog for Quick Open */}
      <Dialog open={showPasswordDialog && !selectedFileName} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open File from {supportsFileSystem ? "File System" : "Device"}</DialogTitle>
            <DialogDescription>
              Enter your master password to decrypt the file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fs-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="fs-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLoadFromFileSystem()}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLoadFromFileSystem} disabled={isLoading}>
              <Upload className="w-4 h-4 mr-2" />
              Open File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog for Registry File */}
      <Dialog open={showPasswordDialog && !!selectedFileName} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open {selectedFileName}</DialogTitle>
            <DialogDescription>
              Enter your password to decrypt this file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quick-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="quick-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
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
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={isLoading}>
              Open
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New File Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New CRM File</DialogTitle>
            <DialogDescription>
              Choose a name for your CRM file and set a master password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-filename">
                File Name
              </Label>
              <Input
                id="new-filename"
                placeholder="e.g., Schools-CRM, Startups-CRM"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Letters, numbers, hyphens, and underscores only
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Master Password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="At least 8 characters"
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
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit}>
              Create File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
