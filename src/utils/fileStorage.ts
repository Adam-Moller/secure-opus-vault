import { encryptData, decryptData } from "./encryption";
import type { EncryptedData } from "@/types/opportunity";

const FILE_EXTENSION = ".enc";
const DEFAULT_FILENAME = "crm-data.enc";

// Check if File System Access API is supported
export const isFileSystemSupported = () => {
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
    handle = await (window as any).showSaveFilePicker({
      suggestedName: DEFAULT_FILENAME,
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

// Download encrypted file (Mobile/Fallback)
export async function downloadEncryptedFile(data: EncryptedData, password: string) {
  const jsonString = JSON.stringify(data);
  const encrypted = await encryptData(jsonString, password);

  const blob = new Blob([encrypted], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = DEFAULT_FILENAME;
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
