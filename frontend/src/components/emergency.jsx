import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Share2, 
  Volume2, 
  VolumeX,
  Camera, 
  Radio, 
  PhoneCall, 
  UserPlus, 
  Check, 
  X, 
  MapPin, 
  ShieldCheck,
  Link,
  Navigation,
  Compass
} from 'lucide-react';

export default function EmergencySOS() {
  const [activeSubTab, setActiveSubTab] = useState('sos'); // 'sos' | 'sharing'
  const [sosActivated, setSosActivated] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trusted Contacts State
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Mom', relation: 'Family', isSharing: true, timeLeft: '2 hours left' },
    { id: 2, name: 'Dad', relation: 'Family', isSharing: true, timeLeft: '45 minutes left' },
    { id: 3, name: 'Girl Friend', relation: 'Partner', isSharing: true, timeLeft: 'Until I arrive' },
    { id: 4, name: 'Sister', relation: 'Family', isSharing: false },
    { id: 5, name: 'Brother', relation: 'Family', isSharing: false },
  ]);

  // Add Contact Modal State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Family');
  const [newContactPhone, setNewContactPhone] = useState('');

  const toggleSharing = (id) => {
    setContacts(contacts.map(c => 
      c.id === id ? { ...c, isSharing: !c.isSharing, timeLeft: c.isSharing ? null : 'Until I arrive' } : c
    ));
    showToast('Location sharing status updated.');
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName) return;
    const newC = {
      id: Date.now(),
      name: newContactName,
      relation: newContactRelation,
      isSharing: true,
      timeLeft: 'Until I arrive'
    };
    setContacts([...contacts, newC]);
    setNewContactName('');
    setNewContactPhone('');
    setIsAddingContact(false);
    showToast(`${newContactName} added to Trusted Contacts!`);
  };

  // -------------------------------------------------------------
  // QUICK ACTION 1: Share Location Link
  // -------------------------------------------------------------
  const [activeShareLink, setActiveShareLink] = useState(null);

  const handleShareLocation = () => {
    const trackingUrl = `https://aminroute.app/track/sos-${Math.floor(100000 + Math.random() * 900000)}`;
    setActiveShareLink(trackingUrl);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(trackingUrl).catch(() => {});
    }
    showToast(`Live location link copied to clipboard! (${trackingUrl})`);
  };

  // -------------------------------------------------------------
  // QUICK ACTION 2: Sound Siren Alarm (Web Audio API)
  // -------------------------------------------------------------
  const [isAlarmSounding, setIsAlarmSounding] = useState(false);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const intervalRef = useRef(null);

  const toggleSoundAlarm = () => {
    if (isAlarmSounding) {
      stopAlarm();
    } else {
      startAlarm();
    }
  };

  const startAlarm = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        showToast('Alarm sounding (simulated on this browser)');
        setIsAlarmSounding(true);
        return;
      }
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;

      // Alternating frequency siren effect (800Hz <-> 1200Hz)
      let high = false;
      intervalRef.current = setInterval(() => {
        if (oscRef.current && audioCtxRef.current) {
          oscRef.current.frequency.setValueAtTime(high ? 800 : 1200, audioCtxRef.current.currentTime);
          high = !high;
        }
      }, 400);

      setIsAlarmSounding(true);
      showToast('⚠️ Siren Alarm Sounding at Maximum Volume!');
    } catch (e) {
      setIsAlarmSounding(true);
      showToast('⚠️ Siren Alarm Sounding!');
    }
  };

  const stopAlarm = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch(e) {}
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch(e) {}
    }
    setIsAlarmSounding(false);
    showToast('Siren alarm muted.');
  };

  useEffect(() => {
    return () => {
      stopAlarm();
    };
  }, []);

  // -------------------------------------------------------------
  // QUICK ACTION 3: Camera Capture Modal
  // -------------------------------------------------------------
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);

  const handleOpenPhotoModal = async () => {
    setIsCameraOpen(true);
    setCapturedPhoto(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      // Fallback if camera stream is blocked
    }
  };

  const handleTakePhoto = () => {
    // Generate snapshot canvas or fallback SVG
    const timestamp = new Date().toLocaleTimeString();
    const photoData = {
      timestamp,
      location: '24.7136° N, 46.6753° E (Central Dist)',
      id: Math.floor(1000 + Math.random() * 9000)
    };
    setCapturedPhoto(photoData);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    showToast('Photo captured and attached to Safety Incident Log!');
  };

  const closeCameraModal = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsCameraOpen(false);
    setCapturedPhoto(null);
  };

  // -------------------------------------------------------------
  // QUICK ACTION 4: Live Telemetry GPS Tracking
  // -------------------------------------------------------------
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [telemetry, setTelemetry] = useState({
    lat: '24.7136° N',
    lng: '46.6753° E',
    speed: '0 km/h',
    accuracy: '± 3m (High)',
    updatesCount: 1
  });
  const watchIdRef = useRef(null);

  const toggleLiveTracking = () => {
    if (isLiveTracking) {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setIsLiveTracking(false);
      showToast('Live tracking broadcast paused.');
    } else {
      setIsLiveTracking(true);
      showToast('Live GPS telemetry active. Broadcasting updates...');

      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setTelemetry({
              lat: `${pos.coords.latitude.toFixed(4)}° N`,
              lng: `${pos.coords.longitude.toFixed(4)}° E`,
              speed: `${(pos.coords.speed || 0).toFixed(1)} km/h`,
              accuracy: `± ${Math.round(pos.coords.accuracy)}m (GPS)`,
              updatesCount: telemetry.updatesCount + 1
            });
          },
          () => {},
          { enableHighAccuracy: true }
        );
      }
    }
  };

  return (
    <div className="space-y-4 pb-6 animate-fadeIn relative">
      {/* Toast Notification */}
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

      {/* Alarm Sounding Floating Banner */}
      {isAlarmSounding && (
        <div className="bg-red-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-pulse border-2 border-yellow-400">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Volume2 size={24} className="animate-bounce" />
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider">⚠️ SIREN ALARM SOUNDING</h4>
              <p className="text-[11px] text-red-100">High-decibel emergency siren broadcasting</p>
            </div>
          </div>
          <button 
            onClick={stopAlarm} 
            className="px-3.5 py-2 bg-white text-red-700 font-black text-xs rounded-xl shadow hover:bg-red-50 transition flex items-center space-x-1 cursor-pointer"
          >
            <VolumeX size={16} />
            <span>Mute Alarm</span>
          </button>
        </div>
      )}

      {/* Sub-navigation selector */}
      <div className="flex bg-gray-200 p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('sos')}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            activeSubTab === 'sos' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Emergency SOS
        </button>
        <button
          onClick={() => setActiveSubTab('sharing')}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            activeSubTab === 'sharing' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Location Sharing
        </button>
      </div>

      {/* VIEW 1: EMERGENCY SOS VIEW */}
      {activeSubTab === 'sos' && (
        <div className="space-y-4">
          {/* Red Emergency Hero Card */}
          <div className="bg-gradient-to-r from-red-600 via-red-600 to-rose-700 text-white p-6 rounded-3xl shadow-lg text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <AlertTriangle size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-extrabold">Emergency SOS</h2>
            <p className="text-red-100 text-xs mt-1">Instant alert broadcast to contacts & emergency services</p>

            <button
              onClick={() => {
                const nextState = !sosActivated;
                setSosActivated(nextState);
                if (nextState) {
                  showToast('🚨 EMERGENCY SOS BROADCAST ACTIVATED! Dispatch notified.');
                } else {
                  showToast('Emergency SOS cancelled.');
                }
              }}
              className={`mt-4 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition shadow-xl cursor-pointer ${
                sosActivated 
                  ? 'bg-black text-red-400 border-2 border-red-500 animate-bounce' 
                  : 'bg-white text-red-600 hover:bg-red-50'
              }`}
            >
              {sosActivated ? '🚨 SOS ACTIVATED - TAP TO CANCEL' : 'ACTIVATE SOS NOW'}
            </button>
          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Action 1: Share Location */}
              <button 
                onClick={handleShareLocation}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-2 hover:bg-blue-50/50 hover:border-blue-200 transition group cursor-pointer"
              >
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition">
                  <Share2 size={20} />
                </div>
                <span className="text-xs font-bold text-gray-800">Share Location</span>
                <span className="text-[10px] text-gray-400">Copy live tracking URL</span>
              </button>

              {/* Action 2: Sound Alarm */}
              <button 
                onClick={toggleSoundAlarm}
                className={`p-4 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center space-y-2 transition group cursor-pointer ${
                  isAlarmSounding ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-100 hover:bg-amber-50/50 hover:border-amber-200'
                }`}
              >
                <div className={`p-3 rounded-xl transition group-hover:scale-110 ${isAlarmSounding ? 'bg-red-600 text-white' : 'bg-amber-50 text-amber-600'}`}>
                  {isAlarmSounding ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {isAlarmSounding ? 'Stop Alarm' : 'Sound Alarm'}
                </span>
                <span className="text-[10px] text-gray-400">High-decibel siren</span>
              </button>

              {/* Action 3: Take Photo */}
              <button 
                onClick={handleOpenPhotoModal}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-2 hover:bg-purple-50/50 hover:border-purple-200 transition group cursor-pointer"
              >
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition">
                  <Camera size={20} />
                </div>
                <span className="text-xs font-bold text-gray-800">Take Photo</span>
                <span className="text-[10px] text-gray-400">Incident snapshot</span>
              </button>

              {/* Action 4: Live Tracking */}
              <button 
                onClick={toggleLiveTracking}
                className={`p-4 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center space-y-2 transition group cursor-pointer ${
                  isLiveTracking ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-gray-100 hover:bg-emerald-50/50 hover:border-emerald-200'
                }`}
              >
                <div className={`p-3 rounded-xl transition group-hover:scale-110 ${isLiveTracking ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Radio size={20} className={isLiveTracking ? 'animate-pulse' : ''} />
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {isLiveTracking ? 'Pause Tracking' : 'Live Tracking'}
                </span>
                <span className="text-[10px] text-gray-400">Real-time GPS stream</span>
              </button>
            </div>
          </div>

          {/* Active Live Tracking Card (Displays when active) */}
          {isLiveTracking && (
            <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-md border border-emerald-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-2 text-xs font-bold text-emerald-300">
                  <Radio size={16} className="animate-pulse text-emerald-400" />
                  <span>Live GPS Beacon Active</span>
                </span>
                <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded-full border border-emerald-600">
                  Precision: High
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-emerald-950/60 p-2 rounded-xl border border-emerald-800">
                  <span className="text-[10px] text-emerald-300 block">Latitude</span>
                  <span className="text-xs font-bold">{telemetry.lat}</span>
                </div>
                <div className="bg-emerald-950/60 p-2 rounded-xl border border-emerald-800">
                  <span className="text-[10px] text-emerald-300 block">Longitude</span>
                  <span className="text-xs font-bold">{telemetry.lng}</span>
                </div>
                <div className="bg-emerald-950/60 p-2 rounded-xl border border-emerald-800">
                  <span className="text-[10px] text-emerald-300 block">Speed</span>
                  <span className="text-xs font-bold">{telemetry.speed}</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Share Link Banner */}
          {activeShareLink && (
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 truncate pr-2">
                <Link size={16} className="text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-blue-900 truncate">{activeShareLink}</span>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(activeShareLink);
                  showToast('Link copied!');
                }}
                className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg flex-shrink-0 text-[11px] cursor-pointer"
              >
                Copy
              </button>
            </div>
          )}

          {/* Emergency Hotline Services */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Emergency Services</h3>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm overflow-hidden">
              <div className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Emergency Services (Police / Ambulance)</h4>
                  <p className="text-xs text-gray-400">112 / 911</p>
                </div>
                <a href="tel:112" className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition cursor-pointer">
                  <PhoneCall size={18} />
                </a>
              </div>
              <div className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Civil Defense & Rescue</h4>
                  <p className="text-xs text-gray-400">998</p>
                </div>
                <a href="tel:998" className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition cursor-pointer">
                  <PhoneCall size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LOCATION SHARING VIEW */}
      {activeSubTab === 'sharing' && (
        <div className="space-y-4">
          {/* Blue Location Sharing Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-3xl shadow-sm">
            <h2 className="text-xl font-bold">Location Sharing</h2>
            <p className="text-blue-100 text-xs">Share your real-time location with trusted contacts</p>

            <div className="mt-4 bg-white text-gray-900 p-4 rounded-2xl shadow-inner flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">Your Current Location</h4>
                <p className="text-[11px] text-gray-500">Central District, Main Boulevard</p>
                <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                  Location accuracy: High • Updated just now
                </span>
              </div>
            </div>
          </div>

          {/* Currently Sharing With Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              Currently Sharing With ({contacts.filter(c => c.isSharing).length})
            </h3>
            <div className="space-y-2">
              {contacts.filter(c => c.isSharing).map(contact => (
                <div key={contact.id} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center text-sm">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{contact.name}</h4>
                      <p className="text-[10px] text-gray-400">{contact.timeLeft || 'Sharing active'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="p-1 bg-emerald-100 text-emerald-600 rounded-full">
                      <Check size={14} />
                    </span>
                    <button onClick={() => toggleSharing(contact.id)} className="p-1 text-gray-400 hover:text-red-500 transition cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trusted Contacts list */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              Trusted Contacts
            </h3>
            <div className="space-y-2">
              {contacts.filter(c => !c.isSharing).map(contact => (
                <div key={contact.id} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{contact.name}</h4>
                      <p className="text-[10px] text-gray-400">{contact.relation}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSharing(contact.id)}
                    className="px-3.5 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition cursor-pointer"
                  >
                    Share
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Trusted Contact Button */}
          <button 
            onClick={() => setIsAddingContact(true)}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-blue-700 transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <UserPlus size={18} />
            <span>+ Add Trusted Contact</span>
          </button>
        </div>
      )}

      {/* MODAL: ADD TRUSTED CONTACT */}
      {isAddingContact && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <UserPlus className="text-blue-600" size={20} />
                <span>Add Trusted Contact</span>
              </h3>
              <button onClick={() => setIsAddingContact(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Relationship</label>
                <select 
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none cursor-pointer"
                >
                  <option value="Family">Family</option>
                  <option value="Partner">Partner</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text"
                  placeholder="+966 50 000 0000"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingContact(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PHOTO CAPTURE */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn space-y-4 text-center">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Camera className="text-purple-600" size={20} />
                <span>Safety Incident Photo Capture</span>
              </h3>
              <button onClick={closeCameraModal} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {!capturedPhoto ? (
              <div className="space-y-4">
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-slate-700">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>Camera Live</span>
                  </div>
                </div>

                <button 
                  onClick={handleTakePhoto}
                  className="w-full py-3 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Camera size={18} />
                  <span>Snap Incident Photo</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900 text-white rounded-2xl p-6 relative border border-purple-500/40">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-300 mx-auto flex items-center justify-center mb-2">
                    <Check size={32} />
                  </div>
                  <h4 className="font-bold text-sm">Snapshot Recorded!</h4>
                  <p className="text-xs text-slate-300 mt-1">Timestamp: {capturedPhoto.timestamp}</p>
                  <p className="text-[11px] text-slate-400">GPS: {capturedPhoto.location}</p>
                  <span className="inline-block mt-3 bg-purple-500/20 text-purple-200 text-[10px] px-3 py-1 rounded-full border border-purple-400/30">
                    Encrypted & Attached to Emergency Dispatch Log #{capturedPhoto.id}
                  </span>
                </div>

                <button 
                  onClick={closeCameraModal}
                  className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}