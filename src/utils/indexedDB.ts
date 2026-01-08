const DB_NAME = "SecureCRM";
const DB_VERSION = 2; // Incrementado para suportar nova estrutura
const STORE_NAME = "crm-files";
const REPO_STORE_NAME = "repositories";

export function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("[IndexedDB] Error opening database:", request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      console.log("[IndexedDB] Database opened successfully");
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store antigo para compatibilidade
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
        console.log("[IndexedDB] Created legacy store:", STORE_NAME);
      }
      
      // Novo store para repositórios com namespace
      if (!db.objectStoreNames.contains(REPO_STORE_NAME)) {
        db.createObjectStore(REPO_STORE_NAME);
        console.log("[IndexedDB] Created repositories store:", REPO_STORE_NAME);
      }
    };
  });
}

// ============= FUNÇÕES LEGADAS (mantidas para compatibilidade) =============

export async function saveToIndexedDB(
  fileName: string,
  encryptedData: string
): Promise<void> {
  console.log("[IndexedDB] Saving to legacy store:", fileName, "Data length:", encryptedData.length);
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(encryptedData, fileName);

    request.onsuccess = () => {
      console.log("[IndexedDB] Successfully saved:", fileName);
      resolve();
    };
    request.onerror = () => {
      console.error("[IndexedDB] Error saving:", fileName, request.error);
      reject(request.error);
    };
  });
}

export async function loadFromIndexedDB(fileName: string): Promise<string | null> {
  console.log("[IndexedDB] Loading from legacy store:", fileName);
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(fileName);

    request.onsuccess = () => {
      const result = request.result || null;
      console.log("[IndexedDB] Load result for", fileName, ":", result ? `Found (${result.length} chars)` : "Not found");
      resolve(result);
    };
    request.onerror = () => {
      console.error("[IndexedDB] Error loading:", fileName, request.error);
      reject(request.error);
    };
  });
}

export async function getAllFilesFromIndexedDB(): Promise<string[]> {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onsuccess = () => {
      console.log("[IndexedDB] All files:", request.result);
      resolve(request.result as string[]);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFromIndexedDB(fileName: string): Promise<void> {
  console.log("[IndexedDB] Deleting:", fileName);
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(fileName);

    request.onsuccess = () => {
      console.log("[IndexedDB] Successfully deleted:", fileName);
      resolve();
    };
    request.onerror = () => {
      console.error("[IndexedDB] Error deleting:", fileName, request.error);
      reject(request.error);
    };
  });
}

// ============= FUNÇÕES PARA REPOSITÓRIOS =============

/**
 * Gera uma chave de repositório no formato: {repositoryName}:{dataKey}
 */
function getRepositoryKey(repositoryName: string, dataKey: string): string {
  return `${repositoryName}:${dataKey}`;
}

/**
 * Salva dados em um repositório específico
 */
export async function saveRepositoryData(
  repositoryName: string,
  dataKey: string,
  encryptedData: string
): Promise<void> {
  const key = getRepositoryKey(repositoryName, dataKey);
  console.log("[IndexedDB] Saving repository data:", key, "Data length:", encryptedData.length);
  
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REPO_STORE_NAME], "readwrite");
    const store = transaction.objectStore(REPO_STORE_NAME);
    const request = store.put(encryptedData, key);

    request.onsuccess = () => {
      console.log("[IndexedDB] Successfully saved repository data:", key);
      resolve();
    };
    request.onerror = () => {
      console.error("[IndexedDB] Error saving repository data:", key, request.error);
      reject(request.error);
    };
  });
}

/**
 * Carrega dados de um repositório específico
 */
export async function loadRepositoryData(
  repositoryName: string,
  dataKey: string
): Promise<string | null> {
  const key = getRepositoryKey(repositoryName, dataKey);
  console.log("[IndexedDB] Loading repository data:", key);
  
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REPO_STORE_NAME], "readonly");
    const store = transaction.objectStore(REPO_STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      const result = request.result || null;
      console.log("[IndexedDB] Repository load result for", key, ":", result ? `Found (${result.length} chars)` : "Not found");
      resolve(result);
    };
    request.onerror = () => {
      console.error("[IndexedDB] Error loading repository data:", key, request.error);
      reject(request.error);
    };
  });
}

/**
 * Lista todos os repositórios salvos
 */
export async function getAllRepositories(): Promise<string[]> {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REPO_STORE_NAME], "readonly");
    const store = transaction.objectStore(REPO_STORE_NAME);
    const request = store.getAllKeys();

    request.onsuccess = () => {
      const keys = request.result as string[];
      // Extrai nomes únicos de repositórios
      const repositories = [...new Set(keys.map(k => k.split(':')[0]))];
      console.log("[IndexedDB] All repositories:", repositories);
      resolve(repositories);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Deleta todos os dados de um repositório
 */
export async function deleteRepository(repositoryName: string): Promise<void> {
  console.log("[IndexedDB] Deleting repository:", repositoryName);
  
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REPO_STORE_NAME], "readwrite");
    const store = transaction.objectStore(REPO_STORE_NAME);
    
    // Busca todas as chaves que começam com o nome do repositório
    const request = store.getAllKeys();
    
    request.onsuccess = () => {
      const keys = (request.result as string[]).filter(k => k.startsWith(`${repositoryName}:`));
      console.log("[IndexedDB] Deleting keys:", keys);
      
      let deleted = 0;
      if (keys.length === 0) {
        resolve();
        return;
      }
      
      keys.forEach(key => {
        const deleteRequest = store.delete(key);
        deleteRequest.onsuccess = () => {
          deleted++;
          if (deleted === keys.length) {
            console.log("[IndexedDB] Repository deleted:", repositoryName);
            resolve();
          }
        };
        deleteRequest.onerror = () => {
          console.error("[IndexedDB] Error deleting key:", key);
          reject(deleteRequest.error);
        };
      });
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Verifica se um arquivo existe no IndexedDB (legacy ou repositories)
 */
export async function fileExistsInIndexedDB(fileName: string): Promise<boolean> {
  // Verifica no store legado
  const legacyData = await loadFromIndexedDB(fileName);
  if (legacyData) return true;
  
  // Verifica no store de repositórios
  const repoData = await loadRepositoryData(fileName, "data");
  return repoData !== null;
}

/**
 * Sincroniza verificando integridade dos dados
 */
export async function verifyDataIntegrity(fileName: string): Promise<{
  exists: boolean;
  location: "legacy" | "repository" | "none";
  dataLength: number;
}> {
  // Verifica store legado
  const legacyData = await loadFromIndexedDB(fileName);
  if (legacyData) {
    return { exists: true, location: "legacy", dataLength: legacyData.length };
  }
  
  // Verifica store de repositórios
  const repoData = await loadRepositoryData(fileName, "data");
  if (repoData) {
    return { exists: true, location: "repository", dataLength: repoData.length };
  }
  
  return { exists: false, location: "none", dataLength: 0 };
}
