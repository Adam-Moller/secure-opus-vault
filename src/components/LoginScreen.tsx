import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, FileKey, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isFileSystemSupported, loadFromFileSystem, uploadEncryptedFile } from "@/utils/fileStorage";
import type { EncryptedData } from "@/types/opportunity";

interface LoginScreenProps {
  onLogin: (data: EncryptedData, password: string, fileHandle?: FileSystemFileHandle) => void;
  onCreateNew: (password: string) => void;
}

export const LoginScreen = ({ onLogin, onCreateNew }: LoginScreenProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supportsFileSystem = isFileSystemSupported();

  const handleLoadExisting = async () => {
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
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please create a master password",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    onCreateNew(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
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
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Master Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLoadExisting()}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              All data is encrypted with your password. Keep it safe!
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleLoadExisting}
              disabled={isLoading}
              className="w-full"
              variant="default"
            >
              {supportsFileSystem ? (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Open Existing File
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Existing File
                </>
              )}
            </Button>

            <Button
              onClick={handleCreateNew}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Create New CRM File
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
  );
};
