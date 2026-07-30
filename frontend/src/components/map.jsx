import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Start (Green) and Destination (Red) icons using Leaflet divIcon
const startIcon = L.divIcon({
  className: 'custom-start-marker',
  html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const destIcon = L.divIcon({
  className: 'custom-dest-marker',
  html: `<div style="background-color: #ef4444; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><circle cx="12" cy="12" r="10"/></svg>
         </div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const DEFAULT_CENTER = [-1.9441, 30.0619];

// Component to dynamically fit map view to route bounds
function MapBoundsSetter({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
      } catch (e) {
        // Ignore fitBounds errors if invalid bounds
      }
    }
  }, [bounds, map]);
  return null;
}

export default function InteractiveMap({ 
  reports = [], 
  activeRoutePath = null, 
  altRoutePath = null,
  startPoint = null,
  endPoint = null,
  height = "220px" 
}) {
  // Convert OSRM GeoJSON [lng, lat] coordinates to Leaflet [lat, lng]
  const formatPath = (path) => {
    if (!path || !Array.isArray(path) || path.length === 0) return [];
    return path.map(pt => {
      if (Array.isArray(pt) && pt.length >= 2) {
        // If coordinate is in [lng, lat] format (GeoJSON standard)
        // Swap if 1st element is longitude (e.g. > 20 or < -20 while 2nd is latitude)
        if (Math.abs(pt[0]) > 20 && Math.abs(pt[1]) < 20) {
          return [pt[1], pt[0]];
        }
        return [pt[1], pt[0]];
      }
      return pt;
    });
  };

  const formattedActivePath = formatPath(activeRoutePath);
  const formattedAltPath = formatPath(altRoutePath);

  // Compute map center and bounding box
  let center = DEFAULT_CENTER;
  let allBounds = [];

  if (formattedActivePath.length > 0) {
    center = formattedActivePath[0];
    allBounds = [...formattedActivePath];
  } else if (startPoint) {
    center = [startPoint.lat, startPoint.lng];
    allBounds.push(center);
  }

  if (startPoint) allBounds.push([startPoint.lat, startPoint.lng]);
  if (endPoint) allBounds.push([endPoint.lat, endPoint.lng]);

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto fit bounds when route updates */}
        {allBounds.length > 0 && <MapBoundsSetter bounds={allBounds} />}

        {/* Alternative Route Polyline (dashed secondary) */}
        {formattedAltPath.length > 0 && (
          <Polyline 
            positions={formattedAltPath}
            pathOptions={{ 
              color: '#f59e0b', 
              weight: 4, 
              opacity: 0.7, 
              dashArray: '8, 8',
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        )}

        {/* Active Selected Route Polyline (distinct vibrant road path) */}
        {formattedActivePath.length > 0 && (
          <Polyline 
            positions={formattedActivePath}
            pathOptions={{ 
              color: '#2563eb', 
              weight: 6, 
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        )}

        {/* Start Location Pin */}
        {startPoint && (
          <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Origin</span>
                <h4 className="font-semibold text-xs mt-1">{startPoint.name || 'Start Location'}</h4>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Location Pin */}
        {endPoint && (
          <Marker position={[endPoint.lat, endPoint.lng]} icon={destIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">Destination</span>
                <h4 className="font-semibold text-xs mt-1">{endPoint.name || 'Destination'}</h4>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Safety Hazard Reports Pins */}
        {reports.map((report, idx) => (
          <Marker key={report.id || idx} position={[report.lat, report.lng]}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-600">
                  {report.hazard_type || report.category || 'Hazard'}
                </span>
                <h4 className="font-semibold text-sm mt-1">{report.description || report.title}</h4>
                <p className="text-xs text-gray-600 mt-0.5">{report.status ? `Status: ${report.status}` : ''}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}