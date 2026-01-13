import type { CRMType } from "@/types/crmData";
import { fileExistsInIndexedDB, getAllFilesFromIndexedDB } from "@/utils/indexedDB";

export interface FileRegistryEntry {
  fileName: string;
  lastModified: string;
  lastOpened: string;
  crmType: CRMType;
  itemCount: number; // opportunities for sales, stores for workforce
  // Legacy field for backwards compatibility
  opportunityCount?: number;
}

export interface VerifiedFileEntry extends FileRegistryEntry {
  hasData: boolean;
}

const REGISTRY_KEY = "crm-file-registry";

// Migrate old registry entries to new format
function migrateRegistryEntry(entry: any): FileRegistryEntry {
  return {
    fileName: entry.fileName,
    lastModified: entry.lastModified,
    lastOpened: entry.lastOpened,
    crmType: entry.crmType || "sales", // Default to sales for old entries
    itemCount: entry.itemCount ?? entry.opportunityCount ?? 0,
  };
}

export function getFileRegistry(): FileRegistryEntry[] {
  try {
    const stored = localStorage.getItem(REGISTRY_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Migrate old entries to new format
    return parsed.map(migrateRegistryEntry);
  } catch (error) {
    console.error("Error reading file registry:", error);
    return [];
  }
}

export function addFileToRegistry(entry: FileRegistryEntry): void {
  try {
    const registry = getFileRegistry();
    const existingIndex = registry.findIndex((e) => e.fileName === entry.fileName);
    
    // Ensure entry has required fields
    const normalizedEntry: FileRegistryEntry = {
      fileName: entry.fileName,
      lastModified: entry.lastModified,
      lastOpened: entry.lastOpened,
      crmType: entry.crmType || "sales",
      itemCount: entry.itemCount ?? 0,
    };
    
    if (existingIndex >= 0) {
      registry[existingIndex] = normalizedEntry;
    } else {
      registry.push(normalizedEntry);
    }
    
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch (error) {
    console.error("Error adding to file registry:", error);
  }
}

export function updateFileInRegistry(
  fileName: string,
  updates: Partial<FileRegistryEntry>
): void {
  try {
    const registry = getFileRegistry();
    const index = registry.findIndex((e) => e.fileName === fileName);
    
    if (index >= 0) {
      registry[index] = { ...registry[index], ...updates };
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    }
  } catch (error) {
    console.error("Error updating file registry:", error);
  }
}

export function removeFileFromRegistry(fileName: string): void {
  try {
    const registry = getFileRegistry();
    const filtered = registry.filter((e) => e.fileName !== fileName);
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing from file registry:", error);
  }
}

export function getRegistryEntriesByCRMType(crmType: CRMType): FileRegistryEntry[] {
  return getFileRegistry().filter((e) => e.crmType === crmType);
}

export function getItemCountLabel(entry: FileRegistryEntry): string {
  if (entry.crmType === "workforce") {
    return `${entry.itemCount} loja${entry.itemCount !== 1 ? "s" : ""}`;
  }
  return `${entry.itemCount} oportunidade${entry.itemCount !== 1 ? "s" : ""}`;
}

/**
 * Verifica a integridade de todos os arquivos no Registry
 * Retorna lista com status de cada arquivo (se os dados existem no IndexedDB)
 */
export async function verifyRegistryIntegrity(): Promise<VerifiedFileEntry[]> {
  const registry = getFileRegistry();
  
  const verified = await Promise.all(
    registry.map(async (file) => {
      const hasData = await fileExistsInIndexedDB(file.fileName);
      return {
        ...file,
        hasData,
      };
    })
  );
  
  console.log("[FileRegistry] Verified integrity:", verified.map(f => ({ name: f.fileName, hasData: f.hasData })));
  return verified;
}

/**
 * Sincroniza o Registry com o IndexedDB
 * - Adiciona arquivos que existem no IndexedDB mas não no Registry
 * - Marca arquivos órfãos (no Registry mas não no IndexedDB)
 */
export async function syncRegistryWithIndexedDB(): Promise<{
  added: string[];
  orphaned: string[];
}> {
  const registry = getFileRegistry();
  const indexedDBFiles = await getAllFilesFromIndexedDB();
  
  const registryNames = new Set(registry.map(r => r.fileName));
  const indexedDBNames = new Set(indexedDBFiles);
  
  // Arquivos no IndexedDB que não estão no Registry
  const added: string[] = [];
  for (const fileName of indexedDBFiles) {
    if (!registryNames.has(fileName)) {
      // Adiciona ao registry com valores padrão
      addFileToRegistry({
        fileName,
        lastModified: new Date().toISOString(),
        lastOpened: new Date().toISOString(),
        crmType: "sales", // Padrão, será atualizado ao abrir
        itemCount: 0,
      });
      added.push(fileName);
    }
  }
  
  // Arquivos no Registry que não estão no IndexedDB
  const orphaned = registry
    .filter(r => !indexedDBNames.has(r.fileName))
    .map(r => r.fileName);
  
  console.log("[FileRegistry] Sync result:", { added, orphaned });
  return { added, orphaned };
}
