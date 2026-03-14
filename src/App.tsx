/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Home as HomeIcon,
  Calendar,
  Menu as MenuIcon,
  User,
  ArrowLeft,
  Search,
  Share2,
  Star,
  Timer,
  ChevronRight,
  Check,
  Info,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Edit2,
  ArrowRight,
  ShieldCheck,
  ShoppingBasket,
  Utensils,
  Trash2,
  Ticket,
  HelpCircle,
  ChevronDown,
  Zap,
  CheckCircle2,
  Circle,
  LogOut,
  XCircle,
  Gift,
  Copy,
  X,
  Link2,
  Users,
  CalendarRange,
  Plus,
  Briefcase,
  Wallet,
  Settings,
  ThumbsUp,
  Send
} from 'lucide-react';
import { Page, SERVICES, MENU_ITEMS, MENU_CATEGORIES, Service, MenuItem, MULTI_DAY_OPTIONS, BookingInfo } from './types';
import SpoonLogo from './SpoonLogo';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ordersApi, reviewsApi, paymentsApi, Order, Address } from './services/api';
import {
  connectSocket,
  onOrderAccepted,
  onOrderStatusUpdate,
  onSessionStarted,
  onSessionCompleted,
  onOrderCancelled,
  joinOrderRoom
} from './services/socket';

// --- Helpers ---

const DURATION_MAP: Record<string, number> = {
  '1 hour': 60,
  '1.5 hours': 90,
  '2 hours': 120,
  '2.5 hours': 150,
  '3 hours': 180,
  '3.5 hours': 210,
  '4 hours': 240,
};

const FAQ_ITEMS = [
  { q: 'How to select the right duration?', a: 'It takes 20 minutes to prepare a breakfast item, an additional 30 minutes for simple vegetarian curries, and 40 minutes for curries such as rajma, chole, chicken, and palak paneer. Our cooks will try to prepare breads and rice within the same time frame as the curries to ensure the best possible experience, regardless of the duration.' },
  { q: 'Can I ask the cook to make something not in the menu?', a: 'Our cooks are trained on a thoughtfully curated menu. With some direction from you or reference reels/videos, they will make their best attempt at the dish.' },
  { q: 'Will the cook carry utensils and groceries?', a: 'No, our cooks will need you to provide both utensils and groceries. For curries like rajma and chole, the ingredients should also be pre-soaked and ready to cook so that our cooks can prepare your meal quickly.' },
  { q: 'What if cooking isn\'t completed in the selected time duration?', a: 'If the cooking isn\'t completed within your selected time, you can extend the booking through the app. We do request that you choose menu items that can reasonably be completed in the chosen duration, typically around 20 minutes for a breakfast item, an additional 30 minutes for simple veg curries, and about 40 minutes for curries such as rajma, chole, chicken, and palak paneer. Our cooks are skilled and will always strive to deliver the best service within the available time.' },
];

const REVIEWS = [
  { name: 'Ankita Ray', date: 'Mar 3, 2026', duration: '1 hour', rating: 5, text: 'She was very professional, cooked good and tasty food, maintained hygiene, followed all our instructions patiently. Didn\'t rush at all, ensured everything was done properly before she left. Highly recommended!' },
  { name: 'Deboshree', date: 'Mar 2, 2026', duration: '2.5 hours', rating: 5, text: 'She is an amazing cook. You name it and she knows it. She will keep calm and clean everything once done. I wish her all the success in the life.' },
  { name: 'Priya', date: 'Mar 4, 2026', duration: '1 hour', rating: 2, text: 'she kept saying she has to go far and hurriedly did the cooking' },
  { name: 'Tushar Bhatt', date: 'Mar 4, 2026', duration: '1.5 hours', rating: 5, text: 'The taste of food she prepared was very good.' },
  { name: 'Ravi Kumar', date: 'Mar 1, 2026', duration: '2 hours', rating: 5, text: 'Excellent cooking skills. The paneer dishes were restaurant quality. Very polite and professional.' },
];

const RATING_DISTRIBUTION = [
  { stars: 5, count: 1000 },
  { stars: 4, count: 83 },
  { stars: 3, count: 38 },
  { stars: 2, count: 21 },
  { stars: 1, count: 29 },
];

// --- Components ---

const BottomNav = ({ activePage, setPage }: { activePage: Page, setPage: (p: Page) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-yellow-100 px-6 py-2 flex justify-between items-center z-50 max-w-md mx-auto">
    <button onClick={() => setPage('home')} className={`flex flex-col items-center gap-1 ${activePage === 'home' ? 'text-yellow-600' : 'text-slate-400'}`}>
      <HomeIcon size={20} fill={activePage === 'home' ? 'currentColor' : 'none'} />
      <span className="text-[10px] font-bold">Home</span>
    </button>
    <button onClick={() => setPage('menu')} className={`flex flex-col items-center gap-1 ${activePage === 'menu' ? 'text-yellow-600' : 'text-slate-400'}`}>
      <MenuIcon size={20} fill={activePage === 'menu' ? 'currentColor' : 'none'} />
      <span className="text-[10px] font-medium">Menu</span>
    </button>
    <button onClick={() => setPage('orders')} className={`flex flex-col items-center gap-1 ${activePage === 'orders' ? 'text-yellow-600' : 'text-slate-400'}`}>
      <Calendar size={20} fill={activePage === 'orders' ? 'currentColor' : 'none'} />
      <span className="text-[10px] font-medium">Orders</span>
    </button>
    <button onClick={() => setPage('safety')} className={`flex flex-col items-center gap-1 ${activePage === 'safety' ? 'text-yellow-600' : 'text-slate-400'}`}>
      <ShieldCheck size={20} fill={activePage === 'safety' ? 'currentColor' : 'none'} />
      <span className="text-[10px] font-medium">Safety</span>
    </button>
  </nav>
);

const Header = ({ title, onBack, rightIcon }: { title?: string, onBack?: () => void, rightIcon?: React.ReactNode }) => (
  <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-yellow-50">
    <div className="flex items-center gap-2">
      {onBack ? (
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
      ) : (
        <SpoonLogo height={28} />
      )}
    </div>
    {title && <h2 className="text-lg font-bold text-slate-900 absolute left-1/2 -translate-x-1/2">{title}</h2>}
    <div className="flex items-center gap-2">
      {rightIcon || <div className="w-10" />}
    </div>
  </header>
);

// --- Login Page ---

const LoginPage = ({ onSuccess }: { key?: string; onSuccess: () => void }) => {
  const { login, verify, updateName, user } = useAuth();
  const [phone, setPhone] = useState('+919876543210');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await login(phone);
      setStep('otp');
      if (result.otp) setOtp(result.otp);
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await verify(phone, otp);
      // If the user already has a name set, skip profile step
      setStep('profile');
    } catch (e: any) {
      setError(e.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await updateName(name.trim());
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Failed to save profile');
    }
    setLoading(false);
  };

  // If user already has a name when reaching profile step, auto-proceed
  useEffect(() => {
    if (step === 'profile' && user?.name) {
      onSuccess();
    }
  }, [step, user?.name]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-24 min-h-screen flex flex-col items-center justify-center px-6"
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <SpoonLogo height={48} />
          </div>
          <p className="text-slate-500 mt-1">Professional home cooking</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-50">
          {step === 'phone' ? (
            <>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 outline-none"
              />
              <button
                onClick={handleSendOtp}
                disabled={loading || phone.length < 10}
                className="w-full mt-4 bg-yellow-500 text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-yellow-600 transition-colors"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          ) : step === 'otp' ? (
            <>
              <p className="text-sm text-slate-500 mb-3">
                OTP sent to <span className="font-bold text-slate-700">{phone}</span>
              </p>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-lg text-center tracking-[0.3em] font-bold focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 outline-none"
              />
              <button
                onClick={handleVerify}
                disabled={loading || otp.length < 4}
                className="w-full mt-4 bg-yellow-500 text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-yellow-600 transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                onClick={() => { setStep('phone'); setOtp(''); }}
                className="w-full mt-2 text-yellow-600 font-bold text-sm py-2"
              >
                Change Number
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
                  <User size={28} className="text-yellow-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Almost there!</h3>
                <p className="text-sm text-slate-500 mt-1">Tell us your name to set up your profile</p>
              </div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                autoFocus
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 outline-none"
              />
              <button
                onClick={handleSaveProfile}
                disabled={loading || !name.trim()}
                className="w-full mt-4 bg-yellow-500 text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-yellow-600 transition-colors"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </>
          )}
          {error && <p className="text-yellow-600 text-sm mt-3 text-center">{error}</p>}
        </div>

        {step !== 'profile' && (
          <p className="text-center text-xs text-slate-400 mt-6">
            Dev mode: OTP auto-fills from server response
          </p>
        )}
      </div>
    </motion.div>
  );
};

// --- Pages ---

const HomePage = ({ onBook }: { key?: string; onBook: (s: Service, info?: BookingInfo) => void }) => {
  const { user, isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'rating' | 'sortBy' | 'services' | 'others'>('rating');
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [reviewFilter, setReviewFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedOthers, setSelectedOthers] = useState<string[]>([]);
  const [bookingTab, setBookingTab] = useState<'now' | 'later' | 'multi-day'>('now');
  const [selectedDate, setSelectedDate] = useState<number>(0); // index into date list
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [multiDayStep, setMultiDayStep] = useState<1 | 2>(1);
  const [multiDayService, setMultiDayService] = useState<Service | null>(null);
  const [multiDayCount, setMultiDayCount] = useState<number | null>(null);

  // Generate next 14 days for date pills
  const datePills = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      label: i === 0 ? 'Today' : dayNames[d.getDay()],
      date: d.getDate(),
      full: d,
    };
  });

  // Smart default: now + 1 hour (clamped to 7 AM – 9 PM)
  const getDefaultTime = () => {
    const now = new Date();
    let h24 = now.getHours() + 1;
    if (h24 < 7) h24 = 7;
    if (h24 > 21) h24 = 21;
    const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
    const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
    return { hour: h12, minute: 0, period };
  };
  const defaultTime = getDefaultTime();

  // Time picker state
  const [pickerHour, setPickerHour] = useState(defaultTime.hour);
  const [pickerMinute, setPickerMinute] = useState(defaultTime.minute);
  const [pickerPeriod, setPickerPeriod] = useState<'AM' | 'PM'>(defaultTime.period);

  // Convert picker to 24h
  const pickerTo24 = () => {
    return pickerPeriod === 'PM' ? (pickerHour === 12 ? 12 : pickerHour + 12) : (pickerHour === 12 ? 0 : pickerHour);
  };

  // Build selectedTime string from picker values
  useEffect(() => {
    const h24 = pickerTo24();
    if (h24 >= 7 && h24 <= 21) {
      const display12 = pickerHour.toString().padStart(2, '0');
      const displayMin = pickerMinute.toString().padStart(2, '0');
      setSelectedTime(`${display12}:${displayMin} ${pickerPeriod}`);
    }
  }, [pickerHour, pickerMinute, pickerPeriod]);

  // Check if selected time is truly in the past (less than 5 mins from now) — only for today
  const isSelectedTimePast = () => {
    if (selectedDate !== 0) return false;
    const now = new Date();
    const selected = new Date();
    selected.setHours(pickerTo24(), pickerMinute, 0, 0);
    const diffMs = selected.getTime() - now.getTime();
    return diffMs < 5 * 60 * 1000; // must be at least 5 mins from now
  };

  const totalReviews = RATING_DISTRIBUTION.reduce((sum, r) => sum + r.count, 0);
  const avgRating = (RATING_DISTRIBUTION.reduce((sum, r) => sum + r.stars * r.count, 0) / totalReviews).toFixed(2);
  const maxCount = Math.max(...RATING_DISTRIBUTION.map(r => r.count));

  const filteredReviews = selectedRatings.length > 0
    ? REVIEWS.filter(r => selectedRatings.includes(r.rating))
    : REVIEWS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-8"
    >
      {/* Personalized greeting or Hero banner */}
      <section className="p-4">
        {isAuthenticated && user?.name ? (
          <h2 className="text-2xl font-bold text-slate-900">
            Hey {user.name.split(' ')[0]}, what's cooking?
          </h2>
        ) : (
          <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-yellow-50">
            <div
              className="w-24 h-24 rounded-lg bg-cover bg-center shrink-0"
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD0N8m5UW84qY0r3cMt5JgUmHILEDAzRK9MsKJnObCl9ozURZWnjYtQWaSdLLIUXI6Xy_V0dY__joBF66ceClGlL7f7DmQEOB-IRA7ggxUDcTH4KlvxuJZ-mouY4DSdREEEUU-uq_4CIZcasKorZdsIdtsaQ3g_0FWtgO150cOnqvd_EyM0M5GJMRRLn1WbapsLiUDOCS4yuugHyC4rhrL_T1fNL1jBBTPO3sfVCTR1yhbLBLX-vTdYxfm7-JU06BwGDA0HDNW7CFSd')` }}
            />
            <div className="flex flex-col">
              <h2 className="text-xl font-bold">On-Demand Home Cooking</h2>
              <p className="text-slate-600 text-sm">Book a professional cook to your doorstep</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-white bg-green-600 px-2 py-0.5 rounded-full">New</span>
                <span className="text-xs text-slate-500">Verified & background-checked cooks</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Duration / Slot selector */}
      <section className="px-4 py-2">
        <div className="flex items-center border-b border-slate-200 mb-4">
          <button
            onClick={() => { setBookingTab('now'); setMultiDayStep(1); setMultiDayService(null); setMultiDayCount(null); }}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${bookingTab === 'now' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-slate-400'}`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Zap size={14} />
              Instant
            </span>
          </button>
          <button
            onClick={() => { setBookingTab('later'); setMultiDayStep(1); setMultiDayService(null); setMultiDayCount(null); }}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${bookingTab === 'later' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-slate-400'}`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Clock size={14} />
              Later
            </span>
          </button>
          <button
            onClick={() => { setBookingTab('multi-day'); setMultiDayStep(1); setMultiDayService(null); setMultiDayCount(null); }}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${bookingTab === 'multi-day' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-slate-400'}`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <CalendarRange size={14} />
              Multi-day
            </span>
          </button>
        </div>

        {/* Date pills + Time slot grid for Later tab */}
        {bookingTab === 'later' && (
          <div className="mb-4">
            {/* Horizontal scrollable date pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
              {datePills.map((dp, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(i); setSelectedTime(''); }}
                  className={`flex flex-col items-center min-w-[56px] px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
                    selectedDate === i
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="text-[10px]">{dp.label}</span>
                  <span className="text-sm font-bold">{dp.date}</span>
                </button>
              ))}
            </div>

            {/* Time picker */}
            <p className="text-xs font-medium text-slate-500 mb-3">Select start time of service</p>
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-2">
                {/* Hour */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      const hours = pickerPeriod === 'AM' ? [7, 8, 9, 10, 11, 12] : [12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
                      const idx = hours.indexOf(pickerHour);
                      if (idx < hours.length - 1) { setPickerHour(hours[idx + 1]); }
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <ChevronDown size={18} className="rotate-180" />
                  </button>
                  <div className="text-3xl font-bold text-slate-900 w-14 text-center tabular-nums">
                    {pickerHour.toString().padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => {
                      const hours = pickerPeriod === 'AM' ? [7, 8, 9, 10, 11, 12] : [12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
                      const idx = hours.indexOf(pickerHour);
                      if (idx > 0) { setPickerHour(hours[idx - 1]); }
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>

                <span className="text-3xl font-bold text-slate-900 mb-0.5">:</span>

                {/* Minute */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setPickerMinute(prev => (prev + 5) % 60)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <ChevronDown size={18} className="rotate-180" />
                  </button>
                  <div className="text-3xl font-bold text-slate-900 w-14 text-center tabular-nums">
                    {pickerMinute.toString().padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => setPickerMinute(prev => (prev - 5 + 60) % 60)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>

                {/* AM/PM toggle */}
                <div className="flex flex-col gap-1 ml-3">
                  <button
                    onClick={() => { setPickerPeriod('AM'); setPickerHour(7); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      pickerPeriod === 'AM'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => { setPickerPeriod('PM'); setPickerHour(12); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      pickerPeriod === 'PM'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Selected time display */}
              <div className="mt-3 text-center">
                <p className={`text-sm font-semibold ${isSelectedTimePast() ? 'text-red-500' : 'text-slate-700'}`}>
                  {isSelectedTimePast() ? 'Pick a time at least 5 mins from now' : `Selected: ${selectedTime}`}
                </p>
              </div>

              {/* Quick select pills — only show future times */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {[
                  { label: '8:00 AM', h: 8, m: 0, p: 'AM' as const, h24: 8 },
                  { label: '10:00 AM', h: 10, m: 0, p: 'AM' as const, h24: 10 },
                  { label: '12:00 PM', h: 12, m: 0, p: 'PM' as const, h24: 12 },
                  { label: '2:00 PM', h: 2, m: 0, p: 'PM' as const, h24: 14 },
                  { label: '5:00 PM', h: 5, m: 0, p: 'PM' as const, h24: 17 },
                  { label: '7:00 PM', h: 7, m: 0, p: 'PM' as const, h24: 19 },
                ].filter(q => {
                  if (selectedDate !== 0) return true; // future dates show all
                  const now = new Date();
                  const qTime = new Date();
                  qTime.setHours(q.h24, 0, 0, 0);
                  return qTime.getTime() - now.getTime() >= 5 * 60 * 1000;
                }).map(q => (
                  <button
                    key={q.label}
                    onClick={() => { setPickerHour(q.h); setPickerMinute(q.m); setPickerPeriod(q.p); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      pickerHour === q.h && pickerMinute === q.m && pickerPeriod === q.p
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-yellow-400'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Multi-day tab content */}
        {bookingTab === 'multi-day' && (
          <div className="mb-4">
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-1.5">
                <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  multiDayStep >= 1 ? 'bg-yellow-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>1</div>
                <span className={`text-xs font-semibold ${multiDayStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>Service Duration</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 mx-1">
                <div className={`h-full bg-yellow-500 transition-all duration-300 ${multiDayStep >= 2 ? 'w-full' : 'w-0'}`} />
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  multiDayStep >= 2 ? 'bg-yellow-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>2</div>
                <span className={`text-xs font-semibold ${multiDayStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>Select days</span>
              </div>
            </div>

            {/* Step 1: Select Service Duration */}
            {multiDayStep === 1 && (
              <div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {SERVICES.map(svc => (
                    <div
                      key={svc.id}
                      className="min-w-[140px] bg-white p-4 rounded-xl shadow-md border border-yellow-50 cursor-pointer hover:border-yellow-200 transition-colors"
                    >
                      <p className="text-slate-900 font-bold">{svc.duration}</p>
                      <p className="text-yellow-600 text-xs font-bold mb-3">
                        ₹{svc.price} <span className="text-slate-400 line-through font-normal">₹{svc.originalPrice}</span>
                      </p>
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{svc.discount}</span>
                      <button
                        onClick={() => { setMultiDayService(svc); setMultiDayStep(2); setMultiDayCount(null); }}
                        className="w-full mt-4 bg-yellow-500 text-white py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Number of Days */}
            {multiDayStep === 2 && multiDayService && (
              <div>
                <div className="flex items-center justify-between mb-4 bg-slate-50 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{multiDayService.duration}</p>
                    <p className="text-xs text-slate-500">₹{multiDayService.price}/session</p>
                  </div>
                  <button
                    onClick={() => { setMultiDayStep(1); setMultiDayService(null); setMultiDayCount(null); }}
                    className="text-xs font-bold text-yellow-600 underline underline-offset-2"
                  >
                    Change
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {MULTI_DAY_OPTIONS.map(option => {
                    const perSession = Math.round(multiDayService.price * (1 - option.discountPercent / 100));
                    const active = multiDayCount === option.days;
                    return (
                      <button
                        key={option.days}
                        onClick={() => setMultiDayCount(option.days)}
                        className={`p-3 rounded-xl border text-center transition-colors ${
                          active
                            ? 'bg-yellow-500 text-white border-yellow-500'
                            : 'bg-white border-slate-200 hover:border-yellow-200'
                        }`}
                      >
                        <p className={`text-lg font-bold ${active ? 'text-white' : 'text-slate-900'}`}>
                          {option.days}
                        </p>
                        <p className={`text-[10px] ${active ? 'text-yellow-100' : 'text-slate-500'}`}>days</p>
                        <p className={`text-[10px] font-bold mt-1 ${active ? 'text-white' : 'text-green-600'}`}>
                          {option.discountPercent}% extra off
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Pricing summary when day count selected */}
                {multiDayCount && (() => {
                  const option = MULTI_DAY_OPTIONS.find(o => o.days === multiDayCount)!;
                  const perSession = Math.round(multiDayService.price * (1 - option.discountPercent / 100));
                  const totalPrice = perSession * multiDayCount;
                  const totalOriginal = multiDayService.originalPrice * multiDayCount;
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-slate-600">Per session</p>
                        <p className="text-sm font-bold text-slate-900">₹{perSession}</p>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-slate-600">{multiDayCount} sessions total</p>
                        <div className="text-right">
                          <span className="text-slate-400 line-through text-xs mr-2">₹{totalOriginal}</span>
                          <span className="text-lg font-bold text-green-700">₹{totalPrice}</span>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 font-bold">
                        You save ₹{totalOriginal - totalPrice} with multi-day booking!
                      </p>
                    </div>
                  );
                })()}

                {multiDayCount && (
                  <button
                    onClick={() => {
                      const option = MULTI_DAY_OPTIONS.find(o => o.days === multiDayCount)!;
                      onBook(multiDayService, {
                        mode: 'multi-day',
                        multiDayCount: multiDayCount,
                        multiDayDiscount: option.discountPercent,
                      });
                    }}
                    className="w-full bg-yellow-500 text-white py-3 rounded-xl font-bold text-base hover:opacity-90 transition-opacity"
                  >
                    Book {multiDayCount}-day pack
                  </button>
                )}
              </div>
            )}

            {/* Benefits of multi-bookings */}
            <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
              <h4 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Star size={18} className="text-yellow-600 fill-yellow-500" />
                Benefits of multi-bookings
              </h4>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                  Extra discounts on every session — save more with more days
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                  Priority cook assignment — get preferred cooks consistently
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                  Flexible scheduling — choose different time slots for each day
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                  Free rescheduling up to 24 hours before any session
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Service cards for Now/Later tabs */}
        {bookingTab !== 'multi-day' && (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {SERVICES.map(service => (
              <div key={service.id} className="min-w-[160px] bg-white p-4 rounded-xl shadow-md border border-yellow-50">
                <p className="text-slate-900 font-bold">{service.duration}</p>
                <p className="text-yellow-600 text-xs font-bold mb-3">
                  ₹{service.price} <span className="text-slate-400 line-through font-normal">₹{service.originalPrice}</span>
                </p>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{service.discount}</span>
                <button
                  onClick={() => onBook(service)}
                  className="w-full mt-4 bg-yellow-500 text-white py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Book
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Menu, FAQs, Safety — all on same page */}
      <section className="px-4 py-6 bg-white rounded-t-3xl mt-4 shadow-2xl">

        {/* Full Food Menu */}
        <div className="mb-5">
          <h3 className="text-xl font-bold">Full Food Menu</h3>
          <p className="text-sm text-slate-500 mt-1">Indicative menu — our cooks can prepare these dishes</p>
        </div>

        {MENU_CATEGORIES.map(category => {
          const items = MENU_ITEMS.filter(item => item.category === category);
          if (!items.length) return null;
          return (
            <div key={category} className="mb-6">
              <h4 className="text-base font-bold text-slate-800 mb-3">{category}</h4>
              <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex flex-col items-center">
                    <div
                      className="w-[90px] h-[90px] rounded-full bg-cover bg-center bg-slate-100 border border-slate-100"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                    <p className="text-xs font-medium text-slate-700 text-center mt-2 leading-tight px-1">
                      {item.isNonVeg && <span className="inline-block w-3 h-3 bg-rose-600 rounded-sm mr-1 align-middle" style={{ fontSize: 0 }}>&#8203;</span>}
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Average time breakdown */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-1">Average time required to make a meal for 1-2 people</h3>
          <div className="mt-4 space-y-0 divide-y divide-slate-100">
            <div className="flex items-center gap-4 py-4">
              <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Edit2 size={20} className="text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-900">Requirement gathering</p>
                <p className="text-xs text-slate-500">Instructions & kitchen familiarity</p>
              </div>
              <p className="font-bold text-sm text-slate-900 shrink-0">10-15 mins</p>
            </div>
            <div className="flex items-center gap-4 py-4">
              <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Utensils size={20} className="text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-900">Cooking</p>
                <p className="text-xs text-slate-500">1 curry, 1 dry sabzi, bread/rice</p>
              </div>
              <p className="font-bold text-sm text-slate-900 shrink-0">40-45 mins</p>
            </div>
          </div>
          <div className="mt-3 bg-slate-50 rounded-xl px-4 py-3 flex items-start gap-2">
            <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500">Non-menu items will take longer than usual</p>
          </div>
        </div>

        {/* Guaranteed Hygiene — 2-col grid with images */}
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">Guaranteed hygiene</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { t: 'Hand wash before starting to cook', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqkmXuZKPB02B8FZyhuMq68M_qmApORhgpCO8sEHV_F-Lkfck0AfdOvAilKyKlHg0evUOtF1Exwy31qZvw0HkXJRtFqleFfPO4SAo1OQHPdWeZ5Cj7cqeJ8nkjsJUpD3vSrNZNzoM7dai6zunWZ3DGJrmQpoYKXBr2d3OuMOq7w9Srauu5OemjSjH-pwnobqvbb-U-3ZvbxD49TUuwxarJK9OhqkyeivJN5R6WqMXjnhA1a1FYTcElsNJ9ZphSlNRmLjEyV37Gc3n9' },
              { t: 'Chef cap worn at all times for hygiene', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa23x8SpQc3n1ndZfx1S7a4Tlmqgk-_cnsoLgtsIz9AEIzeCqXLHvvKh1qQO09fC6Zu0JKxklRRK_GzF8uyTeyQ5G0_n4KAaTVH8JSHhsMuRr300kdxtSYx5LWy6SrVsV8CpjzNJa0wzgWZQ8qQDz9Ys7IEo05JOAhU4l0KRB_Uha_05zwfVoblEop8mCm3JfOlAS2MkMLasruLpSgFq2Pi4m2fDnO_xHmXdsIeW50Kmc2x1l9ETt8aLjPTOV6I9CBNcOGNOsR20b-' },
              { t: 'Slab & stove cleaning post cooking', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9tDTHUbw2XAYzMPmf0tZ9w8fezuoiOCgR1X9qes0HdaQLW817T6C5tqgwGSh9r0H6b5IYicNQBmxZAATkaDSoil1gSvKCGQocA_kwqdVaTKaqzhfVOQaIg7NXP3-FK-_5OWWax0aatsgqKB8vCeM2780tCTRQFB_4wsWdsmwAuWSvWYSbzP4Zom59PStAkn8ayPOHBN3kVI9GDQr6V70u7fFmB0qUjiN3i5IuTFbNT2iNNNunQ0uJ9jhsFapUX4v4uvfV7WGTCKOs' },
              { t: 'Thorough washing of veggies', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkTEb9e00HrwGeJkeWe2IPRdAwXSDq3MfzMY38jXJqAFZsRmEt_9Ozg57MrZMCnswDEiFBTHJZwDkCjuBT7MFeOiuTHkjbLOFKoprI7iTWwQe1H1oEejzXqy23H113r8nx2GknYUY27ZMIZOe2TopBO8Cyo5GG2CDmhjHWRV3mnEgqN2f7EqMRdfW3sshopQSpf940vMSybfvQMSMizAhkqoV0Y88WzK477B1axMubPBNMpKy_RK5xhpMWLDOm7_sjqSdVvVRyUhSN' },
            ].map((h, i) => (
              <div key={i} className="bg-slate-50 rounded-xl overflow-hidden">
                <div className="p-3 pb-0">
                  <p className="text-sm font-medium text-slate-700 leading-snug">{h.t}</p>
                </div>
                <div className="h-24 mt-2 bg-cover bg-center" style={{ backgroundImage: `url('${h.img}')` }} />
              </div>
            ))}
          </div>
        </div>

        {/* What we need from you — 2x2 icon grid */}
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">What we will need from you</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { t: 'Cookware\n& utensils', i: <Utensils size={24} /> },
              { t: 'Vegetables\n& groceries', i: <ShoppingBasket size={24} /> },
              { t: 'Appliances,\nif required', i: <Zap size={24} /> },
              { t: 'Brief kitchen\ntour', i: <HomeIcon size={24} /> },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-5 flex flex-col gap-3">
                <div className="text-slate-600">{item.i}</div>
                <p className="text-sm font-medium text-slate-800 whitespace-pre-line leading-snug">{item.t}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Cooks */}
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <CheckCircle2 size={22} className="text-blue-600" />
            Verified professional cooks
          </h3>
          <ul className="space-y-2 ml-1">
            <li className="flex items-center gap-2 text-sm text-slate-700">
              <div className="size-1.5 bg-slate-400 rounded-full shrink-0" />
              ID verified
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-700">
              <div className="size-1.5 bg-slate-400 rounded-full shrink-0" />
              Trained for 100+ hours
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-700">
              <div className="size-1.5 bg-slate-400 rounded-full shrink-0" />
              Background check done by Spoon
            </li>
          </ul>
        </div>

        {/* What's excluded */}
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <XCircle size={20} className="text-yellow-600" />
            What&apos;s excluded
          </h3>
          <div className="space-y-3">
            {[
              { t: 'Kitchen deep cleaning', d: 'Our cooks will maintain cleanliness while cooking but deep cleaning of kitchen is not included.' },
              { t: 'Appliances cleaning', d: 'Cleaning of appliances like chimney, oven, fridge, etc. is not part of the service.' },
            ].map((item, i) => (
              <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3">
                <div className="size-5 shrink-0 mt-0.5 text-yellow-500">
                  <XCircle size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-800">{item.t}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <HelpCircle size={20} className="text-yellow-600" />
            FAQs
          </h3>
          <div className="space-y-2">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-4 text-left bg-white active:bg-slate-50"
                >
                  <span className="font-medium text-sm text-slate-800 pr-3">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 bg-white text-sm text-slate-600 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ratings & Reviews */}
        <div className="mt-10">
          {/* Rating summary */}
          <div className="bg-slate-50 rounded-xl p-5">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-slate-900">★ {avgRating}</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">{totalReviews >= 1000 ? `${(totalReviews / 1000).toFixed(0)}K` : totalReviews} reviews</p>

            <div className="space-y-2.5">
              {RATING_DISTRIBUTION.map((r) => (
                <div key={r.stars} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 w-6 flex items-center gap-1">★ {r.stars}</span>
                  <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full"
                      style={{ width: `${(r.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{r.count >= 1000 ? `${(r.count / 1000).toFixed(0)}K` : r.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* All reviews header */}
          <div className="flex items-center justify-between mt-8 mb-4">
            <h3 className="text-xl font-bold">All reviews</h3>
            <button
              onClick={() => setShowFilterModal(true)}
              className="text-sm font-medium text-indigo-600"
            >
              Filter
            </button>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {['Most detailed', 'In my area', 'Frequent users'].map((chip) => (
              <button
                key={chip}
                onClick={() => setReviewFilter(reviewFilter === chip ? null : chip)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                  reviewFilter === chip
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Review cards */}
          <div className="space-y-0 divide-y divide-slate-100">
            {filteredReviews.map((review, i) => (
              <div key={i} className="py-5 first:pt-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{review.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{review.date} • For {review.duration}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-white text-xs font-bold ${
                    review.rating >= 4 ? 'bg-emerald-600' : review.rating >= 3 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`}>
                    ★ {review.rating}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilterModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-2xl min-h-[60vh] flex flex-col">
            {/* Modal header */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Filters</h3>
                <button onClick={() => setShowFilterModal(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>
              {/* Tabs */}
              <div className="flex gap-6 mt-4">
                {(['rating', 'sortBy', 'services', 'others'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilterTab(tab)}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      activeFilterTab === tab
                        ? 'text-slate-900 border-slate-900'
                        : 'text-slate-400 border-transparent'
                    }`}
                  >
                    {tab === 'sortBy' ? 'Sort By' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal content */}
            <div className="flex-1 p-4">
              {activeFilterTab === 'rating' && (
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <label key={star} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(star)}
                        onChange={() => {
                          setSelectedRatings(prev =>
                            prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
                          );
                        }}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{star} Star</span>
                    </label>
                  ))}
                </div>
              )}
              {activeFilterTab === 'sortBy' && (
                <div className="space-y-4">
                  {['Recent', 'Most detailed'].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sortBy"
                        checked={sortBy === option}
                        onChange={() => setSortBy(option)}
                        className="w-5 h-5 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              {activeFilterTab === 'services' && (
                <div className="space-y-4">
                  {['1 hour', '1.5 hours', '2 hours', '3 hrs', '4 hours', '2.5 hours'].map((svc) => (
                    <label key={svc} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(svc)}
                        onChange={() => {
                          setSelectedServices(prev =>
                            prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]
                          );
                        }}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{svc}</span>
                    </label>
                  ))}
                </div>
              )}
              {activeFilterTab === 'others' && (
                <div className="space-y-4">
                  {['In my area', 'Frequent users'].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOthers.includes(opt)}
                        onChange={() => {
                          setSelectedOthers(prev =>
                            prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
                          );
                        }}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => { setSelectedRatings([]); setSortBy(null); setSelectedServices([]); setSelectedOthers([]); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

const CartPage = ({
  service,
  bookingInfo = { mode: 'now' },
  onConfirm,
  onRemove,
  user,
  selectedAddress,
  onNavigateToAddress,
  loading
}: {
  key?: string;
  service: Service;
  bookingInfo?: BookingInfo;
  onConfirm: () => void;
  onRemove?: () => void;
  user: { name: string | null; phone: string } | null;
  selectedAddress: Address | null;
  onNavigateToAddress: () => void;
  loading: boolean;
}) => {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [showCancelPolicy, setShowCancelPolicy] = useState(false);

  const isMultiDay = bookingInfo.mode === 'multi-day';
  const dayCount = bookingInfo.multiDayCount || 1;
  const discountPercent = bookingInfo.multiDayDiscount || 0;
  const perSessionPrice = isMultiDay ? Math.round(service.price * (1 - discountPercent / 100)) : service.price;
  const itemTotal = perSessionPrice * dayCount;
  const originalTotal = service.originalPrice * dayCount;
  const savings = originalTotal - itemTotal;
  const taxesFee = 15;
  const totalAmount = itemTotal + taxesFee + (selectedTip || 0);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="pb-40 min-h-screen bg-white"
    >
      {/* Savings banner */}
      <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 flex items-center gap-3">
        <div className="text-yellow-600">
          <Ticket size={20} />
        </div>
        <p className="text-sm font-medium text-slate-800">Saving ₹{savings} on this order</p>
      </div>

      {/* Service details */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-yellow-600">Spoon</h2>
            <p className="text-sm text-slate-500">Professional home cooking</p>
          </div>
          <div className="text-right">
            <p className="text-base font-bold text-slate-900">₹{itemTotal}</p>
            <p className="text-xs text-slate-400 line-through">₹{originalTotal}</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-sm font-medium text-yellow-600 px-4 py-1.5 rounded-full border border-yellow-200 bg-yellow-50 mb-3"
        >
          Remove
        </button>
        <ul className="space-y-1.5 mt-2">
          <li className="flex items-center gap-2 text-sm text-slate-600">
            <div className="size-1.5 bg-slate-400 rounded-full shrink-0" />
            {service.duration}{isMultiDay ? ' per session' : ''}
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-600">
            <div className="size-1.5 bg-slate-400 rounded-full shrink-0" />
            {isMultiDay ? `${dayCount}-day pack (${dayCount} sessions)` : 'Scheduled for today'}
          </li>
        </ul>
      </div>

      {/* Coupons and offers */}
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-emerald-600">
            <Ticket size={20} />
          </div>
          <p className="text-sm font-medium text-slate-800">Coupons and offers</p>
        </div>
        <button className="text-sm font-medium text-yellow-600 flex items-center gap-1">
          7 offers <ChevronRight size={16} />
        </button>
      </div>

      {/* Contact info */}
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Phone size={18} className="text-slate-600" />
          <div>
            <p className="text-sm font-medium text-slate-800">{user?.name || 'Guest'},</p>
            <p className="text-sm text-slate-500">{user?.phone || ''}</p>
          </div>
        </div>
        <button className="text-sm font-medium text-yellow-600">Change</button>
      </div>

      {/* Delivery address */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <MapPin size={18} className={selectedAddress ? 'text-yellow-600 mt-0.5' : 'text-slate-400 mt-0.5'} />
            {selectedAddress ? (
              <div>
                <p className="text-sm font-medium text-slate-800">{selectedAddress.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}</p>
                <p className="text-xs text-slate-400">{selectedAddress.city} - {selectedAddress.pincode}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-400">No address selected</p>
                <p className="text-xs text-slate-400 mt-0.5">Add a delivery address to proceed</p>
              </div>
            )}
          </div>
          <button
            onClick={onNavigateToAddress}
            className="text-sm font-medium text-yellow-600 shrink-0"
          >
            {selectedAddress ? 'Change' : 'Add'}
          </button>
        </div>
      </div>

      {/* Payment summary */}
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Payment summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-slate-600">Item total</p>
              <p className="text-xs text-slate-400">₹{perSessionPrice} x {dayCount} {dayCount > 1 ? 'services' : 'service'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 line-through text-xs">₹{originalTotal}</span>
              <span className="text-slate-900 font-medium">₹{itemTotal}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-slate-600 border-b border-dashed border-slate-300 pb-0.5">Taxes and Fee</p>
            <p className="text-slate-900 font-medium">₹{taxesFee}</p>
          </div>
          {selectedTip ? (
            <div className="flex justify-between text-sm">
              <p className="text-slate-600">Tip</p>
              <p className="text-slate-900 font-medium">₹{selectedTip}</p>
            </div>
          ) : null}
          <div className="h-[1px] bg-slate-100 w-full my-1"></div>
          <div className="flex justify-between items-center pt-1">
            <p className="font-bold text-slate-900">Total amount</p>
            <p className="font-bold text-slate-900">₹{totalAmount}</p>
          </div>
          <div className="h-[1px] bg-slate-100 w-full my-1"></div>
          <div className="flex justify-between items-center pt-1">
            <p className="font-bold text-slate-900">Amount to pay</p>
            <p className="font-bold text-slate-900">₹{totalAmount}</p>
          </div>
        </div>
      </div>

      {/* Add a tip */}
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Add a tip to thank the Professional</h2>
        <div className="flex gap-3 mb-3">
          {[
            { amount: 25, label: '₹ 25', popular: false },
            { amount: 50, label: '₹ 50', popular: true },
            { amount: 75, label: '₹ 75', popular: false },
            { amount: 100, label: '₹ 100', popular: false },
          ].map((tip) => (
            <button
              key={tip.amount}
              onClick={() => setSelectedTip(selectedTip === tip.amount ? null : tip.amount)}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium relative transition-colors ${
                selectedTip === tip.amount
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {tip.label}
              {tip.popular && (
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                  POPULAR
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => setSelectedTip(selectedTip && ![25, 50, 75, 100].includes(selectedTip) ? null : 0)}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700"
          >
            Custom
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-4">100% of the tip goes to the professional.</p>
      </div>

      {/* Cancellation policy */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Cancellation policy</h2>
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
            <div className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-2" />
            Free cancellations if done more than 12 hrs before the service. A fee will be charged otherwise.
          </li>
          <li className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
            <div className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-2" />
            A fee may be charged if the pack is cancelled after partial use.
          </li>
        </ul>
        <button
          onClick={() => setShowCancelPolicy(true)}
          className="text-sm font-bold text-slate-900 mt-3 underline underline-offset-2"
        >
          Read full policy
        </button>
      </div>

      {/* Cancellation policy modal */}
      {showCancelPolicy && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelPolicy(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowCancelPolicy(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            {/* Policy content */}
            <div className="p-5 pt-6">
              <h3 className="text-xl font-bold text-slate-900 mb-5">Cancellation policy</h3>
              <div className="border-t border-slate-100">
                {/* Table header */}
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-900">Time</span>
                  <span className="text-sm font-bold text-slate-900">Fee</span>
                </div>
                {/* Rows */}
                {[
                  { time: 'More than 12 hrs before the service', fee: 'Free', freeStyle: true },
                  { time: 'Within 12 hrs of the service', fee: 'Up to ₹25', freeStyle: false },
                  { time: 'Within 3 hrs of the service', fee: 'Up to ₹50', freeStyle: false },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-dashed border-slate-200">
                    <span className="text-sm text-slate-700 pr-4">{row.time}</span>
                    <span className={`text-sm font-medium whitespace-nowrap ${row.freeStyle ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {row.fee}
                    </span>
                  </div>
                ))}
              </div>

              {/* Info note */}
              <div className="flex gap-2 mt-4 mb-5">
                <Info size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700 leading-relaxed">
                  If request is rescheduled, then cancelled, fee will be applied as per original booking time
                </p>
              </div>

              {/* Fee goes to professional */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-900 mb-1">This fee goes to the professional</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Their time is reserved for the service &amp; they cannot get another job for the reserved time
                  </p>
                </div>
              </div>

              {/* Okay button */}
              <button
                onClick={() => setShowCancelPolicy(false)}
                className="w-full py-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100">
        <div className="p-4">
          {selectedAddress ? (
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full bg-yellow-500 text-white font-bold h-14 rounded-2xl shadow-lg shadow-yellow-200 flex items-center justify-center gap-2 disabled:opacity-50 text-base"
            >
              {loading ? 'Booking...' : `Pay ₹${totalAmount}`}
            </button>
          ) : (
            <button
              onClick={onNavigateToAddress}
              className="w-full bg-yellow-500 text-white font-bold h-14 rounded-2xl shadow-lg shadow-yellow-200 flex items-center justify-center gap-2 text-base"
            >
              <MapPin size={18} />
              Add address and slot
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Tracking Page (real-time) ---

const STATUS_ORDER = ['CREATED', 'SEARCHING_COOK', 'COOK_ASSIGNED', 'COOK_ARRIVING', 'COOKING', 'COMPLETED'];

const STEPS = [
  { label: 'Order Placed', status: 'CREATED' },
  { label: 'Finding Cook', status: 'SEARCHING_COOK' },
  { label: 'Cook Assigned', status: 'COOK_ASSIGNED' },
  { label: 'Cook En Route', status: 'COOK_ARRIVING' },
  { label: 'Cooking In Progress', status: 'COOKING' },
  { label: 'Session Complete', status: 'COMPLETED' },
];

const STATUS_MESSAGES: Record<string, (cookName?: string) => string> = {
  'CREATED': () => 'Your order has been placed.',
  'SEARCHING_COOK': () => 'Looking for the best cook near you...',
  'COOK_ASSIGNED': (c) => `${c || 'A cook'} has accepted your order!`,
  'COOK_ARRIVING': (c) => `${c || 'Your cook'} is on the way to your kitchen.`,
  'COOKING': () => 'Your cook is preparing your meal!',
  'COMPLETED': () => 'Cooking session is complete. Enjoy your meal!',
  'CANCELLED': () => 'This order has been cancelled.',
};

const TrackingPage = ({ order, onRate }: { key?: string; order: Order | null; onRate?: () => void }) => {
  // Live session timer
  const [elapsed, setElapsed] = useState(0);
  const [arrivalDots, setArrivalDots] = useState(0);

  useEffect(() => {
    if (!order) return;
    if (order.status === 'COOKING' && order.cookingStartedAt) {
      const startTime = new Date(order.cookingStartedAt).getTime();
      const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }
    if (order.status === 'COMPLETED' && order.cookingStartedAt && order.cookingEndedAt) {
      const start = new Date(order.cookingStartedAt).getTime();
      const end = new Date(order.cookingEndedAt).getTime();
      setElapsed(Math.floor((end - start) / 1000));
    }
  }, [order?.status, order?.cookingStartedAt, order?.cookingEndedAt]);

  // Animated dots for arrival status
  useEffect(() => {
    if (order?.status === 'COOK_ARRIVING' || order?.status === 'SEARCHING_COOK') {
      const id = setInterval(() => setArrivalDots(d => (d + 1) % 4), 500);
      return () => clearInterval(id);
    }
  }, [order?.status]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!order) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBasket size={48} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No active order to track</p>
        </div>
      </motion.div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const cookName = order.cook?.name || undefined;
  const getMessage = STATUS_MESSAGES[order.status];
  const message = getMessage ? getMessage(cookName) : '';
  const bookedSeconds = order.serviceDuration * 60;
  const progressPercent = bookedSeconds > 0 ? Math.min((elapsed / bookedSeconds) * 100, 100) : 0;

  // Circular timer math
  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeOffset = CIRCUMFERENCE - (progressPercent / 100) * CIRCUMFERENCE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="pb-24 min-h-screen"
      style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #f8f8f5 40%)' }}
    >
      {/* ── Hero status banner ── */}
      <div className="p-4 pb-2">
        <div className={`rounded-2xl p-5 shadow-sm ${
          order.status === 'CANCELLED' ? 'bg-red-50 border border-red-100' :
          order.status === 'COMPLETED' ? 'bg-green-50 border border-green-100' :
          order.status === 'COOKING' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-white border border-slate-100'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex-shrink-0 size-10 rounded-xl flex items-center justify-center ${
              order.status === 'SEARCHING_COOK' ? 'bg-yellow-100' :
              order.status === 'COOK_ASSIGNED' ? 'bg-blue-100' :
              order.status === 'COOK_ARRIVING' ? 'bg-amber-100' :
              order.status === 'COOKING' ? 'bg-yellow-100' :
              order.status === 'COMPLETED' ? 'bg-green-100' :
              'bg-red-100'
            }`}>
              {order.status === 'SEARCHING_COOK' && <Search size={18} className="text-yellow-600 animate-pulse" />}
              {order.status === 'COOK_ASSIGNED' && <CheckCircle2 size={18} className="text-blue-600" />}
              {order.status === 'COOK_ARRIVING' && <MapPin size={18} className="text-amber-600" />}
              {order.status === 'COOKING' && <Zap size={18} className="text-yellow-600" />}
              {order.status === 'COMPLETED' && <CheckCircle2 size={18} className="text-green-600" />}
              {order.status === 'CANCELLED' && <XCircle size={18} className="text-red-500" />}
              {order.status === 'CREATED' && <Clock size={18} className="text-slate-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-base text-slate-900">
                  {order.status === 'SEARCHING_COOK' ? `Finding your cook${'.'.repeat(arrivalDots)}` :
                   order.status === 'COOK_ASSIGNED' ? 'Cook Assigned!' :
                   order.status === 'COOK_ARRIVING' ? 'Cook is on the way' :
                   order.status === 'COOKING' ? 'Cooking in progress' :
                   order.status === 'COMPLETED' ? 'Session Complete' :
                   order.status === 'CANCELLED' ? 'Order Cancelled' :
                   'Order Placed'}
                </h3>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Searching animation bar */}
          {order.status === 'SEARCHING_COOK' && (
            <div className="mt-4 w-full h-1.5 bg-yellow-100 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-yellow-400 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"
                style={{ animation: 'shimmer 1.5s ease-in-out infinite' }} />
            </div>
          )}
        </div>
      </div>

      {/* ── Circular live session timer ── */}
      {(order.status === 'COOKING' || (order.status === 'COMPLETED' && order.cookingStartedAt)) && (
        <div className="px-4 mb-3">
          <div className={`rounded-2xl p-6 shadow-sm ${
            order.status === 'COOKING' ? 'bg-white border-2 border-yellow-300' : 'bg-white border border-green-200'
          }`}>
            <div className="flex items-center gap-6">
              {/* Circular progress ring */}
              <div className="relative flex-shrink-0">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  {/* Background ring */}
                  <circle cx="64" cy="64" r={RADIUS} fill="none"
                    stroke={order.status === 'COOKING' ? '#fef3c7' : '#dcfce7'} strokeWidth="8" />
                  {/* Progress ring */}
                  <circle cx="64" cy="64" r={RADIUS} fill="none"
                    stroke={order.status === 'COOKING' ? '#f59e0b' : '#22c55e'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeOffset}
                    transform="rotate(-90 64 64)"
                    style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold tabular-nums tracking-tight ${
                    order.status === 'COOKING' ? 'text-slate-900' : 'text-green-700'
                  }`}>
                    {formatTimer(elapsed)}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    {order.status === 'COOKING' ? 'elapsed' : 'total'}
                  </span>
                </div>
              </div>

              {/* Timer details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {order.status === 'COOKING' ? 'Live Session' : 'Session Summary'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Booked</span>
                    <span className="text-sm font-bold text-slate-700">{order.serviceDuration} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Elapsed</span>
                    <span className="text-sm font-bold text-slate-700">{Math.floor(elapsed / 60)} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Remaining</span>
                    <span className={`text-sm font-bold ${
                      order.status === 'COMPLETED' ? 'text-green-600' :
                      (bookedSeconds - elapsed) < 300 ? 'text-red-500' : 'text-slate-700'
                    }`}>
                      {order.status === 'COMPLETED'
                        ? 'Done'
                        : `${Math.max(0, Math.floor((bookedSeconds - elapsed) / 60))} min`
                      }
                    </span>
                  </div>
                </div>
                {order.status === 'COOKING' && (
                  <div className="mt-3 w-full bg-yellow-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-yellow-400 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cook assignment card ── */}
      {order.cook && (
        <div className="px-4 mb-3">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
            {/* Cook header with gradient accent */}
            <div className="px-5 pt-5 pb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Your Cook</p>
              <div className="flex items-center gap-4">
                {/* Avatar with status ring */}
                <div className="relative flex-shrink-0">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    order.cook.avatarUrl ? '' : 'bg-gradient-to-br from-yellow-100 to-amber-200'
                  }`}>
                    {order.cook.avatarUrl ? (
                      <img src={order.cook.avatarUrl} alt={order.cook.name || 'Cook'}
                        className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-yellow-700">
                        {(order.cook.name || 'C').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {/* Online/active indicator */}
                  {['COOK_ARRIVING', 'COOKING'].includes(order.status) && (
                    <div className="absolute -bottom-0.5 -right-0.5 size-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="size-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 truncate">{order.cook.name}</h3>
                    <ShieldCheck size={16} className="flex-shrink-0 text-blue-500" />
                  </div>
                  {order.cook.cookProfile && (
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 bg-yellow-50 rounded-full px-2 py-0.5">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-slate-700">
                          {order.cook.cookProfile.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {order.cook.cookProfile.yearsOfExperience}y exp
                      </span>
                      <span className="text-xs text-slate-500">
                        {order.cook.cookProfile.totalSessions} sessions
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Arrival status strip ── */}
            {order.status === 'COOK_ARRIVING' && (
              <div className="mx-5 mb-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-amber-100 flex items-center justify-center">
                      <MapPin size={14} className="text-amber-600" />
                    </div>
                    <span className="text-sm font-bold text-amber-800">
                      On the way{'.'.repeat(arrivalDots)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 rounded-full px-2.5 py-1">
                    ~10 min
                  </span>
                </div>
                {/* Arrival route visualization */}
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="size-2.5 rounded-full bg-amber-400" />
                  <div className="flex-1 flex items-center gap-0.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                        i < 3 + arrivalDots ? 'bg-amber-400' : 'bg-amber-200'
                      }`} />
                    ))}
                  </div>
                  <div className="size-2.5 rounded-full bg-amber-200 border border-amber-400" />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-amber-500 font-medium">Cook</span>
                  <span className="text-[10px] text-amber-500 font-medium">Your kitchen</span>
                </div>
              </div>
            )}

            {order.status === 'COOK_ASSIGNED' && (
              <div className="mx-5 mb-4 rounded-xl bg-blue-50 border border-blue-100 p-3 flex items-center gap-3">
                <div className="size-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-800">Assigned &amp; confirmed</p>
                  <p className="text-xs text-blue-500">Preparing to head out to your location</p>
                </div>
              </div>
            )}

            {order.status === 'COOKING' && (
              <div className="mx-5 mb-4 rounded-xl bg-green-50 border border-green-100 p-3 flex items-center gap-3">
                <div className="size-7 rounded-lg bg-green-100 flex items-center justify-center animate-pulse">
                  <Zap size={14} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">Cooking in progress</p>
                  <p className="text-xs text-green-500">Preparing your meal in your kitchen</p>
                </div>
              </div>
            )}

            {/* Contact actions */}
            <div className="px-5 pb-5 flex gap-3">
              <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 active:scale-[0.97] text-white h-11 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all">
                <Phone size={16} />
                <span>Call</span>
              </button>
              <button className="flex-1 border-2 border-slate-200 hover:border-yellow-400 text-slate-600 hover:text-yellow-600 h-11 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all">
                <MessageSquare size={16} />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Progress timeline ── */}
      {order.status !== 'CANCELLED' && (
        <div className="px-4 mb-3">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <h4 className="text-slate-800 font-bold mb-4">Order Progress</h4>
            <div className="relative">
              {STEPS.map((step, idx) => {
                const stepIdx = STATUS_ORDER.indexOf(step.status);
                const isTerminal = order.status === 'COMPLETED';
                const isDone = stepIdx < currentIdx || (isTerminal && stepIdx === currentIdx);
                const isCurrent = !isTerminal && stepIdx === currentIdx;
                const isLast = idx === STEPS.length - 1;

                return (
                  <div key={step.status} className="flex gap-3" style={{ minHeight: isLast ? 0 : 44 }}>
                    {/* Vertical connector + node */}
                    <div className="flex flex-col items-center" style={{ width: 24 }}>
                      {isDone ? (
                        <div className="size-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 z-10">
                          <Check size={14} className="text-white" />
                        </div>
                      ) : isCurrent ? (
                        <div className="size-6 rounded-full border-2 border-yellow-400 bg-yellow-50 flex items-center justify-center animate-pulse flex-shrink-0 z-10">
                          <div className="size-2.5 bg-yellow-400 rounded-full" />
                        </div>
                      ) : (
                        <div className="size-6 rounded-full border-2 border-slate-200 flex items-center justify-center flex-shrink-0 z-10 bg-white">
                          <div className="size-2 bg-slate-200 rounded-full" />
                        </div>
                      )}
                      {!isLast && (
                        <div className={`w-0.5 flex-1 ${
                          isDone ? 'bg-green-300' : 'bg-slate-100'
                        }`} />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pb-4 flex-1 min-w-0">
                      <span className={`text-sm leading-6 ${
                        isCurrent ? 'font-bold text-slate-900' :
                        isDone ? 'font-medium text-slate-600' :
                        'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Order details ── */}
      <div className="px-4 mb-3">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
          <h4 className="text-slate-800 font-bold mb-3">Order Details</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={14} />
                <span>Duration</span>
              </div>
              <span className="font-medium text-slate-800">{order.serviceDuration} minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={14} />
                <span>Scheduled</span>
              </div>
              <span className="font-medium text-slate-800">
                {new Date(order.scheduledAt).toLocaleString([], {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            {order.address && (
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={14} />
                  <span>Address</span>
                </div>
                <span className="font-medium text-slate-800 text-right max-w-[180px] truncate">
                  {order.address.line1}, {order.address.city}
                </span>
              </div>
            )}
            <div className="h-[1px] bg-slate-100 w-full"></div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-lg text-yellow-600">₹{order.totalAmount / 100}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cancel reason ── */}
      {order.status === 'CANCELLED' && order.cancelReason && (
        <div className="px-4 mb-3">
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700 mb-0.5">Cancellation Reason</p>
                <p className="text-sm text-red-600">{order.cancelReason}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Rate your cook CTA ── */}
      {order.status === 'COMPLETED' && !order.review && onRate && (
        <div className="px-4 mt-2 mb-3">
          <button
            onClick={onRate}
            className="w-full bg-yellow-500 hover:bg-yellow-600 active:scale-[0.98] text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Star size={18} />
            Rate your cook
          </button>
        </div>
      )}

      {/* Already reviewed indicator */}
      {order.status === 'COMPLETED' && order.review && (
        <div className="px-4 mt-2 mb-3">
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-center gap-3">
            <div className="size-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Check size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-800">Review submitted</p>
              <div className="flex items-center gap-1 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < (order.review?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// --- Rating Page ---

const RATING_LABELS = ['', 'Poor', 'Below average', 'Average', 'Good', 'Excellent'];

const RatingPage = ({
  order,
  onDone,
}: {
  key?: string;
  order: Order | null;
  onDone: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const activeStar = hoveredStar || rating;

  const handleSubmit = async () => {
    if (!order || rating === 0) return;
    setSubmitting(true);
    setError('');
    try {
      await reviewsApi.create({
        orderId: order.id,
        rating,
        comment: comment.trim() || undefined,
      });
      setSubmitted(true);
      setTimeout(onDone, 1800);
    } catch (e: any) {
      setError(e.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  if (!order) return null;

  const cookName = order.cook?.name || 'your cook';

  // Success state
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pb-24 min-h-screen flex items-center justify-center px-6"
        style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8f8f5 50%)' }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <ThumbsUp size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank you!</h2>
          <p className="text-slate-500">Your feedback helps {cookName} improve.</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="pb-24 min-h-screen"
      style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #f8f8f5 40%)' }}
    >
      {/* Cook summary card */}
      <div className="px-4 pt-6 pb-2">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
          {/* Cook avatar */}
          <div className="relative mx-auto mb-4 w-20 h-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-100 to-amber-200">
              {order.cook?.avatarUrl ? (
                <img
                  src={order.cook.avatarUrl}
                  alt={cookName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-yellow-700">
                  {cookName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 size-7 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-1">
            How was your session?
          </h2>
          <p className="text-slate-500 text-sm">
            Rate your experience with {cookName}
          </p>

          {/* Star rating */}
          <div className="flex items-center justify-center gap-2 mt-6 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                className="transition-transform duration-150 hover:scale-110 active:scale-95 p-1"
              >
                <Star
                  size={36}
                  className={`transition-colors duration-150 ${
                    star <= activeStar
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating label */}
          <div className="h-6">
            {activeStar > 0 && (
              <motion.p
                key={activeStar}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm font-bold ${
                  activeStar >= 4 ? 'text-emerald-600' :
                  activeStar >= 3 ? 'text-yellow-600' :
                  'text-orange-500'
                }`}
              >
                {RATING_LABELS[activeStar]}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Review text area */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <label className="text-sm font-bold text-slate-700 mb-2 block">
            Write a review <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience — the food, hygiene, punctuality..."
            maxLength={1000}
            rows={4}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 outline-none resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-300">{comment.length}/1000</p>
          </div>
        </div>
      </div>

      {/* Session recap */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Session recap</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Duration</span>
              <span className="font-medium text-slate-700">{order.serviceDuration} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-medium text-slate-700">
                {new Date(order.scheduledAt).toLocaleDateString([], {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Amount</span>
              <span className="font-bold text-yellow-600">₹{order.totalAmount / 100}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 mt-3">
          <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl py-2">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <div className="px-4 mt-6">
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full bg-yellow-500 hover:bg-yellow-600 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-yellow-500 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send size={18} />
              Submit Review
            </>
          )}
        </button>
        <button
          onClick={onDone}
          className="w-full mt-3 text-slate-400 hover:text-slate-600 text-sm font-medium py-2 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </motion.div>
  );
};

// --- Orders Page ---

const ORDER_TIMELINE_STEPS = [
  { status: 'CREATED', label: 'Order Placed', icon: ShoppingBasket },
  { status: 'SEARCHING_COOK', label: 'Finding Cook', icon: Search },
  { status: 'COOK_ASSIGNED', label: 'Cook Assigned', icon: User },
  { status: 'COOK_ARRIVING', label: 'Cook En Route', icon: MapPin },
  { status: 'COOKING', label: 'Cooking', icon: Utensils },
  { status: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
];

const statusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-700';
    case 'CANCELLED': return 'bg-red-100 text-red-600';
    case 'COOKING': return 'bg-orange-100 text-orange-700';
    case 'COOK_ARRIVING': return 'bg-blue-100 text-blue-700';
    case 'COOK_ASSIGNED': return 'bg-indigo-100 text-indigo-700';
    case 'SEARCHING_COOK': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const statusIndex = (status: string) =>
  ORDER_TIMELINE_STEPS.findIndex(s => s.status === status);

const OrderCard = ({ order, onView }: { order: Order; onView: () => void }) => {
  const [expanded, setExpanded] = React.useState(false);
  const currentIdx = statusIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isCompleted = order.status === 'COMPLETED';
  const dt = new Date(order.scheduledAt);
  const formattedDate = dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      {/* Main card â always visible */}
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-slate-900 text-base">{order.serviceDuration} min session</p>
            <p className="text-slate-400 text-xs mt-0.5">{formattedDate} at {formattedTime}</p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge(order.status)}`}>
            {order.status === 'COOK_ARRIVING' ? 'EN ROUTE' : order.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Cook info */}
        {order.cook && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {order.cook.avatarUrl
                ? <img src={order.cook.avatarUrl} alt="" className="w-full h-full object-cover" />
                : <Utensils size={18} className="text-yellow-600" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{order.cook.name || 'Your Cook'}</p>
              {order.cook.cookProfile && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-0.5"><Star size={11} className="text-yellow-500" /> {order.cook.cookProfile.rating.toFixed(1)}</span>
                  <span>{order.cook.cookProfile.totalSessions} sessions</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Address snippet */}
        {order.address && (
          <div className="flex items-start gap-1.5 mb-3">
            <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-500 truncate">{order.address.line1}, {order.address.city}</p>
          </div>
        )}

        {/* Price + expand toggle */}
        <div className="flex justify-between items-center">
          <p className="font-bold text-yellow-600 text-lg">â¹{(order.totalAmount / 100).toLocaleString('en-IN')}</p>
          <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-slate-100 px-4 pb-4"
        >
          {/* Price breakdown */}
          <div className="pt-3 pb-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Service fee</span><span>â¹{order.serviceCharge / 100}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax</span><span>â¹{order.taxAmount / 100}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span><span>-â¹{order.discountAmount / 100}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-dashed border-slate-200">
              <span>Total</span><span>â¹{(order.totalAmount / 100).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment status */}
          {order.payment && (
            <div className="flex items-center gap-1.5 text-xs mb-3">
              <div className={`w-1.5 h-1.5 rounded-full ${order.payment.status === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-slate-500">Payment {order.payment.status.toLowerCase()}</span>
            </div>
          )}

          {/* Cancellation reason */}
          {isCancelled && order.cancelReason && (
            <div className="bg-red-50 rounded-lg p-2.5 mb-3 text-xs text-red-600">
              <span className="font-semibold">Cancelled:</span> {order.cancelReason}
            </div>
          )}

          {/* Review snippet */}
          {order.review && (
            <div className="bg-yellow-50 rounded-lg p-2.5 mb-3">
              <div className="flex items-center gap-1 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < order.review!.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'} />
                ))}
              </div>
              {order.review.comment && <p className="text-xs text-slate-600 mt-1">{order.review.comment}</p>}
            </div>
          )}

          {/* Timeline */}
          {!isCancelled && (
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-700 mb-2">Order Timeline</p>
              <div className="relative pl-5">
                {ORDER_TIMELINE_STEPS.map((step, i) => {
                  const done = i <= currentIdx;
                  const isActive = i === currentIdx;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.status} className="relative pb-4 last:pb-0">
                      {/* Connector line */}
                      {i < ORDER_TIMELINE_STEPS.length - 1 && (
                        <div className={`absolute left-[-13px] top-5 w-0.5 h-full ${i < currentIdx ? 'bg-green-400' : 'bg-slate-200'}`} />
                      )}
                      {/* Dot */}
                      <div className={`absolute left-[-18px] top-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                        done
                          ? isActive && !isCompleted
                            ? 'bg-yellow-500 ring-2 ring-yellow-200'
                            : 'bg-green-500'
                          : 'bg-slate-200'
                      }`}>
                        {done ? <Check size={10} className="text-white" /> : <Circle size={8} className="text-slate-400" />}
                      </div>
                      {/* Label */}
                      <div className="flex items-center gap-1.5">
                        <StepIcon size={13} className={done ? 'text-slate-700' : 'text-slate-400'} />
                        <span className={`text-xs ${done ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>{step.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex gap-2">
            {(order.status === 'COOKING' || order.status === 'COOK_ARRIVING' || order.status === 'COOK_ASSIGNED') && (
              <button onClick={(e) => { e.stopPropagation(); onView(); }} className="flex-1 bg-yellow-500 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-yellow-600 transition-colors">
                Track Live
              </button>
            )}
            {isCompleted && !order.review && (
              <button onClick={(e) => { e.stopPropagation(); onView(); }} className="flex-1 bg-yellow-500 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-yellow-600 transition-colors">
                Leave Review
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const OrdersPage = ({
  orders,
  loading,
  onViewOrder
}: {
  key?: string;
  orders: Order[];
  loading: boolean;
  onViewOrder: (order: Order) => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pb-24 min-h-screen bg-slate-50"
  >
    <div className="px-4 py-5">
      <h2 className="text-lg font-bold text-slate-900 mb-4">My Orders</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingBasket size={28} className="text-yellow-500" />
          </div>
          <p className="text-slate-700 font-bold text-base">No orders yet</p>
          <p className="text-slate-400 text-sm mt-1 max-w-[240px] mx-auto">Book your first professional home cooking session from the home page!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onView={() => onViewOrder(order)}
            />
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

// --- Menu Page ---


const MenuPage = (_props: { key?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pb-24"
  >
    <div className="px-5 pt-8 pb-4">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Full food menu</h1>
    </div>

    <section className="mt-4">
      <div className="px-5 py-3">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Breakfast
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-200 border border-orange-200"></span>
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 px-5 pb-8">
        {MENU_ITEMS.filter(i => i.category === 'Breakfast').map(item => (
          <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
            <img
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              src={item.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <p className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white leading-tight">{item.name}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="mt-2 border-t border-slate-50">
      <div className="px-5 py-5">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Main Course
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-200 border border-orange-200"></span>
        </h2>
      </div>
      <div className="flex flex-col gap-1 px-5">
        {MENU_ITEMS.filter(i => i.category === 'Main Course').map(item => (
          <div key={item.id} className="flex items-center justify-between py-4 border-b border-slate-50 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">{item.name}</span>
              <span className="text-xs text-slate-500">{item.description}</span>
            </div>
            <div className="h-14 w-14 rounded-lg bg-yellow-50 overflow-hidden">
              <img alt={item.name} className="h-full w-full object-cover" src={item.image} />
            </div>
          </div>
        ))}
      </div>
    </section>
  </motion.div>
);

// --- Safety Page ---

const SafetyPage = (_props: { key?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pb-24 bg-yellow-50 min-h-screen"
  >
    <div className="px-4 py-4">
      <div
        className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[180px] relative"
        style={{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 60%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAkTEb9e00HrwGeJkeWe2IPRdAwXSDq3MfzMY38jXJqAFZsRmEt_9Ozg57MrZMCnswDEiFBTHJZwDkCjuBT7MFeOiuTHkjbLOFKoprI7iTWwQe1H1oEejzXqy23H113r8nx2GknYUY27ZMIZOe2TopBO8Cyo5GG2CDmhjHWRV3mnEgqN2f7EqMRdfW3sshopQSpf940vMSybfvQMSMizAhkqoV0Y88WzK477B1axMubPBNMpKy_RK5xhpMWLDOm7_sjqSdVvVRyUhSN')` }}
      >
        <div className="flex p-5 flex-col gap-1">
          <p className="text-white text-2xl font-bold leading-tight">Safety first, always</p>
          <p className="text-white/90 text-sm">Professional home cooking standards</p>
        </div>
      </div>
    </div>

    <section className="mt-4">
      <div className="px-4 mb-4">
        <h2 className="text-slate-900 text-xl font-bold tracking-tight">Guaranteed hygiene</h2>
      </div>
      <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar">
        {[
          { t: "Hand washing", s: "Before & after", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqkmXuZKPB02B8FZyhuMq68M_qmApORhgpCO8sEHV_F-Lkfck0AfdOvAilKyKlHg0evUOtF1Exwy31qZvw0HkXJRtFqleFfPO4SAo1OQHPdWeZ5Cj7cqeJ8nkjsJUpD3vSrNZNzoM7dai6zunWZ3DGJrmQpoYKXBr2d3OuMOq7w9Srauu5OemjSjH-pwnobqvbb-U-3ZvbxD49TUuwxarJK9OhqkyeivJN5R6WqMXjnhA1a1FYTcElsNJ9ZphSlNRmLjEyV37Gc3n9" },
          { t: "Chef caps", s: "Always worn", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAa23x8SpQc3n1ndZfx1S7a4Tlmqgk-_cnsoLgtsIz9AEIzeCqXLHvvKh1qQO09fC6Zu0JKxklRRK_GzF8uyTeyQ5G0_n4KAaTVH8JSHhsMuRr300kdxtSYx5LWy6SrVsV8CpjzNJa0wzgWZQ8qQDz9Ys7IEo05JOAhU4l0KRB_Uha_05zwfVoblEop8mCm3JfOlAS2MkMLasruLpSgFq2Pi4m2fDnO_xHmXdsIeW50Kmc2x1l9ETt8aLjPTOV6I9CBNcOGNOsR20b-" },
          { t: "Deep cleaning", s: "Workspace sanitization", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9tDTHUbw2XAYzMPmf0tZ9w8fezuoiOCgR1X9qes0HdaQLW817T6C5tqgwGSh9r0H6b5IYicNQBmxZAATkaDSoil1gSvKCGQocA_kwqdVaTKaqzhfVOQaIg7NXP3-FK-_5OWWax0aatsgqKB8vCeM2780tCTRQFB_4wsWdsmwAuWSvWYSbzP4Zom59PStAkn8ayPOHBN3kVI9GDQr6V70u7fFmB0qUjiN3i5IuTFbNT2iNNNunQ0uJ9jhsFapUX4v4uvfV7WGTCKOs" }
        ].map((h, i) => (
          <div key={i} className="min-w-[160px] flex-shrink-0 bg-white p-3 rounded-xl shadow-sm">
            <div className="w-full aspect-square bg-cover rounded-lg mb-3" style={{ backgroundImage: `url('${h.img}')` }} />
            <div>
              <p className="text-slate-900 text-sm font-bold">{h.t}</p>
              <p className="text-slate-500 text-xs">{h.s}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="mt-8 px-4">
      <h2 className="text-slate-900 text-xl font-bold tracking-tight mb-4">What we will need from you</h2>
      <div className="bg-white rounded-xl shadow-sm p-5 grid grid-cols-1 gap-6">
        {[
          { t: "Cookware & Utensils", d: "Please ensure pans, pots, and basic utensils are clean and ready.", i: <Utensils /> },
          { t: "Fresh Groceries", d: "Keep ingredients sorted as per the recipe shared in advance.", i: <ShoppingBasket /> },
          { t: "Kitchen Appliances", d: "Stove, oven, or microwave in working condition.", i: <Zap /> }
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="size-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 text-yellow-700">
              {item.i}
            </div>
            <div>
              <p className="text-slate-900 font-bold">{item.t}</p>
              <p className="text-slate-500 text-sm">{item.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  </motion.div>
);

// --- Referral Page ---

const ReferralPage = (_props: { key?: string }) => {
  const [showEligibility, setShowEligibility] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralCode = 'SPOON' + Math.random().toString(36).substring(2, 7).toUpperCase();

  const handleCopy = () => {
    const link = `https://spoon.app/refer/${referralCode}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="pb-8 bg-white"
    >
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-100 px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight mb-1">
              Give ₹100, Get ₹100
            </h2>
            <p className="text-sm text-yellow-800 font-medium mt-2">
              Refer a friend to Spoon and you both get ₹100 off your next cooking session
            </p>
          </div>
          <div className="w-28 h-28 rounded-2xl bg-white/60 shadow-lg overflow-hidden shrink-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-yellow-600">₹100</p>
              <p className="text-xs font-bold text-yellow-700 mt-0.5">each</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reward cards */}
      <div className="px-5 pt-5 pb-2 flex gap-3">
        <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-green-700">₹100</p>
          <p className="text-xs font-medium text-green-600 mt-1">You get off your next order</p>
        </div>
        <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-yellow-600">₹100</p>
          <p className="text-xs font-medium text-yellow-700 mt-1">Your friend gets off their first order</p>
        </div>
      </div>

      {/* How it works */}
      <div className="px-5 pt-5 pb-4">
        <h3 className="text-lg font-extrabold text-slate-900 mb-5">Here's how it works</h3>

        <div className="space-y-5">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Link2 size={20} className="text-slate-600" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Share your referral link</p>
              <p className="text-sm text-slate-500 mt-0.5">Send your unique code to friends and family</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Utensils size={20} className="text-slate-600" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">They book their first cook</p>
              <p className="text-sm text-slate-500 mt-0.5">Your friend signs up and completes their first cooking session</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Wallet size={20} className="text-slate-600" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">You both save ₹100</p>
              <p className="text-sm text-slate-500 mt-0.5">₹100 is credited to both your wallets automatically</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral warning banner */}
      <div className="mx-5 mt-2 mb-4">
        <button
          onClick={() => setShowEligibility(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl"
        >
          <p className="text-sm font-medium text-yellow-800">Referral terms & eligibility</p>
          <ChevronRight size={16} className="text-yellow-600 shrink-0" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="px-5 flex gap-3 mt-4">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold text-sm text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <Copy size={16} />
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 font-bold text-sm text-white hover:bg-slate-800 transition-colors">
          <Share2 size={16} />
          Share
        </button>
      </div>

      {/* Referral Eligibility Bottom Sheet */}
      {showEligibility && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEligibility(false)} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="relative bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-900">Referral terms</h3>
              <button onClick={() => setShowEligibility(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <h4 className="text-base font-bold text-slate-900 mb-3">How the reward works</h4>
            <ul className="space-y-3 mb-5">
              <li className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                <div className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-2" />
                You and your friend each get ₹100 off after they complete their first booking on Spoon.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                <div className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-2" />
                The discount is credited to your Spoon wallet and applies to your next order.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                <div className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-2" />
                There is no limit on how many friends you can refer.
              </li>
            </ul>

            {/* Warning */}
            <div className="bg-yellow-100 border border-yellow-300 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm font-bold text-yellow-900">Referrals within the same household are ineligible</p>
            </div>

            <h4 className="text-base font-bold text-slate-900 mb-3">Terms & Conditions</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                <div className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-2" />
                Referrals from the same household are not eligible for rewards.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                <div className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-2" />
                Rewards are credited after the referred friend's first order is verified and completed.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                <div className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-2" />
                Wallet credits cannot be exchanged for cash and expire after 90 days.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                <div className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-2" />
                Spoon reserves the right to modify or end this program at any time.
              </li>
            </ul>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

// --- Wallet Page ---

const MOCK_TRANSACTIONS: { id: string; label: string; description: string; amount: number; date: string; type: 'credit' | 'debit' }[] = [];

const WalletPage = (_props: { key?: string }) => {
  const walletBalance = 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 min-h-screen bg-yellow-50"
    >
      {/* Balance card */}
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Available Balance</p>
          <p className="text-4xl font-extrabold text-slate-900">₹{walletBalance}</p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="size-2 rounded-full bg-green-400" />
            <p className="text-xs text-slate-500">Wallet is active</p>
          </div>
        </div>
      </div>

      {/* How to earn */}
      <div className="px-4 mb-4">
        <div className="bg-yellow-100 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Gift size={20} className="text-yellow-700 shrink-0" />
          <p className="text-sm text-yellow-800">
            Refer a friend and earn <span className="font-bold">₹100</span> in your wallet!
          </p>
        </div>
      </div>

      {/* Transaction history */}
      <div className="px-4">
        <h3 className="text-base font-bold text-slate-900 mb-3">Transaction History</h3>
        {MOCK_TRANSACTIONS.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
            <Wallet size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No transactions yet</p>
            <p className="text-slate-400 text-sm mt-1">Your credits and debits will show up here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {MOCK_TRANSACTIONS.map(tx => (
              <div key={tx.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`size-9 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {tx.type === 'credit' ? (
                      <ArrowRight size={16} className="text-green-600 rotate-[-90deg]" />
                    ) : (
                      <ArrowRight size={16} className="text-red-500 rotate-90" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{tx.label}</p>
                    <p className="text-xs text-slate-400">{tx.description} &middot; {tx.date}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Address Page ---

const ADDRESS_LABELS = [
  { label: 'Home', icon: HomeIcon },
  { label: 'Work', icon: Briefcase },
  { label: 'Other', icon: MapPin },
];

const AddressPage = ({
  addresses,
  onSelect,
  onAdd,
  onDelete,
  onSetDefault,
}: {
  key?: string;
  addresses: Address[];
  onSelect: (address: Address) => void;
  onAdd: (data: Omit<Address, 'id' | 'userId'>) => Promise<Address>;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => void;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('Home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [pincode, setPincode] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setLabel('Home');
    setLine1('');
    setLine2('');
    setCity('');
    setAddrState('');
    setPincode('');
  };

  const handleSave = async () => {
    if (!line1.trim() || !city.trim() || !pincode.trim()) return;
    setSaving(true);
    try {
      const newAddr = await onAdd({
        label,
        line1: line1.trim(),
        line2: line2.trim() || null,
        city: city.trim(),
        state: addrState.trim() || '',
        pincode: pincode.trim(),
        lat: 0,
        lng: 0,
        isDefault: addresses.length === 0,
      });
      resetForm();
      setShowForm(false);
      onSelect(newAddr);
    } catch {
      // error handled upstream
    }
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="pb-24 min-h-screen bg-white"
    >
      {/* Saved addresses */}
      {addresses.length > 0 && !showForm && (
        <div className="p-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Saved addresses</h3>
          <div className="space-y-3">
            {addresses.map((addr) => {
              const IconComp = ADDRESS_LABELS.find(l => l.label === addr.label)?.icon || MapPin;
              return (
                <div
                  key={addr.id}
                  className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-yellow-300 transition-colors cursor-pointer"
                  onClick={() => onSelect(addr)}
                >
                  <div className="mt-0.5 text-yellow-600">
                    <IconComp size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm text-slate-900">{addr.label}</p>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">DEFAULT</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 truncate">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                    <p className="text-xs text-slate-400">{addr.city}{addr.state ? `, ${addr.state}` : ''} - {addr.pincode}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!addr.isDefault && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onSetDefault(addr.id); }}
                        className="text-xs text-yellow-600 font-medium px-2 py-1 rounded-lg hover:bg-yellow-50"
                      >
                        Set default
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(addr.id); }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add new address button */}
      {!showForm && (
        <div className="px-4 py-2">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-yellow-300 text-yellow-700 font-bold text-sm hover:bg-yellow-50 transition-colors"
          >
            <Plus size={18} />
            Add new address
          </button>
        </div>
      )}

      {/* Empty state */}
      {addresses.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <MapPin size={56} className="text-slate-200 mb-4" />
          <p className="text-lg font-bold text-slate-700 mb-1">No saved addresses</p>
          <p className="text-sm text-slate-400 text-center">Add your address so we can send a cook to your kitchen</p>
        </div>
      )}

      {/* Add address form */}
      {showForm && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">New address</h3>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          {/* Label pills */}
          <div className="flex gap-2 mb-5">
            {ADDRESS_LABELS.map(({ label: l, icon: Ic }) => (
              <button
                key={l}
                onClick={() => setLabel(l)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  label === l
                    ? 'bg-yellow-500 text-white shadow-md shadow-yellow-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Ic size={14} />
                {l}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Flat / House No. & Building *</label>
              <input
                type="text"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="e.g. A-202, Sunshine Apartments"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Landmark (optional)</label>
              <input
                type="text"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                placeholder="e.g. Near City Mall"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">State</label>
                <input
                  type="text"
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Pincode *</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 400001"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !line1.trim() || !city.trim() || !pincode.trim()}
            className="w-full mt-6 bg-yellow-500 text-white font-bold h-14 rounded-2xl shadow-lg shadow-yellow-200 flex items-center justify-center gap-2 disabled:opacity-50 text-base"
          >
            {saving ? 'Saving...' : 'Save address'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

// --- Main App ---

function AppContent() {
  const { user, isAuthenticated, isLoading, addresses, logout, addAddress, deleteAddress, setDefaultAddress } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo>({ mode: 'now' });
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Connect socket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      try { connectSocket(); } catch {}
    }
  }, [isAuthenticated]);

  // Socket event listeners for active order
  useEffect(() => {
    if (!activeOrder) return;

    const cleanups = [
      onOrderAccepted((data: any) => {
        if (data.orderId === activeOrder.id) {
          ordersApi.getById(activeOrder.id).then(setActiveOrder).catch(() => {});
        }
      }),
      onOrderStatusUpdate((data) => {
        if (data.orderId === activeOrder.id) {
          setActiveOrder(prev => prev ? { ...prev, status: data.status } : null);
        }
      }),
      onSessionStarted((data) => {
        if (data.orderId === activeOrder.id) {
          setActiveOrder(prev => prev ? { ...prev, status: 'COOKING', cookingStartedAt: data.startedAt } : null);
        }
      }),
      onSessionCompleted((data) => {
        if (data.orderId === activeOrder.id) {
          setActiveOrder(prev => prev ? { ...prev, status: 'COMPLETED', cookingEndedAt: data.endedAt } : null);
        }
      }),
      onOrderCancelled((data) => {
        if (data.orderId === activeOrder.id) {
          setActiveOrder(prev => prev ? { ...prev, status: 'CANCELLED', cancelReason: data.reason } : null);
        }
      }),
    ];

    return () => cleanups.forEach(c => c?.());
  }, [activeOrder?.id]);

  // Load orders when navigating to orders page
  useEffect(() => {
    if (page === 'orders' && isAuthenticated) {
      setOrdersLoading(true);
      ordersApi.getMyOrders()
        .then(result => setOrders(result.orders))
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [page, isAuthenticated]);

  const handleBook = (service: Service, info?: BookingInfo) => {
    setSelectedService(service);
    setBookingInfo(info || { mode: 'now' });
    if (!isAuthenticated) {
      setPage('login');
      return;
    }
    setPage('cart');
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setPage('cart');
  };

  const handleConfirmOrder = async () => {
    if (!selectedService) return;
    if (!selectedAddress) {
      alert('Please select an address first');
      return;
    }
    setBookingLoading(true);

    try {
      // 1. Create the order on the backend
      const order = await ordersApi.create({
        addressId: selectedAddress.id,
        serviceDuration: DURATION_MAP[selectedService.duration] || 60,
        scheduledAt: new Date(Date.now() + 49 * 60000).toISOString(),
      });

      // 2. Create a Razorpay payment order
      const paymentOrder = await paymentsApi.createOrder(order.id);

      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Spoon',
        description: `${order.serviceDuration} min cooking session`,
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          contact: user?.phone || '',
        },
        theme: { color: '#e9a83a' },
        handler: async (response) => {
          try {
            // 4. Verify payment signature on backend
            await paymentsApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            // 5. Payment verified — proceed to tracking
            setActiveOrder(order);
            try { joinOrderRoom(order.id); } catch {}
            setSelectedService(null);
            setSelectedAddress(null);
            setBookingInfo({ mode: 'now' });
            setPage('tracking');
          } catch {
            alert('Payment verification failed. Please contact support.');
          }
          setBookingLoading(false);
        },
        modal: {
          ondismiss: () => {
            // User closed the checkout without paying
            setBookingLoading(false);
          },
        },
      });
      rzp.open();
      return; // Don't setBookingLoading(false) here — handler/dismiss will do it
    } catch (e: any) {
      alert(e.message || 'Failed to create order');
    }
    setBookingLoading(false);
  };

  const handleLoginSuccess = () => {
    if (selectedService) {
      setPage('cart');
    } else {
      setPage('home');
    }
  };

  const handleSetPage = (p: Page) => {
    if (p === 'orders' && !isAuthenticated) {
      setPage('login');
      return;
    }
    setPage(p);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Utensils className="text-yellow-600 mx-auto animate-pulse" size={40} />
          <p className="text-slate-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage key="login" onSuccess={handleLoginSuccess} />;
      case 'home':
        return <HomePage key="home" onBook={handleBook} />;
      case 'menu':
        return <MenuPage key="menu" />;
      case 'cart':
        return selectedService ? (
          <CartPage
            key="cart"
            service={selectedService}
            bookingInfo={bookingInfo}
            onConfirm={handleConfirmOrder}
            onRemove={() => { setSelectedService(null); setBookingInfo({ mode: 'now' }); setSelectedAddress(null); setPage('home'); }}
            user={user ? { name: user.name, phone: user.phone } : null}
            selectedAddress={selectedAddress}
            onNavigateToAddress={() => setPage('address')}
            loading={bookingLoading}
          />
        ) : null;
      case 'address':
        return (
          <AddressPage
            key="address"
            addresses={addresses}
            onSelect={handleSelectAddress}
            onAdd={addAddress}
            onDelete={deleteAddress}
            onSetDefault={setDefaultAddress}
          />
        );
      case 'tracking':
        return <TrackingPage key="tracking" order={activeOrder} onRate={() => setPage('rating')} />;
      case 'rating':
        return (
          <RatingPage
            key="rating"
            order={activeOrder}
            onDone={() => setPage('tracking')}
          />
        );
      case 'orders':
        return (
          <OrdersPage
            key="orders"
            orders={orders}
            loading={ordersLoading}
            onViewOrder={(order) => { setActiveOrder(order); setPage('tracking'); }}
          />
        );
      case 'safety':
        return <SafetyPage key="safety" />;
      case 'referral':
        return <ReferralPage key="referral" />;
      case 'wallet':
        return <WalletPage key="wallet" />;
      default:
        return <HomePage key="home" onBook={handleBook} />;
    }
  };

  const headerRightIcon = page === 'home' ? (
    isAuthenticated ? (
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 hover:bg-yellow-50 rounded-full transition-colors"
          title="Menu"
        >
          <MenuIcon size={20} className="text-slate-600" />
        </button>

        {/* Menu dropdown */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              <button
                onClick={() => { setMenuOpen(false); setPage('address'); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition-colors text-left"
              >
                <User size={18} className="text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Profile</p>
                  <p className="text-xs text-slate-400">Contact details, addresses</p>
                </div>
              </button>
              <button
                onClick={() => { setMenuOpen(false); setPage('orders'); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition-colors text-left"
              >
                <Calendar size={18} className="text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Past Orders</p>
                </div>
              </button>
              <button
                onClick={() => { setMenuOpen(false); setPage('referral'); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition-colors text-left"
              >
                <Gift size={18} className="text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Referrals</p>
                </div>
              </button>
              <button
                onClick={() => { setMenuOpen(false); setPage('wallet'); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition-colors text-left"
              >
                <Wallet size={18} className="text-slate-500" />
                <div className="flex-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">Wallet</p>
                  <span className="text-sm font-bold text-yellow-600">₹0</span>
                </div>
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={() => { setMenuOpen(false); logout(); setPage('home'); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={18} className="text-red-400" />
                <p className="text-sm font-medium text-red-500">Log Out</p>
              </button>
            </div>
          </>
        )}
      </div>
    ) : (
      <button
        onClick={() => setPage('login')}
        className="text-yellow-600 font-bold text-sm px-3 py-1.5 border border-yellow-200 rounded-full bg-yellow-50 hover:bg-yellow-100 transition-colors"
      >
        Login
      </button>
    )
  ) : page === 'referral' ? (
    <button className="text-xs font-bold text-slate-900 bg-yellow-200 px-3 py-1.5 rounded-full">
      My rewards
    </button>
  ) : undefined;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden">
      <Header
        onBack={
          page === 'address' ? () => setPage('cart') :
          page === 'rating' ? () => setPage('tracking') :
          page !== 'home' ? () => setPage('home') :
          undefined
        }
        title={
          page === 'cart' ? 'Order Summary' :
          page === 'address' ? 'Select Address' :
          page === 'tracking' ? 'Tracking' :
          page === 'rating' ? 'Rate your cook' :
          page === 'orders' ? 'My Orders' :
          page === 'wallet' ? 'Wallet' :
          page === 'login' ? 'Login' :
          page === 'referral' ? '' :
          undefined
        }
        rightIcon={headerRightIcon}
      />

      <main className="min-h-[calc(100vh-64px)]">
        {renderPage()}
      </main>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
