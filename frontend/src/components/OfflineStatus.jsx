import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getPendingReports, syncPendingReports } from '../utils/offlineDB';

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  const checkPending = async () => {
    try {
      const pending = await getPendingReports();
      setPendingCount(pending.length);
    } catch (err) {
      console.warn('Could not read pending count:', err);
    }
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const baseUrl = import.meta.env?.VITE_API_URL || '';
      const result = await syncPendingReports(baseUrl);
      await checkPending();
      if (result.syncedCount > 0) {
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 4000);
      }
    } catch (err) {
      console.error('Manual sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    checkPending();

    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      checkPending();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for service worker trigger messages
    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === 'TRIGGER_OFFLINE_SYNC') {
        handleSync();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  if (isOnline && pendingCount === 0 && !justSynced) {
    return null; // Silent when fully online and synced
  }

  return (
    <div className="w-full z-40 transition-all duration-300">
      {!isOnline ? (
        /* Offline Banner */
        <div className="bg-amber-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold shadow-md border-b border-amber-700/50">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <WifiOff size={16} className="text-amber-200 animate-pulse flex-shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> Maps and routes loaded from local cache.
              {pendingCount > 0 && ` (${pendingCount} report${pendingCount > 1 ? 's' : ''} queued)`}
            </span>
          </div>
          <span className="bg-amber-800/80 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-amber-100">
            Cached
          </span>
        </div>
      ) : justSynced ? (
        /* Sync Success Toast */
        <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-md animate-fadeIn">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <CheckCircle2 size={16} className="text-emerald-200" />
            <span>All offline incident reports successfully synchronized to backend server.</span>
          </div>
        </div>
      ) : (
        /* Unsynced Queue Pending Banner */
        <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-md">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Wifi size={16} className="text-blue-200" />
            <span>Online connection restored. {pendingCount} report(s) ready to sync.</span>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded text-xs flex items-center space-x-1.5 transition"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
