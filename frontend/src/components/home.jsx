import React from 'react';
import { MapPin, Navigation, AlertTriangle, FileText, User, Clock } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: MapPin },
    { id: 'routes', label: 'Routes', icon: Navigation },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'sos', label: 'SOS', icon: AlertTriangle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 py-2 px-2 flex justify-around items-center z-50 shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-1 px-2 rounded-2xl transition-all duration-150 cursor-pointer ${
              isActive 
                ? 'text-blue-600 font-bold bg-blue-50/80 scale-105' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={18} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
            <span className="text-[9px] mt-0.5 font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}