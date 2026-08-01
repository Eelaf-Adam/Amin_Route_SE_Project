// Offline IndexedDB Storage Helper Module
const DB_NAME = import.meta.env?.VITE_OFFLINE_DB_NAME || 'amin_route_offline';
const DB_VERSION = parseInt(import.meta.env?.VITE_OFFLINE_DB_VERSION || '1', 10);

export function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Users store
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }

      // Safety incident reports store
      if (!db.objectStoreNames.contains('safety_reports')) {
        const reportStore = db.createObjectStore('safety_reports', { keyPath: 'id' });
        reportStore.createIndex('sync_status', 'sync_status', { unique: false });
        reportStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Route histories store
      if (!db.objectStoreNames.contains('route_histories')) {
        const routeStore = db.createObjectStore('route_histories', { keyPath: 'id' });
        routeStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save an incident report locally to IndexedDB
export async function saveReportLocally(report) {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction('safety_reports', 'readwrite');
    const store = tx.objectStore('safety_reports');
    
    const record = {
      ...report,
      id: report.id || `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sync_status: report.sync_status || 'pending',
      timestamp: report.timestamp || new Date().toISOString()
    };
    
    await store.put(record);
    return record;
  } catch (err) {
    console.error('Failed to save report to IndexedDB:', err);
    throw err;
  }
}

export const saveOfflineReport = saveReportLocally;

// Fetch all unsynced pending reports
export async function getPendingReports() {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction('safety_reports', 'readonly');
    const store = tx.objectStore('safety_reports');
    const index = store.index('sync_status');

    return new Promise((resolve, reject) => {
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to read pending reports:', err);
    return [];
  }
}

// Fetch all local reports
export async function getAllOfflineReports() {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction('safety_reports', 'readonly');
    const store = tx.objectStore('safety_reports');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to read all offline reports:', err);
    return [];
  }
}

// Save route locally
export async function saveRouteLocally(route) {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction('route_histories', 'readwrite');
    const store = tx.objectStore('route_histories');

    const record = {
      ...route,
      id: route.id || `route-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    await store.put(record);
    return record;
  } catch (err) {
    console.error('Failed to save route locally:', err);
  }
}

// Sync all pending reports to backend API
export async function syncPendingReports(baseUrl) {
  const targetBase = baseUrl || import.meta.env?.VITE_API_URL || '';
  const pending = await getPendingReports();
  if (!pending.length) return { syncedCount: 0 };

  let syncedCount = 0;
  const db = await openOfflineDB();

  for (const report of pending) {
    try {
      const endpoint = `${targetBase.replace(/\/+$/, '')}/api/reports/`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: report.id,
          hazard_type: report.hazard_type || 'General',
          description: report.description || '',
          location: report.location || [32.5301, 15.5895]
        })
      });

      if (response.ok) {
        const tx = db.transaction('safety_reports', 'readwrite');
        const store = tx.objectStore('safety_reports');
        report.sync_status = 'synced';
        await store.put(report);
        syncedCount++;
      }
    } catch (err) {
      console.warn('Network sync attempt failed for report', report.id, err);
    }
  }

  return { syncedCount };
}
