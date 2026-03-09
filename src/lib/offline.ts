const DB_NAME = "dugout-intel-offline";
const STORE_NAME = "mutation-queue";
const DB_VERSION = 1;

interface QueuedMutation {
  id?: number;
  functionName: string;
  args: Record<string, unknown>;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueue(mutation: Omit<QueuedMutation, "id" | "timestamp">): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).add({ ...mutation, timestamp: Date.now() });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dequeueAll(functionName?: string): Promise<QueuedMutation[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const all: QueuedMutation[] = request.result;
      resolve(functionName ? all.filter((m) => m.functionName === functionName) : all);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearQueue(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}
