import { encryptData, decryptData } from "./encryption";
import type { EncryptedData } from "@/types/opportunity";
import {
  saveToIndexedDB as saveToIDB,
  loadFromIndexedDB as loadFromIDB,
} from "./indexedDB";

const FILE_EXTENSION = ".enc";

// Check if File System Access API is supported
export const isFileSystemSupported = () => {
  // Check if we're in an iframe (Lovable preview)
  const isInIframe = window.self !== window.top;
  
  // File System API doesn't work in iframes due to security
  if (isInIframe) {
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
  const decrypted = await decryptData(encrypted, password);
  const data = JSON.parse(decrypted);

  return { data, handle };
}

// Save to IndexedDB (Mobile/Fallback)
export async function saveToIndexedDB(
  data: EncryptedData,
  password: string
): Promise<void> {
  const jsonString = JSON.stringify(data);
  const encrypted = await encryptData(jsonString, password);
  await saveToIDB(data.fileName, encrypted);
}

// Load from IndexedDB (Mobile/Fallback)
export async function loadFromIndexedDB(
  fileName: string,
  password: string
): Promise<EncryptedData> {
  const encrypted = await loadFromIDB(fileName);
  if (!encrypted) {
    throw new Error("File not found in local storage");
  }
  const decrypted = await decryptData(encrypted, password);
  return JSON.parse(decrypted);
}

// Download encrypted file (Export/Backup)
export async function downloadEncryptedFile(data: EncryptedData, password: string) {
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
        reject(new Error("No file selected"));
        return;
      }

      try {
        const encrypted = await file.text();
        const decrypted = await decryptData(encrypted, password);
        const data = JSON.parse(decrypted);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}
