import type { CRMType } from "@/types/crmData";

export interface FileRegistryEntry {
  fileName: string;
  lastModified: string;
  lastOpened: string;
  crmType: CRMType;
  itemCount: number; // opportunities for sales, stores for workforce
  // Legacy field for backwards compatibility
  opportunityCount?: number;
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
