// ────────── IndexDB Handler for caching ──────────
const DB_NAME = "FilePreviewCache";
const STORE_NAME = "previews";
const DB_VERSION = 1;

export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "key" });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getCachedBlob(key, maxAgeMs) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
            const entry = req.result;
            if (!entry || Date.now() - entry.timestamp > maxAgeMs) {
                resolve(null);
            } else {
                resolve(entry.blob);
            }
        };
        req.onerror = () => resolve(null);
    });
}

export async function setCachedBlob(key, blob) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put({ key, blob, timestamp: Date.now() });
        tx.oncomplete = () => resolve();
    });
}