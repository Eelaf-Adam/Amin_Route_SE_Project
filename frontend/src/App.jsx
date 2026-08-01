import React, { useState } from 'react';
import { 
  Shield, 
  Navigation, 
  AlertTriangle, 
  Share2, 
  FileText, 
  User, 
  Globe,
  LogOut,
  MapPin,
  CheckCircle,
  Activity,
  Clock
} from 'lucide-react';

import Auth from './components/auth';
import BottomNav from './components/home';
import InteractiveMap from './components/map';
import RoutePlanner from './components/route';
import EmergencySOS from './components/emergency';
import SafetyReports from './components/reports';
import RouteHistory from './components/history';
import Profile from './components/profile';
import OfflineStatus from './components/OfflineStatus';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState('en'); // 'en' | 'ar'

  // If user is not logged in, render Auth screen
  if (!currentUser) {
    return <Auth onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleUpdateUser = (updatedInfo) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedInfo
    }));
  };

  const isRtl = language === 'ar';

  const handleLogout = () => {
    const confirmMsg = isRtl ? 'هل أنت تأكد من تسجيل الخروج؟' : 'Are you sure you want to log out?';
    if (window.confirm(confirmMsg)) {
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  const navItems = [
    { id: 'home', label: isRtl ? 'الرئيسية' : 'Dashboard', icon: MapPin },
    { id: 'routes', label: isRtl ? 'المسارات' : 'Route Planner', icon: Navigation },
    { id: 'reports', label: isRtl ? 'تقارير السلامة' : 'Safety Reports', icon: FileText },
    { id: 'history', label: isRtl ? 'سجل المسارات' : 'Route History', icon: Clock },
    { id: 'sos', label: isRtl ? 'طوارئ SOS' : 'Emergency SOS', icon: AlertTriangle },
    { id: 'profile', label: isRtl ? 'الملف الشخصي' : 'Profile', icon: User },
  ];

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`min-h-screen bg-slate-50 font-sans text-gray-900 ${
        isRtl ? 'text-right' : 'text-left'
      }`}
    >
      {/* Desktop Navigation Sidebar (visible on md screens and above) */}
      <div className="hidden md:flex flex-col fixed inset-y-0 ltr:left-0 rtl:right-0 w-64 bg-slate-900 text-white z-40 p-5 shadow-xl border-r border-slate-800">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-8 pt-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight">Amin Route</h1>
            <p className="text-[11px] text-slate-400 font-medium">Safe Navigation OS</p>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 translate-x-1 rtl:-translate-x-1'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={19} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Profile Card & Language Switch */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 text-xs text-slate-300 hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Globe size={16} className="text-blue-400" />
              <span>Language / اللغة</span>
            </div>
            <span className="font-bold text-blue-400 uppercase">{language}</span>
          </button>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50">
            <div className="flex items-center space-x-3 rtl:space-x-reverse overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="font-bold text-xs text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser.email || 'Verified User'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-semibold text-xs transition cursor-pointer flex-shrink-0"
              title={isRtl ? 'تسجيل الخروج' : 'Logout'}
            >
              <LogOut size={14} />
              <span>{isRtl ? 'تسجيل الخروج' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="md:ltr:pl-64 md:rtl:pr-64 min-h-screen transition-all duration-300">
        <OfflineStatus />
        {/* Mobile Header (visible only on screens smaller than md) */}
        <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield size={18} />
            </div>
            <span className="font-bold text-base tracking-tight text-gray-900">Amin Route</span>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button 
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-700 uppercase hover:bg-gray-200 transition cursor-pointer"
            >
              {language}
            </button>

            <div 
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-sm"
            >
              {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Dynamic Responsive Tab Container */}
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {activeTab === 'home' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Top Banner Card */}
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-600/10 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100 mb-3 border border-white/10">
                      <Activity size={14} className="text-emerald-300 animate-pulse" />
                      <span>{isRtl ? 'الملاحة الذكية الآمنة active' : 'Live Incident Protection Active'}</span>
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {isRtl ? `مرحباً، ${currentUser.name}` : `Welcome back, ${currentUser.name}!`}
                    </h1>
                    <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                      {isRtl 
                        ? 'مراقبة الطرق المباشرة وتقييم المخاطر في الوقت الفعلي لضمان وصولك بسلامة.'
                        : 'Real-time street safety monitoring and conflict-free routing for your journeys.'}
                    </p>
                  </div>

                  {/* Safety Score Card */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-4 rtl:space-x-reverse min-w-[200px] flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                      <Shield size={26} />
                    </div>
                    <div>
                      <p className="text-[11px] text-blue-100 font-medium">
                        {isRtl ? 'مستوى الأمان الحالي' : 'Current Safety Level'}
                      </p>
                      <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
                        <span className="text-2xl font-black text-white">94%</span>
                        <span className="text-xs font-bold text-emerald-300">
                          {isRtl ? 'ممتاز' : 'Excellent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Responsive Grid Layout (Map + Quick Actions) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Interactive Map (Spans 2 columns on desktop) */}
                <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                        {isRtl ? 'خريطة المخاطر المباشرة' : 'Live Street Hazard Map'}
                      </h2>
                      <p className="text-xs text-gray-500">Real-time crowdsourced & PostGIS verified pins</p>
                    </div>
                    <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle size={13} />
                      <span>Live</span>
                    </span>
                  </div>
                  
                  <InteractiveMap height="360px" />
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 tracking-tight mb-3">
                      {isRtl ? 'الإجراءات السريعة' : 'Quick Actions'}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                      <button 
                        onClick={() => setActiveTab('routes')} 
                        className="bg-blue-50/60 hover:bg-blue-50 p-4 rounded-2xl border border-blue-100 text-left rtl:text-right flex items-center space-x-3.5 rtl:space-x-reverse transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                          <Navigation size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{isRtl ? 'تخطيط المسار' : 'Plan Safe Route'}</h4>
                          <p className="text-xs text-gray-500">{isRtl ? 'الملاحة الآمنة' : 'Avoid hazard zones'}</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => setActiveTab('sos')} 
                        className="bg-red-50/60 hover:bg-red-50 p-4 rounded-2xl border border-red-100 text-left rtl:text-right flex items-center space-x-3.5 rtl:space-x-reverse transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{isRtl ? 'طوارئ SOS' : 'Emergency SOS'}</h4>
                          <p className="text-xs text-gray-500">{isRtl ? 'طلب مساعدة' : 'Broadcast alert'}</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => setActiveTab('history')} 
                        className="bg-emerald-50/60 hover:bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-left rtl:text-right flex items-center space-x-3.5 rtl:space-x-reverse transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                          <Clock size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{isRtl ? 'سجل المسارات' : 'Route History'}</h4>
                          <p className="text-xs text-gray-500">{isRtl ? 'الرحلات السابقة' : 'Past journeys & stats'}</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => setActiveTab('reports')} 
                        className="bg-amber-50/60 hover:bg-amber-50 p-4 rounded-2xl border border-amber-100 text-left rtl:text-right flex items-center space-x-3.5 rtl:space-x-reverse transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{isRtl ? 'تقارير السلامة' : 'Safety Reports'}</h4>
                          <p className="text-xs text-gray-500">{isRtl ? 'عرض الحوادث' : 'Incident log'}</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'routes' && <RoutePlanner />}
          {activeTab === 'reports' && <SafetyReports />}
          {activeTab === 'history' && (
            <RouteHistory 
              onSelectRoute={(routeItem) => {
                setActiveTab('routes');
              }} 
            />
          )}
          {activeTab === 'sos' && <EmergencySOS />}
          {activeTab === 'profile' && (
            <Profile 
              user={currentUser} 
              onLogout={() => setCurrentUser(null)} 
              language={language}
              onToggleLanguage={toggleLanguage}
              onUpdateUser={handleUpdateUser}
            />
          )}
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}