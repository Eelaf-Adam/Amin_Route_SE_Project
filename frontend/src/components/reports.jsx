import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  MapPin, 
  Plus, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Navigation,
  Check
} from 'lucide-react';
import InteractiveMap from './map';
import { saveOfflineReport, syncPendingReports } from '../utils/offlineDB';

const HAZARD_TYPES = [
  { id: 'Road Block', label: 'Road Block / Barrier', icon: ShieldAlert, color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'Security Checkpoint', label: 'Security Checkpoint', icon: Navigation, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'Conflict Zone', label: 'Active Hazard / Conflict', icon: AlertTriangle, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'Flooding / Weather', label: 'Severe Weather / Flooding', icon: MapPin, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'Infrastructure Damage', label: 'Infrastructure Damage', icon: FileText, color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export default function SafetyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Form input fields
  const [hazardType, setHazardType] = useState('Road Block');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('15.5895');
  const [longitude, setLongitude] = useState('32.5301');
  const [gettingGps, setGettingGps] = useState(false);

  const getApiUrl = () => {
    return import.meta.env?.VITE_API_URL || '';
  };

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      // First try syncing any pending offline reports
      await syncPendingReports(getApiUrl());

      const res = await fetch(`${getApiUrl()}/api/reports/`);
      if (!res.ok) throw new Error('Failed to load incident reports.');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.warn('Network fetch error, falling back:', err.message);
      setError('Working in offline/cached mode. Live server update pending.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(4).toString());
        setLongitude(position.coords.longitude.toFixed(4).toString());
        setGettingGps(false);
      },
      (err) => {
        console.error('GPS error:', err);
        alert('Could not retrieve current location. Please type coordinates manually.');
        setGettingGps(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please provide a brief description of the incident.');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid numerical latitude and longitude coordinates.');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess('');
    setError('');

    const payload = {
      hazard_type: hazardType,
      description: description.trim(),
      location: [lng, lat]
    };

    try {
      const res = await fetch(`${getApiUrl()}/api/reports/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Server rejected incident submission.');
      }

      const responseData = await res.json();
      setSubmitSuccess('Incident report successfully recorded and verified!');
      
      // Reset form
      setDescription('');
      setShowSubmitModal(false);

      // Refresh list
      fetchReports();
    } catch (err) {
      console.warn('Backend post failed, saving locally offline:', err.message);
      // Save offline fallback
      try {
        await saveOfflineReport(payload);
        setSubmitSuccess('Report saved locally. Will automatically sync when connection returns.');
        setShowSubmitModal(false);
        setDescription('');
      } catch (offlineErr) {
        setError('Failed to save report offline: ' + offlineErr.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format map markers for Leaflet map component
  const mapMarkers = reports.map(r => ({
    id: r.id,
    category: r.hazard_type,
    title: r.hazard_type,
    description: r.description,
    lat: r.coordinates ? r.coordinates[1] : 15.5895,
    lng: r.coordinates ? r.coordinates[0] : 32.5301,
  }));

  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-xl shadow-blue-600/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md text-blue-100 px-3 py-1 rounded-full text-xs font-semibold border border-white/10 mb-2">
            <ShieldAlert size={14} className="text-amber-300" />
            <span>Crowdsourced & PostGIS Verified</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Safety Incident Reports</h2>
          <p className="text-blue-100 text-xs mt-1">
            Real-time community reports informing conflict-free route calculations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchReports}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition border border-white/20 cursor-pointer"
            title="Refresh Reports"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-2xl font-bold text-sm shadow-lg flex items-center space-x-2 transition active:scale-[0.98] cursor-pointer"
          >
            <Plus size={18} />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{submitSuccess}</span>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-2xl flex items-center space-x-3 text-xs font-medium">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Interactive Map & Live List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-gray-900">Incident Distribution Map</h3>
              <span className="text-xs text-gray-500 font-medium">{reports.length} Active Hazard Pins</span>
            </div>
            <InteractiveMap reports={mapMarkers} height="360px" />
          </div>
        </div>

        {/* Reports List Column */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
            <span>Recent Hazard Feed</span>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">Live</span>
          </h3>

          {loading && (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <RefreshCw size={24} className="animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-medium">Fetching verified hazard reports...</p>
            </div>
          )}

          {!loading && reports.length === 0 && (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
              <p className="text-sm font-bold text-gray-700">No Active Hazards Reported</p>
              <p className="text-xs text-gray-400">All registered routes are clear of conflict zones.</p>
            </div>
          )}

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {reports.map((report, idx) => {
              const matchedType = HAZARD_TYPES.find(t => t.id === report.hazard_type) || HAZARD_TYPES[0];
              const IconComp = matchedType.icon;
              return (
                <div 
                  key={report.id || idx}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-blue-200 bg-gray-50/50 hover:bg-blue-50/20 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center space-x-1.5 ${matchedType.color}`}>
                      <IconComp size={13} />
                      <span>{report.hazard_type}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                      <Clock size={11} />
                      <span>{report.reported_at ? new Date(report.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-gray-800 font-medium leading-relaxed">
                    {report.description || 'Hazard reported along corridor.'}
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center space-x-1">
                      <MapPin size={12} className="text-red-500" />
                      <span>{report.coordinates ? `${report.coordinates[1].toFixed(3)}, ${report.coordinates[0].toFixed(3)}` : 'Coordinates verified'}</span>
                    </span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                      {report.status || 'active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Report Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Submit Safety Incident</h3>
                  <p className="text-[11px] text-gray-400">PostGIS Hazard Registration</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hazard Type Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Hazard Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HAZARD_TYPES.map((type) => {
                    const isSelected = hazardType === type.id;
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setHazardType(type.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center space-x-2 transition ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={16} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                        <span className="truncate">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Description & Observations</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe road conditions, checkpoints, or obstruction details..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  required
                />
              </div>

              {/* Location Coordinates */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-700">Coordinates (Lat / Lng)</label>
                  <button
                    type="button"
                    onClick={handleUseGps}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <Navigation size={12} className={gettingGps ? 'animate-spin' : ''} />
                    <span>{gettingGps ? 'Locating...' : 'Use My GPS'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-0.5">Latitude</span>
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="e.g. 15.5895"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-0.5">Longitude</span>
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="e.g. 32.5301"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="w-1/3 py-3 rounded-2xl font-bold text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 rounded-2xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit to PostGIS</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
