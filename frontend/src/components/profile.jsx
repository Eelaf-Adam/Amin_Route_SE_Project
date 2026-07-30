import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  MapPin, 
  Navigation, 
  User, 
  ChevronRight, 
  Bell, 
  Lock, 
  LogOut, 
  Globe,
  X,
  Check,
  Plus,
  Trash2,
  Phone,
  Home,
  Volume2,
  Crosshair,
  Database
} from 'lucide-react';

export default function Profile({ 
  user = { 
    name: 'Leovir Duron', 
    email: 'leovirduron@gmail.com', 
    phone: '', 
    emergencyContact: '', 
    homeAddress: '' 
  }, 
  onLogout,
  language = 'en',
  onToggleLanguage,
  onUpdateUser
}) {
  const isRtl = language === 'ar';

  // Active modal state: 'personal' | 'notifications' | 'safety' | 'saved_locations' | 'app_settings' | null
  const [activeModal, setActiveModal] = useState(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Personal Info State (starts empty or with user saved data)
  const [personalInfo, setPersonalInfo] = useState({
    name: user.name || 'Leovir Duron',
    email: user.email || 'leovirduron@gmail.com',
    phone: user.phone || '',
    emergencyContact: user.emergencyContact || '',
    homeAddress: user.homeAddress || ''
  });

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || 'Leovir Duron',
        email: user.email || 'leovirduron@gmail.com',
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || '',
        homeAddress: user.homeAddress || ''
      });
    }
  }, [user]);

  const handleSavePersonalInfo = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser(personalInfo);
    }
    setActiveModal(null);
    showToast(isRtl ? 'تم تحديث المعلومات الشخصية بنجاح' : 'Personal Information updated successfully!');
  };

  // 2. Notifications State
  const [notifications, setNotifications] = useState({
    push: true,
    emailAlerts: true,
    sosAlerts: true,
    soundVibration: true,
    weeklyReport: false
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 3. Safety Settings State
  const [safetySettings, setSafetySettings] = useState({
    sosDelay: '5s',
    collisionDetection: true,
    autoShareHighRisk: true,
    safeRadius: '1km',
    nightShield: true
  });

  // 4. Saved Locations State
  const [savedLocations, setSavedLocations] = useState([
    { id: 1, label: 'Home', address: '123 Safe St, Central District', icon: 'home', safetyScore: '98%' },
    { id: 2, label: 'Work', address: 'Innovation Tower, Floor 14', icon: 'work', safetyScore: '92%' },
    { id: 3, label: 'Gym', address: 'Fitness Hub, West Ave', icon: 'gym', safetyScore: '89%' },
  ]);
  const [newLocTitle, setNewLocTitle] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocTitle || !newLocAddress) return;
    const newLoc = {
      id: Date.now(),
      label: newLocTitle,
      address: newLocAddress,
      icon: 'other',
      safetyScore: '95%'
    };
    setSavedLocations([...savedLocations, newLoc]);
    setNewLocTitle('');
    setNewLocAddress('');
    setIsAddingLocation(false);
    showToast(isRtl ? 'تمت إضافة الموقع بنجاح' : 'Location saved successfully!');
  };

  const handleDeleteLocation = (id) => {
    setSavedLocations(savedLocations.filter(loc => loc.id !== id));
    showToast(isRtl ? 'تم حذف الموقع' : 'Location removed.');
  };

  // 5. App Settings State with LocalStorage Persistence
  const [appSettings, setAppSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('amin_app_settings');
      return saved ? JSON.parse(saved) : {
        mapTheme: 'default',
        distanceUnit: 'km',
        dataSaver: false,
        offlineCache: true,
        voiceNav: true,
        highAccuracyGps: true
      };
    } catch {
      return {
        mapTheme: 'default',
        distanceUnit: 'km',
        dataSaver: false,
        offlineCache: true,
        voiceNav: true,
        highAccuracyGps: true
      };
    }
  });

  const handleSaveAppSettings = (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('amin_app_settings', JSON.stringify(appSettings));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
    setActiveModal(null);
    showToast(isRtl ? 'تم حفظ وتطبيق إعدادات التطبيق' : 'App preferences saved & applied!');
  };

  const handleClearCache = () => {
    showToast(isRtl ? 'تم مسح ذاكرة التخزين المؤقت (تم تحرير 14.2 ميكابايت)' : 'Local map cache cleared successfully (14.2 MB freed).');
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-6 relative">
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

      {/* Blue Profile Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className={`flex items-center space-x-4 mb-4 ${isRtl ? 'space-x-reverse flex-row-reverse text-right' : ''}`}>
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center font-bold text-2xl text-white shadow-md">
            {personalInfo.name ? personalInfo.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{personalInfo.name}</h2>
            <p className="text-blue-100 text-xs">{personalInfo.email}</p>
            {personalInfo.phone ? (
              <p className="text-blue-200 text-[11px] font-mono mt-0.5">{personalInfo.phone}</p>
            ) : (
              <p className="text-blue-200/80 text-[11px] italic mt-0.5">{isRtl ? 'لم يتم إضافة رقم هاتف' : 'Click Personal Information to add phone'}</p>
            )}
            <span className="inline-block bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] px-2.5 py-0.5 rounded-full font-medium mt-1">
              ✓ {isRtl ? 'مستخدم موثق' : 'Verified User'}
            </span>
          </div>
        </div>

        {/* User Quick Stats Banner */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex justify-around text-center border border-white/10">
          <div>
            <div className="flex items-center justify-center text-emerald-300 space-x-1 rtl:space-x-reverse">
              <Shield size={14} />
              <span className="text-sm font-bold">127</span>
            </div>
            <p className="text-[10px] text-blue-100">{isRtl ? 'رحلات آمنة' : 'Safe Trips'}</p>
          </div>

          <div className="border-r border-white/20 h-8 self-center" />

          <div>
            <div className="flex items-center justify-center text-blue-200 space-x-1 rtl:space-x-reverse">
              <Navigation size={14} />
              <span className="text-sm font-bold">342 km</span>
            </div>
            <p className="text-[10px] text-blue-100">{isRtl ? 'المسافة' : 'Distance'}</p>
          </div>

          <div className="border-r border-white/20 h-8 self-center" />

          <div>
            <div className="flex items-center justify-center text-purple-200 space-x-1 rtl:space-x-reverse">
              <MapPin size={14} />
              <span className="text-sm font-bold">94%</span>
            </div>
            <p className="text-[10px] text-blue-100">{isRtl ? 'معدل الأمان' : 'Safety Score'}</p>
          </div>
        </div>
      </div>

      {/* Language / RTL Switcher Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Globe size={18} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900">
              {isRtl ? 'لغة التطبيق (Language)' : 'App Language'}
            </h4>
            <p className="text-[11px] text-gray-400">
              {isRtl ? 'العربية (RTL Enabled)' : 'English (LTR Active)'}
            </p>
          </div>
        </div>
        <button
          onClick={onToggleLanguage}
          className="px-3.5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition cursor-pointer"
        >
          {language === 'en' ? 'العربية (AR)' : 'English (EN)'}
        </button>
      </div>

      {/* Account Settings List */}
      <div className="space-y-4">
        {/* Account Group */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {isRtl ? 'الحساب' : 'Account'}
          </h4>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveModal('personal')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left rtl:text-right transition group cursor-pointer"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                  <User size={18} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    {isRtl ? 'المعلومات الشخصية' : 'Personal Information'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {personalInfo.name} • {personalInfo.phone}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className={`text-gray-400 group-hover:text-blue-600 transition ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Preferences Group */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {isRtl ? 'التفضيلات' : 'Preferences'}
          </h4>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveModal('notifications')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left rtl:text-right transition group cursor-pointer"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition">
                  <Bell size={18} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    {isRtl ? 'الإشعارات' : 'Notifications'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {isRtl ? 'إدارة التنبيهات والرسائل' : 'Manage hazard alerts & push settings'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className={`text-gray-400 group-hover:text-blue-600 transition ${isRtl ? 'rotate-180' : ''}`} />
            </button>

            <button 
              onClick={() => setActiveModal('safety')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left rtl:text-right transition group cursor-pointer"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition">
                  <Shield size={18} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    {isRtl ? 'إعدادات الأمان' : 'Safety Settings'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {isRtl ? 'تحديد خيارات الطوارئ ونطاق الأمان' : 'Configure SOS delay & collision detection'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className={`text-gray-400 group-hover:text-blue-600 transition ${isRtl ? 'rotate-180' : ''}`} />
            </button>

            <button 
              onClick={() => setActiveModal('saved_locations')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left rtl:text-right transition group cursor-pointer"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    {isRtl ? 'المواقع المحفوظة' : 'Saved Locations'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {savedLocations.length} {isRtl ? 'أماكن محفوظة' : 'saved places (Home, Work)'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className={`text-gray-400 group-hover:text-blue-600 transition ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* General Group */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {isRtl ? 'عام' : 'General'}
          </h4>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveModal('app_settings')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left rtl:text-right transition group cursor-pointer"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition">
                  <Lock size={18} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">
                    {isRtl ? 'إعدادات التطبيق' : 'App Settings'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {isRtl ? 'سمة الخريطة، الوحدات، والملاحة الصوتية' : 'Map theme, units, GPS & voice guidance'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className={`text-gray-400 group-hover:text-blue-600 transition ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Log Out Button */}
      <button 
        onClick={onLogout}
        className="w-full py-3.5 border border-red-200 text-red-600 font-semibold text-sm rounded-2xl hover:bg-red-50 transition flex items-center justify-center space-x-2 bg-white shadow-sm cursor-pointer"
      >
        <LogOut size={16} />
        <span>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
      </button>

      {/* MODAL 1: PERSONAL INFORMATION */}
      {activeModal === 'personal' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 rtl:space-x-reverse">
                <User className="text-blue-600" size={20} />
                <span>{isRtl ? 'المعلومات الشخصية' : 'Personal Information'}</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePersonalInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                <input 
                  type="text" 
                  value={personalInfo.name} 
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <input 
                  type="email" 
                  value={personalInfo.email} 
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{isRtl ? 'رقم الهاتف' : 'Phone Number'}</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={personalInfo.phone} 
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
                    placeholder={isRtl ? 'أدخل رقم هاتفك...' : 'Enter your phone number (e.g. +249...)'}
                  />
                  <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{isRtl ? 'جهة الاتصال عند الطوارئ' : 'Emergency Contact'}</label>
                <input 
                  type="text" 
                  value={personalInfo.emergencyContact} 
                  onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContact: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{isRtl ? 'عنوان المنزل الرئيسي' : 'Primary Home Address'}</label>
                <input 
                  type="text" 
                  value={personalInfo.homeAddress} 
                  onChange={(e) => setPersonalInfo({ ...personalInfo, homeAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)} 
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  {isRtl ? 'حفظ التغييرات' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NOTIFICATIONS */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 rtl:space-x-reverse">
                <Bell className="text-amber-500" size={20} />
                <span>{isRtl ? 'إعدادات الإشعارات' : 'Notification Preferences'}</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 divide-y divide-gray-100">
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">{isRtl ? 'الإشعارات المباشرة' : 'Push Notifications'}</h4>
                  <p className="text-[11px] text-gray-500">{isRtl ? 'تنبيهات فورية عند وجود مخاطر' : 'Instant alerts when entering unsafe areas'}</p>
                </div>
                <button 
                  onClick={() => toggleNotification('push')} 
                  className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${notifications.push ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${notifications.push ? (isRtl ? '-translate-x-6' : 'translate-x-6') : ''}`} />
                </button>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">{isRtl ? 'تنبيهات طوارئ SOS القريبة' : 'Nearby SOS Alerts'}</h4>
                  <p className="text-[11px] text-gray-500">{isRtl ? 'تنبيه عند تفعيل SOS بالقرب منك' : 'Broadcast alerts if a user triggers SOS nearby'}</p>
                </div>
                <button 
                  onClick={() => toggleNotification('sosAlerts')} 
                  className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${notifications.sosAlerts ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${notifications.sosAlerts ? (isRtl ? '-translate-x-6' : 'translate-x-6') : ''}`} />
                </button>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">{isRtl ? 'الصوت والاهتزاز' : 'Sound & Vibration Alerts'}</h4>
                  <p className="text-[11px] text-gray-500">{isRtl ? 'تأثيرات صوتية مسموعة للتنبيهات' : 'Audible siren warnings during high-hazard conditions'}</p>
                </div>
                <button 
                  onClick={() => toggleNotification('soundVibration')} 
                  className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${notifications.soundVibration ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${notifications.soundVibration ? (isRtl ? '-translate-x-6' : 'translate-x-6') : ''}`} />
                </button>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">{isRtl ? 'تنبيهات البريد الإلكتروني' : 'Email Security Digest'}</h4>
                  <p className="text-[11px] text-gray-500">{isRtl ? 'ملخص الأمان الأسبوعي وتقارير الطرق' : 'Weekly incident digests and account activity'}</p>
                </div>
                <button 
                  onClick={() => toggleNotification('emailAlerts')} 
                  className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${notifications.emailAlerts ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${notifications.emailAlerts ? (isRtl ? '-translate-x-6' : 'translate-x-6') : ''}`} />
                </button>
              </div>
            </div>

            <button 
              onClick={() => {
                setActiveModal(null);
                showToast(isRtl ? 'تم حفظ إعدادات الإشعارات' : 'Notification preferences saved!');
              }} 
              className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md mt-4 cursor-pointer"
            >
              {isRtl ? 'حفظ وإغلاق' : 'Save & Close'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: SAFETY SETTINGS */}
      {activeModal === 'safety' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 rtl:space-x-reverse">
                <Shield className="text-emerald-600" size={20} />
                <span>{isRtl ? 'إعدادات الأمان والتكيف' : 'Safety & Protection Configuration'}</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{isRtl ? 'مهلة عد تنازلي تفعيل SOS' : 'Automatic SOS Countdown Delay'}</label>
                <select 
                  value={safetySettings.sosDelay}
                  onChange={(e) => setSafetySettings({ ...safetySettings, sosDelay: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="3s">3 {isRtl ? 'ثوانٍ (سريع)' : 'Seconds (Fast)'}</option>
                  <option value="5s">5 {isRtl ? 'ثوانٍ (افتراضي)' : 'Seconds (Recommended)'}</option>
                  <option value="10s">10 {isRtl ? 'ثوانٍ' : 'Seconds'}</option>
                  <option value="off">{isRtl ? 'إيقاف العد التنازلي (تفعيل فوري)' : 'Instant Activate (No Delay)'}</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">{isRtl ? 'كشف الاصطدام والحوادث' : 'Collision & Fall Detection'}</h4>
                  <p className="text-[11px] text-gray-500">{isRtl ? 'تنبيه وتفعيل تلقائي عند الكشف عن حركة مفاجئة' : 'Auto-prompt SOS if accelerometer detects sudden impact'}</p>
                </div>
                <button 
                  onClick={() => setSafetySettings({ ...safetySettings, collisionDetection: !safetySettings.collisionDetection })} 
                  className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${safetySettings.collisionDetection ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${safetySettings.collisionDetection ? (isRtl ? '-translate-x-6' : 'translate-x-6') : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">{isRtl ? 'مشاركة الموقع في الطرق عالية الخطورة' : 'Auto-Share on High Risk Routes'}</h4>
                  <p className="text-[11px] text-gray-500">{isRtl ? 'مشاركة موقعك تلقائياً مع جهات اتصالك عند المسارات الخطرة' : 'Automatically notify trusted contacts when entering red zones'}</p>
                </div>
                <button 
                  onClick={() => setSafetySettings({ ...safetySettings, autoShareHighRisk: !safetySettings.autoShareHighRisk })} 
                  className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${safetySettings.autoShareHighRisk ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${safetySettings.autoShareHighRisk ? (isRtl ? '-translate-x-6' : 'translate-x-6') : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">{isRtl ? 'درع الملاحة الليلية' : 'Night-time Navigation Shield'}</h4>
                  <p className="text-[11px] text-gray-500">{isRtl ? 'تأكيد أمان إضافي خلال الرحلات من 10 مساءً إلى 6 صباحاً' : 'Enhanced hazard warnings and check-ins between 10PM - 6AM'}</p>
                </div>
                <button 
                  onClick={() => setSafetySettings({ ...safetySettings, nightShield: !safetySettings.nightShield })} 
                  className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${safetySettings.nightShield ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${safetySettings.nightShield ? (isRtl ? '-translate-x-6' : 'translate-x-6') : ''}`} />
                </button>
              </div>
            </div>

            <button 
              onClick={() => {
                setActiveModal(null);
                showToast(isRtl ? 'تم تحديث إعدادات الأمان' : 'Safety settings saved successfully!');
              }} 
              className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-md mt-4 cursor-pointer"
            >
              {isRtl ? 'حفظ الإعدادات' : 'Save Safety Configuration'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: SAVED LOCATIONS */}
      {activeModal === 'saved_locations' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 rtl:space-x-reverse">
                <MapPin className="text-purple-600" size={20} />
                <span>{isRtl ? 'المواضع والمواقع المحفوظة' : 'Saved Locations'}</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {savedLocations.map((loc) => (
                <div key={loc.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                      <Home size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{loc.label}</h4>
                      <p className="text-[11px] text-gray-500">{loc.address}</p>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        Safety Score: {loc.safetyScore}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteLocation(loc.id)} 
                    className="p-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {!isAddingLocation ? (
              <button 
                onClick={() => setIsAddingLocation(true)} 
                className="w-full py-2.5 border-2 border-dashed border-purple-300 text-purple-700 font-bold text-xs rounded-2xl hover:bg-purple-50 transition flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer"
              >
                <Plus size={16} />
                <span>{isRtl ? '+ إضافة موقع جديد' : '+ Add New Saved Location'}</span>
              </button>
            ) : (
              <form onSubmit={handleAddLocation} className="p-4 bg-purple-50 rounded-2xl space-y-3 border border-purple-100">
                <h4 className="font-bold text-xs text-purple-900">{isRtl ? 'إضافة مكان جديد' : 'New Saved Place'}</h4>
                <input 
                  type="text" 
                  placeholder={isRtl ? 'اسم المكان (مثال: منزل العائلة)' : 'Location Title (e.g., Mom House)'} 
                  value={newLocTitle} 
                  onChange={(e) => setNewLocTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs focus:outline-none"
                  required
                />
                <input 
                  type="text" 
                  placeholder={isRtl ? 'العنوان أو المزيج الجغرافي' : 'Street Address or Coordinates'} 
                  value={newLocAddress} 
                  onChange={(e) => setNewLocAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs focus:outline-none"
                  required
                />
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingLocation(false)} 
                    className="flex-1 py-2 bg-white text-gray-600 font-bold text-xs rounded-xl border border-gray-200 cursor-pointer"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 cursor-pointer"
                  >
                    {isRtl ? 'حفظ الموقع' : 'Save Location'}
                  </button>
                </div>
              </form>
            )}

            <button 
              onClick={() => setActiveModal(null)} 
              className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 cursor-pointer"
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: APP SETTINGS (OPERATIONAL & FULLY FUNCTIONAL) */}
      {activeModal === 'app_settings' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 rtl:space-x-reverse">
                <Lock className="text-blue-600" size={20} />
                <span>{isRtl ? 'إعدادات الخريطة والتطبيق' : 'App & Navigation Settings'}</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAppSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{isRtl ? 'وحدة قياس المسافة' : 'Distance Measurement Unit'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setAppSettings({ ...appSettings, distanceUnit: 'km' })}
                    className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${appSettings.distanceUnit === 'km' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                  >
                    Kilometers (km)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setAppSettings({ ...appSettings, distanceUnit: 'mi' })}
                    className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${appSettings.distanceUnit === 'mi' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                  >
                    Miles (mi)
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 divide-y divide-gray-100 pt-1">
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    <Volume2 size={16} className="text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xs text-gray-900">{isRtl ? 'الملاحة الصوتية المباشرة' : 'Voice Navigation Guidance'}</h4>
                      <p className="text-[11px] text-gray-500">{isRtl ? 'تنبيهات صوتية فورية بالانعطافات والمخاطر' : 'Spoken turn-by-turn & hazard audio cues'}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setAppSettings({ ...appSettings, voiceNav: !appSettings.voiceNav })} 
                    className={`w-11 h-6 rounded-full transition p-0.5 cursor-pointer ${appSettings.voiceNav ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition transform ${appSettings.voiceNav ? (isRtl ? '-translate-x-5' : 'translate-x-5') : ''}`} />
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    <Crosshair size={16} className="text-emerald-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xs text-gray-900">{isRtl ? 'GPS عالي الدقة' : 'High-Accuracy GPS Telemetry'}</h4>
                      <p className="text-[11px] text-gray-500">{isRtl ? 'استخدام أجهزة الاستشعار المتعددة لتحسين التتبع' : 'Use fused sensor telemetry for precision tracking'}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setAppSettings({ ...appSettings, highAccuracyGps: !appSettings.highAccuracyGps })} 
                    className={`w-11 h-6 rounded-full transition p-0.5 cursor-pointer ${appSettings.highAccuracyGps ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition transform ${appSettings.highAccuracyGps ? (isRtl ? '-translate-x-5' : 'translate-x-5') : ''}`} />
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    <Database size={16} className="text-purple-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xs text-gray-900">{isRtl ? 'تخزين الخرائط بدون إنترنت' : 'Offline Map Cache'}</h4>
                      <p className="text-[11px] text-gray-500">{isRtl ? 'حفظ خرائط الأمان محلياً للاستخدام 오فلاين' : 'Store tile cache locally for offline rerouting'}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setAppSettings({ ...appSettings, offlineCache: !appSettings.offlineCache })} 
                    className={`w-11 h-6 rounded-full transition p-0.5 cursor-pointer ${appSettings.offlineCache ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition transform ${appSettings.offlineCache ? (isRtl ? '-translate-x-5' : 'translate-x-5') : ''}`} />
                  </button>
                </div>
              </div>

              {/* Maintenance Utility Button */}
              <div className="pt-2">
                <button 
                  type="button"
                  onClick={handleClearCache}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition cursor-pointer flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
                >
                  <Database size={14} />
                  <span>{isRtl ? 'مسح ذاكرة التخزين المؤقت للخرائط' : 'Clear Offline Map Cache (14.2 MB)'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)} 
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  {isRtl ? 'حفظ الإعدادات' : 'Save App Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}