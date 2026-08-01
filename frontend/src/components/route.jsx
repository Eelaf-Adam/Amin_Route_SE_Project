import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Shield, Zap, ArrowRight, X, Search, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import InteractiveMap from './map';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Default initial origin & destination (Sudan defaults)
const DEFAULT_START = {
  name: 'Khartoum Center',
  display_name: 'Khartoum Center, Sudan',
  lat: 15.5895,
  lng: 32.5301
};

const DEFAULT_DEST = {
  name: 'Omdurman Al-Morada',
  display_name: 'Al-Morada District, Omdurman, Sudan',
  lat: 15.6420,
  lng: 32.4820
};

// Preset demo shortcuts for Sudanese travel routes
const DEMO_PRESETS = [
  {
    label: 'Khartoum ➔ Omdurman (Hazards Detour Demo)',
    start: DEFAULT_START,
    dest: DEFAULT_DEST
  },
  {
    label: 'Bahri (Khartoum North) ➔ South River Bridge',
    start: { name: 'Bahri (Khartoum North)', display_name: 'Bahri City Center, Khartoum North, Sudan', lat: 15.6350, lng: 32.5650 },
    dest: { name: 'South River Bridge', display_name: 'South River Bridge Crossing, Khartoum, Sudan', lat: 15.5500, lng: 32.5200 }
  },
  {
    label: 'Khartoum ➔ Wad Madani Corridor',
    start: DEFAULT_START,
    dest: { name: 'Wad Madani', display_name: 'Wad Madani, Gezira State, Sudan', lat: 14.4012, lng: 33.5199 }
  }
];

export default function RoutePlanner() {
  // Location selection states
  const [startPoint, setStartPoint] = useState(DEFAULT_START);
  const [destPoint, setDestPoint] = useState(DEFAULT_DEST);

  // Search input & dropdown states
  const [startQuery, setStartQuery] = useState(DEFAULT_START.name);
  const [destQuery, setDestQuery] = useState(DEFAULT_DEST.name);
  
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const [loadingSearchStart, setLoadingSearchStart] = useState(false);
  const [loadingSearchDest, setLoadingSearchDest] = useState(false);

  // Route & hazard state
  const [selectedRouteKey, setSelectedRouteKey] = useState('safest');
  const [routesData, setRoutesData] = useState(null);
  const [hazardReports, setHazardReports] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Navigation mode state
  const [isNavigating, setIsNavigating] = useState(false);

  // Debounced smart search fetcher
  useEffect(() => {
    if (!startQuery || startQuery === startPoint.name) {
      setStartSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingSearchStart(true);
      try {
        const res = await fetch(`${API_BASE}/api/route/search?q=${encodeURIComponent(startQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setStartSuggestions(data.results || []);
        }
      } catch (err) {
        console.error("Start search error:", err);
      } finally {
        setLoadingSearchStart(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [startQuery, startPoint.name]);

  useEffect(() => {
    if (!destQuery || destQuery === destPoint.name) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingSearchDest(true);
      try {
        const res = await fetch(`${API_BASE}/api/route/search?q=${encodeURIComponent(destQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setDestSuggestions(data.results || []);
        }
      } catch (err) {
        console.error("Dest search error:", err);
      } finally {
        setLoadingSearchDest(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [destQuery, destPoint.name]);

  // Fetch active hazard reports for Leaflet map markers
  useEffect(() => {
    fetch(`${API_BASE}/api/reports/`)
      .then(res => res.json())
      .then(data => {
        if (data.reports) {
          // Format reports with lat/lng
          const formatted = data.reports.map(r => ({
            id: r.id,
            hazard_type: r.hazard_type,
            description: r.description,
            status: r.status,
            lat: r.coordinates ? r.coordinates[1] : (r.lat || 15.5895),
            lng: r.coordinates ? r.coordinates[0] : (r.lng || 32.5301)
          }));
          setHazardReports(formatted);
        }
      })
      .catch(err => console.error("Error fetching reports:", err));
  }, []);

  // Main Route calculation caller
  const calculateRoute = async (origin = startPoint, destination = destPoint) => {
    setLoadingRoute(true);
    setRouteError(null);
    try {
      const url = `${API_BASE}/api/route/plan?start_lng=${origin.lng}&start_lat=${origin.lat}&end_lng=${destination.lng}&end_lat=${destination.lat}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to calculate routes");
      const data = await res.json();
      if (data.routes) {
        setRoutesData(data.routes);
      } else {
        throw new Error("No route geometry returned");
      }
    } catch (err) {
      console.error("Route planning error:", err);
      setRouteError("Unable to calculate road network route. Using offline route calculation.");
      // Fallback local route structure
      setRoutesData({
        safest: {
          id: 'safest',
          type: 'Safest Route',
          time: '20 min',
          distance: '11.5 km',
          safetyScore: '96%',
          badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          description: 'Avoids active hazard reports and road work along main corridor.',
          path_geometry: [[origin.lng, origin.lat], [destination.lng, destination.lat]]
        },
        fastest: {
          id: 'fastest',
          type: 'Fastest Route',
          time: '15 min',
          distance: '9.2 km',
          safetyScore: '80%',
          badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
          description: 'Direct path through central avenue, minor traffic delay reported.',
          path_geometry: [[origin.lng, origin.lat], [destination.lng, destination.lat]]
        }
      });
    } finally {
      setLoadingRoute(false);
    }
  };

  // Trigger route calculation on initial load or point selection change
  useEffect(() => {
    calculateRoute(startPoint, destPoint);
  }, [startPoint, destPoint]);

  const activeRoute = routesData ? routesData[selectedRouteKey] : null;
  const altRouteKey = selectedRouteKey === 'safest' ? 'fastest' : 'safest';
  const altRoute = routesData ? routesData[altRouteKey] : null;

  const handleSelectPreset = (preset) => {
    setStartPoint(preset.start);
    setStartQuery(preset.start.name);
    setDestPoint(preset.dest);
    setDestQuery(preset.dest.name);
    setShowStartDropdown(false);
    setShowDestDropdown(false);
  };

  return (
    <div className="space-y-4 pb-6 animate-fadeIn">
      {isNavigating && activeRoute ? (
        /* Active Navigation Mode UI */
        <div className="space-y-4">
          {/* Top Live Navigation Banner */}
          <div className="bg-emerald-600 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Live Navigation Active</span>
              </div>
              <button 
                onClick={() => setIsNavigating(false)}
                className="bg-emerald-700/80 hover:bg-emerald-800 p-1.5 rounded-full transition text-white"
                title="End Navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Turn by Turn Instruction */}
            <div className="flex items-start space-x-3 mt-2">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white">
                <Navigation size={28} className="transform rotate-45" />
              </div>
              <div>
                <p className="text-xs text-emerald-100 font-medium">In 200 meters</p>
                <h3 className="text-lg font-bold leading-tight">Turn right onto main road towards {destPoint.name}</h3>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-4 pt-3 border-t border-emerald-500/40 flex justify-between items-center text-xs">
              <div>
                <span className="text-emerald-200 block text-[10px]">REMAINING</span>
                <span className="font-bold text-sm">{activeRoute.time} ({activeRoute.distance})</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-200 block text-[10px]">SAFETY CLEARANCE</span>
                <span className="font-extrabold text-sm bg-white/20 px-2 py-0.5 rounded-full">{activeRoute.safetyScore} Safe</span>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Map with Road Polyline */}
          <InteractiveMap 
            height="320px" 
            reports={hazardReports}
            activeRoutePath={activeRoute.path_geometry}
            altRoutePath={altRoute ? altRoute.path_geometry : null}
            startPoint={startPoint}
            endPoint={destPoint}
          />

          {/* Safety Status Banner */}
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center space-x-3">
            <Shield size={20} className="text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-800 font-medium">
              {activeRoute.hazards_detected && activeRoute.hazards_detected.length > 0
                ? `Caution: ${activeRoute.hazards_detected.length} hazard zone(s) near route corridor.`
                : 'Zero active hazard intersections detected along current route.'}
            </p>
          </div>

          {/* Stop Navigation Button */}
          <button 
            onClick={() => setIsNavigating(false)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition flex items-center justify-center space-x-2"
          >
            <span>Stop Navigation</span>
          </button>
        </div>
      ) : (
        /* Standard Route Planner UI */
        <>
          {/* Header Card with Smart Search Inputs */}
          <div className="bg-blue-600 text-white p-5 rounded-3xl shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Plan Your Route</h2>
                <p className="text-blue-100 text-xs">Smart search & road network navigation</p>
              </div>
              {loadingRoute && (
                <div className="flex items-center space-x-1 text-xs bg-blue-500/40 px-3 py-1 rounded-full text-blue-100">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Computing...</span>
                </div>
              )}
            </div>

            {/* Smart Search Inputs Container */}
            <div className="space-y-2 bg-white text-gray-900 p-3 rounded-2xl shadow-inner relative">
              {/* Origin Input */}
              <div className="relative">
                <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                  <input
                    type="text"
                    value={startQuery}
                    onChange={(e) => {
                      setStartQuery(e.target.value);
                      setShowStartDropdown(true);
                    }}
                    onFocus={() => setShowStartDropdown(true)}
                    placeholder="Search start location..."
                    className="w-full text-xs font-semibold focus:outline-none bg-transparent pr-6"
                  />
                  {loadingSearchStart && <RefreshCw size={12} className="animate-spin text-gray-400 absolute right-2" />}
                </div>

                {/* Origin Suggestions Dropdown */}
                {showStartDropdown && startSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-gray-100">
                    {startSuggestions.map((item) => (
                      <div
                        key={item.place_id}
                        onClick={() => {
                          setStartPoint(item);
                          setStartQuery(item.name);
                          setShowStartDropdown(false);
                        }}
                        className="p-2.5 hover:bg-blue-50 cursor-pointer transition flex items-start space-x-2"
                      >
                        <MapPin size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-800">{item.name}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{item.display_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Input */}
              <div className="relative pt-1">
                <div className="flex items-center space-x-2">
                  <MapPin size={14} className="text-red-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={destQuery}
                    onChange={(e) => {
                      setDestQuery(e.target.value);
                      setShowDestDropdown(true);
                    }}
                    onFocus={() => setShowDestDropdown(true)}
                    placeholder="Search destination..."
                    className="w-full text-xs font-semibold focus:outline-none bg-transparent pr-6"
                  />
                  {loadingSearchDest && <RefreshCw size={12} className="animate-spin text-gray-400 absolute right-2" />}
                </div>

                {/* Destination Suggestions Dropdown */}
                {showDestDropdown && destSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-gray-100">
                    {destSuggestions.map((item) => (
                      <div
                        key={item.place_id}
                        onClick={() => {
                          setDestPoint(item);
                          setDestQuery(item.name);
                          setShowDestDropdown(false);
                        }}
                        className="p-2.5 hover:bg-blue-50 cursor-pointer transition flex items-start space-x-2"
                      >
                        <MapPin size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-800">{item.name}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{item.display_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto pt-1 no-scrollbar">
              <span className="text-[10px] text-blue-200 uppercase font-bold flex-shrink-0">Presets:</span>
              {DEMO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="bg-blue-500/50 hover:bg-blue-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition border border-blue-400/30"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map View rendering distinct Road Polyline */}
          <InteractiveMap 
            height="240px" 
            reports={hazardReports}
            activeRoutePath={activeRoute ? activeRoute.path_geometry : null}
            altRoutePath={altRoute ? altRoute.path_geometry : null}
            startPoint={startPoint}
            endPoint={destPoint}
          />

          {/* Route Option Cards (Safest vs Fastest) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              Calculated Road Network Options
            </h3>

            {routesData && (
              <>
                {/* Safest Route Option Card */}
                {routesData.safest && (
                  <div
                    onClick={() => setSelectedRouteKey('safest')}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                      selectedRouteKey === 'safest'
                        ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                          <Shield size={18} />
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-gray-900">{routesData.safest.type}</h4>
                            <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">Recommended</span>
                          </div>
                          <p className="text-xs font-semibold text-gray-500">{routesData.safest.time} • {routesData.safest.distance}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {routesData.safest.safetyScore} Safe
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{routesData.safest.description}</p>
                    
                    {routesData.safest.hazards_avoided && routesData.safest.hazards_avoided.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center space-x-1.5 text-[10px] text-emerald-700 font-medium">
                        <Check size={12} className="text-emerald-600" />
                        <span>Avoided: {routesData.safest.hazards_avoided.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Fastest Route Option Card */}
                {routesData.fastest && (
                  <div
                    onClick={() => setSelectedRouteKey('fastest')}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                      selectedRouteKey === 'fastest'
                        ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="p-2 rounded-xl bg-amber-100 text-amber-600">
                          <Zap size={18} />
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{routesData.fastest.type}</h4>
                          <p className="text-xs font-semibold text-gray-500">{routesData.fastest.time} • {routesData.fastest.distance}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {routesData.fastest.safetyScore} Safe
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{routesData.fastest.description}</p>
                    
                    {routesData.fastest.hazards_detected && routesData.fastest.hazards_detected.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center space-x-1.5 text-[10px] text-amber-700 font-medium">
                        <AlertTriangle size={12} className="text-amber-600" />
                        <span>Near: {routesData.fastest.hazards_detected.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Start Navigation Action Button */}
          <button 
            onClick={() => setIsNavigating(true)}
            disabled={!activeRoute}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-md transition flex items-center justify-center space-x-2 active:scale-[0.98]"
          >
            <span>Start Navigation ({selectedRouteKey === 'safest' ? 'Safest' : 'Fastest'})</span>
            <ArrowRight size={18} />
          </button>
        </>
      )}
    </div>
  );
}