export interface FileRegistryEntry {
  fileName: string;
  lastModified: string;
  lastOpened: string;
  opportunityCount: number;
}

const REGISTRY_KEY = "crm-file-registry";

export function getFileRegistry(): FileRegistryEntry[] {
  try {
    const stored = localStorage.getItem(REGISTRY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading file registry:", error);
    return [];
  }
}

export function addFileToRegistry(entry: FileRegistryEntry): void {
  try {
    const registry = getFileRegistry();
    const existingIndex = registry.findIndex((e) => e.fileName === entry.fileName);
    
    if (existingIndex >= 0) {
      registry[existingIndex] = entry;
    } else {
      registry.push(entry);
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
