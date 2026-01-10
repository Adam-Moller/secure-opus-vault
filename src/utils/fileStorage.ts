import { encryptData, decryptData } from "./encryption";
import type { EncryptedData } from "@/types/opportunity";
import {
  saveToIndexedDB as saveToIDB,
  loadFromIndexedDB as loadFromIDB,
} from "./indexedDB";

const FILE_EXTENSION = ".enc";

// Check if running on a mobile device
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if File System Access API is supported
// Returns false on mobile to prevent file picker dialogs
export const isFileSystemSupported = () => {
  // Check if we're in an iframe (Lovable preview)
  const isInIframe = window.self !== window.top;
  if (isInIframe) {
    return false;
  }
  
  // Mobile devices should always use IndexedDB
  if (isMobileDevice()) {
    console.log("[FileStorage] Mobile device detected - using IndexedDB");
    return false;
  }
  
  return "showSaveFilePicker" in window && "showOpenFilePicker" in window;
};

// Save data using File System Access API (Desktop)
export async function saveToFileSystem(
  data: EncryptedData,
  password: string,
  fileHandle?: FileSystemFileHandle
): Promise<FileSystemFileHandle> {
  console.log("[FileStorage] Saving to file system:", data.fileName);
  const jsonString = JSON.stringify(data);
  const encrypted = await encryptData(jsonString, password);

  let handle = fileHandle;

  if (!handle) {
    const suggestedName = data.fileName.endsWith(FILE_EXTENSION)
      ? data.fileName
      : `${data.fileName}${FILE_EXTENSION}`;
    
    handle = await (window as any).showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: "Encrypted CRM Data",
          accept: { "application/octet-stream": [FILE_EXTENSION] },
        },
      ],
    });
  }

  const writable = await handle.createWritable();
  await writable.write(encrypted);
  await writable.close();
  
  console.log("[FileStorage] Successfully saved to file system");
  return handle;
}

// Load data using File System Access API (Desktop)
export async function loadFromFileSystem(
  password: string,
  fileHandle?: FileSystemFileHandle
): Promise<{ data: EncryptedData; handle: FileSystemFileHandle }> {
  let handle = fileHandle;

  if (!handle) {
    const [selectedHandle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: "Encrypted CRM Data",
          accept: { "application/octet-stream": [FILE_EXTENSION] },
        },
      ],
      multiple: false,
    });
    handle = selectedHandle;
  }

  const file = await handle.getFile();
  const encrypted = await file.text();
  console.log("[FileStorage] Loading from file system, encrypted length:", encrypted.length);
  
  const decrypted = await decryptData(encrypted, password);
  const data = JSON.parse(decrypted);
  
  console.log("[FileStorage] Loaded data:", { fileName: data.fileName, crmType: data.crmType });

  return { data, handle };
}

// Save to IndexedDB (Mobile/Fallback)
export async function saveToIndexedDB(
  data: EncryptedData,
  password: string
): Promise<void> {
  console.log("[FileStorage] Saving to IndexedDB:", data.fileName);
  console.log("[FileStorage] Data structure:", {
    crmType: data.crmType,
    dataType: typeof data.data,
    isArray: Array.isArray(data.data),
    ...(data.crmType === "workforce" && !Array.isArray(data.data) && {
      stores: (data.data as any).stores?.length || 0,
      employees: (data.data as any).employees?.length || 0,
      badgeTemplates: (data.data as any).badgeTemplates?.length || 0,
    })
  });
  
  const jsonString = JSON.stringify(data);
  console.log("[FileStorage] JSON string length:", jsonString.length);
  
  const encrypted = await encryptData(jsonString, password);
  console.log("[FileStorage] Encrypted length:", encrypted.length);
  
  await saveToIDB(data.fileName, encrypted);
  console.log("[FileStorage] Successfully saved to IndexedDB");
}

// Load from IndexedDB (Mobile/Fallback)
export async function loadFromIndexedDB(
  fileName: string,
  password: string
): Promise<EncryptedData> {
  console.log("[FileStorage] Loading from IndexedDB:", fileName);
  
  const encrypted = await loadFromIDB(fileName);
  if (!encrypted) {
    console.error("[FileStorage] File not found in IndexedDB:", fileName);
    throw new Error("Arquivo não encontrado no armazenamento local");
  }
  
  console.log("[FileStorage] Found encrypted data, length:", encrypted.length);
  
  const decrypted = await decryptData(encrypted, password);
  console.log("[FileStorage] Decrypted data length:", decrypted.length);
  
  const data = JSON.parse(decrypted) as EncryptedData;
  
  console.log("[FileStorage] Parsed data:", {
    fileName: data.fileName,
    crmType: data.crmType,
    dataType: typeof data.data,
    isArray: Array.isArray(data.data),
    ...(data.crmType === "workforce" && !Array.isArray(data.data) && {
      stores: (data.data as any).stores?.length || 0,
      employees: (data.data as any).employees?.length || 0,
      badgeTemplates: (data.data as any).badgeTemplates?.length || 0,
    })
  });
  
  return data;
}

// Download encrypted file (Export/Backup)
export async function downloadEncryptedFile(data: EncryptedData, password: string) {
  console.log("[FileStorage] Downloading encrypted file:", data.fileName);
  
  const jsonString = JSON.stringify(data);
  const encrypted = await encryptData(jsonString, password);

  const fileName = data.fileName.endsWith(FILE_EXTENSION)
    ? data.fileName
    : `${data.fileName}${FILE_EXTENSION}`;

  const blob = new Blob([encrypted], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log("[FileStorage] Download initiated");
}

// Upload encrypted file (Mobile/Fallback)
export async function uploadEncryptedFile(password: string): Promise<EncryptedData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = FILE_EXTENSION;

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("Nenhum arquivo selecionado"));
        return;
      }

      try {
        console.log("[FileStorage] Uploading file:", file.name);
        const encrypted = await file.text();
        console.log("[FileStorage] Encrypted content length:", encrypted.length);
        
        const decrypted = await decryptData(encrypted, password);
        const data = JSON.parse(decrypted);
        
        console.log("[FileStorage] Upload parsed:", { fileName: data.fileName, crmType: data.crmType });
        resolve(data);
      } catch (error) {
        console.error("[FileStorage] Upload error:", error);
        reject(error);
      }
    };

    input.click();
  });
}
