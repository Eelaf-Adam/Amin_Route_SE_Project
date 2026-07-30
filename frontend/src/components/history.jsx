import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  RotateCcw, 
  TrendingUp, 
  Calendar,
  Check,
  X,
  Filter
} from 'lucide-react';

export default function RouteHistory({ onSelectRoute }) {
  const [filter, setFilter] = useState('week'); // 'week' | 'all'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Analytics stats matching design
  const stats = {
    totalRoutes: 24,
    distance: '86.5 km',
    avgSafety: '94%',
    safeRoutesPct: '89%',
  };

  // Sample history data
  const historyList = [
    {
      id: 1,
      start: 'Kigali Center, Rwanda',
      destination: 'Nyabugogo Bus Park',
      date: 'Today',
      time: '6:45 PM',
      distance: '8.4 km',
      duration: '18 min',
      tag: 'Safest',
      tagColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 2,
      start: 'North Avenue Corridor',
      destination: 'South River Bridge',
      date: 'Yesterday',
      time: '7:45 AM',
      distance: '10.2 km',
      duration: '20 min',
      tag: 'Fastest',
      tagColor: 'bg-emerald-100 text-emerald-700',
    },
  ];

  const handleUseRouteAgain = (item) => {
    showToast(`Loading route from "${item.start}" to "${item.destination}"...`);
    if (onSelectRoute) {
      setTimeout(() => {
        onSelectRoute(item);
      }, 800);
    }
  };

  return (
    <div className="space-y-4 pb-6 animate-fadeIn relative">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 left-5 md:left-auto md:w-96 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Check size={18} className="text-emerald-400" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Blue Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Safety Reports & Route History</h2>
            <p className="text-blue-100 text-xs">Your past journeys, safety metrics & logs</p>
          </div>
          <div className="p-2 bg-white/10 rounded-2xl border border-white/20">
            <Clock size={20} className="text-white" />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-blue-700/60 p-1 rounded-2xl text-xs font-semibold backdrop-blur-sm">
          <button
            onClick={() => setFilter('week')}
            className={`flex-1 py-1.5 rounded-xl transition cursor-pointer ${
              filter === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:text-white'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 rounded-xl transition cursor-pointer ${
              filter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* 2x2 Stats Analytics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Routes */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <div className="p-1.5 bg-blue-50 rounded-xl">
              <Navigation size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-400">Total Routes</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats.totalRoutes}</p>
        </div>

        {/* Distance */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <div className="p-1.5 bg-purple-50 rounded-xl">
              <TrendingUp size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-400">Distance</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats.distance}</p>
        </div>

        {/* Avg Safety */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <div className="p-1.5 bg-emerald-50 rounded-xl">
              <ShieldCheck size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-400">Avg Safety</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats.avgSafety}</p>
        </div>

        {/* Safe Routes */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center space-x-2 text-amber-600 mb-2">
            <div className="p-1.5 bg-amber-50 rounded-xl">
              <Calendar size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-400">Safe Routes</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats.safeRoutesPct}</p>
        </div>
      </div>

      {/* Recent Routes List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Recent Journeys</h3>

        {historyList.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 hover:border-blue-200 transition">
            {/* Start and Destination indicator */}
            <div className="space-y-2 border-l-2 border-blue-500 pl-3 ml-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-800">{item.start}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-xs font-bold text-gray-800">{item.destination}</span>
              </div>
            </div>

            {/* Details bar */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50">
              <div className="flex items-center space-x-2">
                <span>{item.date}</span>
                <span>• {item.time}</span>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${item.tagColor}`}>
                {item.tag}
              </span>
            </div>

            <p className="text-xs font-semibold text-gray-500">
              {item.distance} • {item.duration}
            </p>

            {/* Action button */}
            <button 
              onClick={() => handleUseRouteAgain(item)}
              className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition flex items-center justify-center space-x-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Use This Route Again</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}