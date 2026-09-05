import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Phone, CheckCircle2, Send, ChefHat, ArrowLeft, QrCode, Banknote, Clock, Copy, Check } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';
import { useAuth } from '../context/AuthContext';
import { paymentApi } from '../services/paymentApi';

const BRANCH_LABELS = {
  'hanoi-hangbac': '45 Hàng Bạc, Hoàn Kiếm, Hà Nội',
  'hanoi-lyquocsu': '10 Lý Quốc Sư, Hoàn Kiếm, Hà Nội',
  'saigon-d1': '86 Nguyễn Du, Quận 1, TP.HCM'
};

const TASTE_PREFERENCES = [
  'Nhiều hành',
  'Nước béo',
  'Đầu hành giòn',
  'Hành trần',
  'Không mì chính',
  'Thêm quẩy giòn'
];

function OrderSection() {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.12 });
  const { user } = useAuth();

  // Lazy initialize form data with authenticated user info
  const [formData, setFormData] = useState(() => ({
    orderType: 'dine-in', // dine-in or delivery
    customerName: user?.fullName || '',
    phone: user?.phone || '',
    branch: 'hanoi-hangbac',
    guestCount: '2',
    date: '',
    time: '',
    address: '',
    note: ''
  }));

  // In-Place Multi-Step navigation states (Step 1: Info, Step 2: Payment, Step 3: Confirmation)
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('POST_PAID_AT_STORE');
  const [paymentData, setPaymentData] = useState(null);
  const [bookingCode, setBookingCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isVietQrConfirmed, setIsVietQrConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submitTimerRef = useRef(null);
  const hasAutoFilledRef = useRef(Boolean(user?.fullName || user?.phone));

  // Minimum date constraint (today) to prevent picking past dates on mobile
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Single-pass derived Set for O(1) exact taste chip matching without substring false positives
  const selectedTasteSet = useMemo(() => {
    if (!formData.note) return new Set();
    return new Set(
      formData.note
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }, [formData.note]);

  // Auto-fill user contact info once when user profile loads asynchronously
  useEffect(() => {
    if (user && !hasAutoFilledRef.current) {
      hasAutoFilledRef.current = true;
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.fullName || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // Generic stable input change handler using functional updater
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSetOrderType = useCallback((type) => {
    setFormData((prev) => ({ ...prev, orderType: type }));
    setSelectedPaymentMethod(type === 'dine-in' ? 'POST_PAID_AT_STORE' : 'COD');
  }, []);

  const handleSetGuestCount = useCallback((count) => {
    setFormData((prev) => ({ ...prev, guestCount: count }));
  }, []);

  const handleToggleTaste = useCallback((pref) => {
    setFormData((prev) => {
      const current = (prev.note || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const exists = current.includes(pref);
      const updated = exists ? current.filter((s) => s !== pref) : [...current, pref];
      return { ...prev, note: updated.join(', ') };
    });
  }, []);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    };
  }, []);

  // Step 1: Submit handler validates current form and smoothly transitions in-place to Step 2
  const handleSubmit = (e) => {
    e.preventDefault();
    // Dismiss mobile virtual keyboard on submission to reveal the result cleanly
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsLoading(true);

    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    submitTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      const branchPrefix = formData.branch === 'saigon-d1' ? 'SG' : 'HN';
      const randomSalt = Math.floor(1000 + Math.random() * 9000);
      setBookingCode(`PHO1986-${branchPrefix}-${randomSalt}`);
      setDirection('forward');
      setStep(2);
    }, 450);
  };

  // Step 2: Confirm payment method and transition to Step 3 (Heritage Pass or VietQR)
  const handleConfirmOrder = async () => {
    setIsProcessingPayment(true);
    try {
      const paymentRes = await paymentApi.createPayment({
        orderCode: bookingCode,
        paymentMethod: selectedPaymentMethod,
        note: formData.note
      });
      setPaymentData(paymentRes);
    } catch (err) {
      console.warn('[OrderSection] Payment API creation error:', err);
    } finally {
      setIsProcessingPayment(false);
      setDirection('forward');
      setStep(3);
    }
  };

  const handleBackToStep1 = () => {
    setDirection('backward');
    setStep(1);
  };

  const handleBackToStep2 = () => {
    setDirection('backward');
    setStep(2);
  };

  const handleCopyCode = (text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setDirection('backward');
    setStep(1);
    setPaymentData(null);
    setIsVietQrConfirmed(false);
    setFormData({
      orderType: 'dine-in',
      customerName: user?.fullName || '',
      phone: user?.phone || '',
      branch: 'hanoi-hangbac',
      guestCount: '2',
      date: '',
      time: '',
      address: '',
      note: ''
    });
    setSelectedPaymentMethod('POST_PAID_AT_STORE');
  };

  return (
    <section id="order" ref={sectionRef} className="py-14 sm:py-20 bg-stone-900 text-white relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ========================================================= */}
          {/* MOBILE VIEW (< lg): COMPACT BENTO PRIVILEGES & 1-TAP CALL */}
          {/* ========================================================= */}
          <div className={`lg:hidden space-y-4 transition-all duration-700 ${isVisible ? 'reveal-slide-left' : 'opacity-0'}`}>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/20 text-brand-red text-xs font-bold uppercase tracking-wider border border-brand-red/30 mb-2.5">
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                <span>Đặt Trước Giữ Chỗ</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-50 leading-tight">
                Bát Phở Nóng Chờ Bạn, Không Chờ Đợi
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Giờ cao điểm quán rất đông. Đặt trước để có bàn thoáng và phở lên ngay khi bạn bước vào quán.
              </p>
            </div>

            {/* 3 Bento Privilege Micro-Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
              <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-between shadow-xs">
                <span className="text-xl sm:text-2xl mb-1">⏳</span>
                <span className="font-bold text-amber-300 text-xs sm:text-sm">30 Phút</span>
                <span className="text-[10px] text-stone-400 leading-tight mt-0.5">Giữ bàn miễn phí</span>
              </div>

              <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-between shadow-xs">
                <span className="text-xl sm:text-2xl mb-1">🥢</span>
                <span className="font-bold text-amber-300 text-xs sm:text-sm">Tặng Quẩy</span>
                <span className="text-[10px] text-stone-400 leading-tight mt-0.5">& Trà sen khai vị</span>
              </div>

              <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-between shadow-xs">
                <span className="text-xl sm:text-2xl mb-1">♨️</span>
                <span className="font-bold text-amber-300 text-xs sm:text-sm">Nóng 90°C</span>
                <span className="text-[10px] text-stone-400 leading-tight mt-0.5">Giữ nhiệt tận nơi</span>
              </div>
            </div>

            {/* Instant 1-Tap Quick Dial Hotline Bar */}
            <a
              href="tel:19008686"
              className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#8b2316] to-[#5e170e] border border-red-400/40 shadow-lg active:scale-98 transition-transform group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Phone className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="text-[11px] text-red-200 font-medium">Tổng đài đặt bàn nhanh:</div>
                  <div className="font-serif text-base sm:text-lg font-bold text-white tracking-wide">
                    1900 8686
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] sm:text-[10px] bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded-full block mb-0.5 shadow-xs">
                  MIỄN PHÍ CƯỚC
                </span>
                <span className="text-[11px] text-amber-200 font-bold underline group-hover:text-amber-100 transition-colors">
                  Chạm gọi ngay →
                </span>
              </div>
            </a>
          </div>

          {/* ========================================================= */}
          {/* DESKTOP VIEW (>= lg): ORIGINAL SPACIOUS 2-COLUMN LAYOUT   */}
          {/* ========================================================= */}
          <div className={`hidden lg:block lg:col-span-5 space-y-6 transition-all duration-700 ${isVisible ? 'reveal-slide-left' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/20 text-brand-red text-xs font-bold uppercase tracking-wider border border-brand-red/30">
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              Phục Vụ Chu Đáo
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-50">
              Đặt Bàn Trước — Không Cần Chờ Đợi
            </h2>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Vào các khung giờ cao điểm (sáng sớm và trưa), lượng thực khách rất đông. Hãy đặt bàn trước để chúng tôi chuẩn bị chỗ ngồi thoáng đãng và phục vụ bát phở nóng hổi ngay khi bạn vừa bước vào quán.
            </p>

            {/* Benefit bullet points */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-stone-200 text-sm">Giữ bàn miễn phí lên đến 30 phút</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-stone-200 text-sm">Tặng kèm đĩa quẩy giòn & trà sen khai vị</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-stone-200 text-sm">Giao tận nơi giữ nhiệt nước dùng 90°C</span>
              </div>
            </div>

            {/* Direct hotline reminder */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-red flex items-center justify-center text-white shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-stone-400">Hỗ trợ đặt bàn nhanh qua tổng đài:</div>
                <a href="tel:19008686" className="font-serif text-xl font-bold text-amber-300 hover:underline">
                  1900 8686 (Miễn phí cước)
                </a>
              </div>
            </div>
          </div>

          {/* Right form card */}
          <div className={`lg:col-span-7 transition-all duration-700 ${isVisible ? 'reveal-slide-right' : 'opacity-0'}`}>
            <div className="bg-[#241710] border border-amber-900/40 rounded-3xl p-4 sm:p-8 lg:p-10 shadow-2xl relative">
              
              {/* Progress Breadcrumbs (Visible on Step 2 & Step 3) */}
              {step > 1 && (
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10 text-xs px-1 animate-fadeIn">
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="flex items-center gap-1.5 cursor-pointer group"
                    title="Quay lại bước 1"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-600 group-hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs transition-colors">✓</span>
                    <span className="text-emerald-400 group-hover:text-emerald-300 font-medium transition-colors">1. Thông tin</span>
                  </button>

                  <div className="h-0.5 flex-1 mx-2.5 bg-stone-700/60 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500 ease-out ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs transition-all duration-300 ${step === 2 ? 'bg-brand-red text-white scale-110 ring-2 ring-amber-400/40' : 'bg-emerald-600 text-white'}`}>
                      {step > 2 ? '✓' : '2'}
                    </span>
                    <span className={`transition-colors duration-300 ${step === 2 ? 'text-amber-200 font-bold' : 'text-emerald-400 font-medium'}`}>
                      2. Thanh toán
                    </span>
                  </div>

                  <div className="h-0.5 flex-1 mx-2.5 bg-stone-700/60 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 ease-out ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs transition-all duration-300 ${step === 3 ? 'bg-brand-red text-white scale-110 ring-2 ring-amber-400/40' : 'bg-stone-800 text-stone-500'}`}>
                      3
                    </span>
                    <span className={`transition-colors duration-300 ${step === 3 ? 'text-amber-200 font-bold' : 'text-stone-500 font-medium'}`}>
                      3. Hoàn tất
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 1: Interactive Form State (100% Original, untouched inputs & buttons) */}
              {step === 1 && (
                <form onSubmit={handleSubmit} className={`space-y-4 ${direction === 'backward' ? 'animate-step-backward' : ''}`}>
                  
                  {/* Order Type Segmented Switcher */}
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/10 mb-4 text-xs sm:text-sm font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSetOrderType('dine-in')}
                      className={`py-2 sm:py-2.5 rounded-lg transition-all ${
                        formData.orderType === 'dine-in'
                          ? 'bg-brand-red text-white shadow-sm font-bold'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Đặt Bàn Tại Quán
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetOrderType('delivery')}
                      className={`py-2 sm:py-2.5 rounded-lg transition-all ${
                        formData.orderType === 'delivery'
                          ? 'bg-brand-red text-white shadow-sm font-bold'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Giao Phở Tận Nơi
                    </button>
                  </div>

                  {/* Customer Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Họ và tên quý khách *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        autoComplete="name"
                        required
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Số điện thoại liên hệ *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        required
                        placeholder="Ví dụ: 0912 345 678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Branch & Guests (or Address) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Cơ sở phục vụ *
                      </label>
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#2e1d15] border border-white/15 text-white text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
                      >
                        <option value="hanoi-hangbac">Hà Nội: 45 Hàng Bạc, Hoàn Kiếm (Cơ sở gốc 1986)</option>
                        <option value="hanoi-lyquocsu">Hà Nội: 10 Lý Quốc Sư, Hoàn Kiếm</option>
                        <option value="hcm-quan1">TP.HCM: 88 Pasteur, Quận 1</option>
                        <option value="hcm-quan3">TP.HCM: 152 Võ Thị Sáu, Quận 3</option>
                      </select>
                    </div>

                    {formData.orderType === 'dine-in' ? (
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                          Số lượng khách *
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { val: '1', label: '1 người' },
                            { val: '2', label: '2 người' },
                            { val: '4', label: '3 - 4' },
                            { val: '8', label: 'Từ 5+' }
                          ].map((item) => (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => handleSetGuestCount(item.val)}
                              className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                                formData.guestCount === item.val
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                                  : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                          Địa chỉ nhận hàng *
                        </label>
                        <input
                          type="text"
                          name="address"
                          autoComplete="street-address"
                          required
                          placeholder="Số nhà, tên đường, phường/xã..."
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  {/* Date and Time (2-column row) */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Ngày dùng bữa *
                      </label>
                      <input
                        type="date"
                        name="date"
                        min={todayDateStr}
                        required
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Khung giờ dự kiến *
                      </label>
                      <input
                        type="time"
                        name="time"
                        required
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Taste Preferences & Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-stone-300">
                        Yêu cầu khẩu vị riêng (nếu có)
                      </label>
                      <span className="text-[11px] text-stone-400">Chọn nhanh:</span>
                    </div>

                    {/* Clean Taste Specification Chips (No emoji) */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {TASTE_PREFERENCES.map((pref) => {
                        const isSelected = selectedTasteSet.has(pref);
                        return (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => handleToggleTaste(pref)}
                            className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold'
                                : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                            }`}
                          >
                            + {pref}
                          </button>
                        );
                      })}
                    </div>

                    <textarea
                      rows="2"
                      name="note"
                      placeholder="Ghi chú thêm: bàn gần cửa sổ, ăn cay, xin thêm ớt chưng..."
                      value={formData.note}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 resize-none transition-colors"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-brand-red to-amber-600 hover:from-brand-redhover hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Đang Xử Lý Yêu Cầu...</span>
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          {formData.orderType === 'dine-in' ? 'Xác Nhận Đặt Bàn Tại Quán' : 'Xác Nhận Đặt Giao Phở'}
                        </span>
                      </>
                    )}
                  </button>

                </form>
              )}

              {/* STEP 2: Payment Method & Concise Summary */}
              {step === 2 && (
                <div className={`space-y-4 ${direction === 'forward' ? 'animate-step-forward' : 'animate-step-backward'}`}>
                  {/* Quick Summary Bar */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-900/30 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-300">{formData.customerName || 'Quý khách'}</span>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-stone-300">{formData.phone}</span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed">
                        {formData.orderType === 'dine-in' ? (
                          <>
                            Đặt bàn {formData.guestCount} người • {formData.time || '19:00'} ngày {formData.date || 'Hôm nay'} • {BRANCH_LABELS[formData.branch] || 'Hàng Bạc'}
                          </>
                        ) : (
                          <>
                            Giao phở tận nơi • {formData.address || 'Địa chỉ quý khách'}
                          </>
                        )}
                      </p>
                      {formData.note && (
                        <div className="text-[11px] text-amber-400/90 italic">
                          Khẩu vị riêng: {formData.note}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleBackToStep1}
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold shrink-0 cursor-pointer pt-0.5 ml-2"
                    >
                      Sửa lại
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-200 mb-2.5">
                      Chọn phương thức thanh toán & xác nhận:
                    </label>

                    {/* Dine-In Payment Options */}
                    {formData.orderType === 'dine-in' && (
                      <div className="space-y-2.5">
                        <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedPaymentMethod === 'POST_PAID_AT_STORE'
                            ? 'bg-amber-950/30 border-amber-400 shadow-xs'
                            : 'bg-white/5 border-white/10 hover:border-amber-400/50'
                        }`}>
                          <input
                            type="radio"
                            name="payment_method"
                            value="POST_PAID_AT_STORE"
                            checked={selectedPaymentMethod === 'POST_PAID_AT_STORE'}
                            onChange={() => setSelectedPaymentMethod('POST_PAID_AT_STORE')}
                            className="mt-1 accent-amber-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                <Banknote className="w-4 h-4 text-emerald-400" />
                                Thanh toán sau tại quán
                              </span>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                                Giữ bàn 30 phút
                              </span>
                            </div>
                            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                              Bàn được giữ miễn phí. Quý khách tới quán đọc số điện thoại để nhận bàn và thanh toán tại quầy thu ngân sau khi dùng bữa.
                            </p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedPaymentMethod === 'VIETQR'
                            ? 'bg-amber-950/30 border-amber-400 shadow-xs'
                            : 'bg-white/5 border-white/10 hover:border-amber-400/50'
                        }`}>
                          <input
                            type="radio"
                            name="payment_method"
                            value="VIETQR"
                            checked={selectedPaymentMethod === 'VIETQR'}
                            onChange={() => setSelectedPaymentMethod('VIETQR')}
                            className="mt-1 accent-amber-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                <QrCode className="w-4 h-4 text-amber-400" />
                                Quét mã VietQR Napas 247
                              </span>
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                                Tự động xác nhận
                              </span>
                            </div>
                            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                              Quét mã qua ứng dụng ngân hàng để chuyển khoản. Quán chuẩn bị sẵn bàn đẹp kèm ưu tiên tặng quẩy nóng giòn & trà sen.
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Delivery Payment Options */}
                    {formData.orderType === 'delivery' && (
                      <div className="space-y-2.5">
                        <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedPaymentMethod === 'COD'
                            ? 'bg-amber-950/30 border-amber-400 shadow-xs'
                            : 'bg-white/5 border-white/10 hover:border-amber-400/50'
                        }`}>
                          <input
                            type="radio"
                            name="payment_method"
                            value="COD"
                            checked={selectedPaymentMethod === 'COD'}
                            onChange={() => setSelectedPaymentMethod('COD')}
                            className="mt-1 accent-amber-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                <Banknote className="w-4 h-4 text-emerald-400" />
                                Tiền mặt khi nhận phở (COD)
                              </span>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                                An tâm
                              </span>
                            </div>
                            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                              Nhân viên giao bát phở nóng 90°C tới tận nơi. Quý khách kiểm tra bát phở và thanh toán tiền mặt trực tiếp.
                            </p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedPaymentMethod === 'VIETQR'
                            ? 'bg-amber-950/30 border-amber-400 shadow-xs'
                            : 'bg-white/5 border-white/10 hover:border-amber-400/50'
                        }`}>
                          <input
                            type="radio"
                            name="payment_method"
                            value="VIETQR"
                            checked={selectedPaymentMethod === 'VIETQR'}
                            onChange={() => setSelectedPaymentMethod('VIETQR')}
                            className="mt-1 accent-amber-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                <QrCode className="w-4 h-4 text-amber-400" />
                                Chuyển khoản VietQR tiện lợi
                              </span>
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                                Không cần tiền lẻ
                              </span>
                            </div>
                            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                              Quét mã thanh toán trước nhanh gọn, tài xế có thể treo phở trước cửa nếu bạn bận họp.
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Step 2 */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBackToStep1}
                      className="w-1/3 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 font-semibold text-xs sm:text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay Lại</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmOrder}
                      disabled={isProcessingPayment}
                      className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-brand-red to-amber-600 hover:from-brand-redhover hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      {isProcessingPayment ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Đang Xác Nhận...</span>
                        </span>
                      ) : (
                        <span>
                          {selectedPaymentMethod === 'VIETQR' ? 'Mở Mã Quét VietQR →' : 'Xác Nhận Giữ Chỗ Ngay →'}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Heritage Boarding Pass or VietQR Dynamic Screen */}
              {step === 3 && (
                <div className={`space-y-4 ${direction === 'forward' ? 'animate-step-forward' : 'animate-step-backward'}`}>
                  {selectedPaymentMethod === 'VIETQR' && !isVietQrConfirmed ? (
                    /* Case 3A: VietQR Screen */
                    <div className="space-y-3.5">
                      <div className="text-center">
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30 inline-flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-amber-400" />
                          <span>VietQR Napas 247 MBBank</span>
                        </span>
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
                          Quét Mã Chuyển Khoản
                        </h3>
                        <p className="text-xs text-stone-400">
                          Mã QR có hiệu lực trong <span className="text-amber-300 font-bold">15 phút</span>
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-amber-500/40 flex flex-col items-center justify-center text-center">
                        <div className="w-44 h-44 bg-white rounded-xl p-2 shadow-md flex items-center justify-center">
                          <img
                            src={paymentData?.qrCodeUrl || `https://img.vietqr.io/image/970422-0986198686-compact2.png?amount=150000&addInfo=PHO1986%20${bookingCode}&accountName=PHO%20GIA%20TRUYEN%201986`}
                            alt="VietQR Phở Gia Truyền 1986"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="mt-3 w-full bg-black/40 rounded-xl p-3 text-xs text-left space-y-1.5 border border-white/10">
                          <div className="flex justify-between items-center">
                            <span className="text-stone-400">Ngân hàng:</span>
                            <span className="font-bold text-white">MBBank (Quân Đội)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-stone-400">Số tài khoản:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-amber-300 font-mono">0986 1986 86</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode('0986198686')}
                                className="text-[10px] text-stone-400 hover:text-white p-0.5 cursor-pointer"
                                title="Sao chép số tài khoản"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-stone-400">Chủ tài khoản:</span>
                            <span className="font-bold text-stone-200">PHO GIA TRUYEN 1986</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-stone-400">Nội dung CK:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-amber-300 font-mono">{paymentData?.transferContent || `PHO1986 ${bookingCode}`}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(paymentData?.transferContent || `PHO1986 ${bookingCode}`)}
                                className="text-[10px] text-stone-400 hover:text-white p-0.5 cursor-pointer"
                                title="Sao chép nội dung chuyển khoản"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isCopied && (
                        <div className="text-center text-xs text-emerald-400 font-medium">
                          ✓ Đã sao chép vào bộ nhớ tạm!
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleBackToStep2}
                          className="w-1/3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 font-semibold text-xs text-center cursor-pointer"
                        >
                          ← Đổi Cách Khác
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsVietQrConfirmed(true)}
                          className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md cursor-pointer"
                        >
                          Tôi Đã Chuyển Khoản Xong ✓
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Case 3B: Heritage Boarding Pass (Post-paid or COD or Confirmed VietQR) */
                    <div className="text-center py-2 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-xl animate-pop-spring relative">
                        <div className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping opacity-30"></div>
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>

                      <div>
                        <h3 className="font-serif text-2xl font-bold text-amber-100">
                          {formData.orderType === 'dine-in' ? 'Đặt Bàn Thành Công!' : 'Giao Phở Đã Xác Nhận!'}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-sm mx-auto leading-relaxed">
                          {formData.orderType === 'dine-in'
                            ? `Cảm ơn ${formData.customerName || 'quý khách'}! Bàn của bạn đã được giữ chỗ ưu tiên trong 30 phút tại quán.`
                            : `Bếp Phở Gia Truyền 1986 đang chuẩn bị nước dùng và sẽ giao tận nơi tới ${formData.customerName || 'bạn'}.`}
                        </p>
                      </div>

                      {/* Heritage Pass Card with Gold Shimmer */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-amber-500/40 text-left space-y-3 relative overflow-hidden shadow-2xl animate-pass-card">
                        {/* Metallic Gold Shimmer Sweep Effect */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-300/15 to-transparent absolute top-0 left-0 animate-gold-shimmer"></div>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                          <div>
                            <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">
                              {formData.orderType === 'dine-in' ? 'Thẻ Bàn Di Sản' : 'Phiếu Giao Phở Nóng'}
                            </span>
                            <div className="font-mono text-base font-bold text-white tracking-wider flex items-center gap-1.5">
                              <span>#{bookingCode}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(bookingCode)}
                                className="text-stone-400 hover:text-amber-300 p-0.5 cursor-pointer"
                                title="Sao chép mã"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-stone-400">Trạng thái:</span>
                            <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>{formData.orderType === 'dine-in' ? 'Giữ bàn 30 phút' : 'Nóng 90°C'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-stone-400 text-[10px]">Khách hàng:</span>
                            <div className="font-semibold text-stone-200">{formData.customerName || 'Quý khách'}</div>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px]">Số điện thoại:</span>
                            <div className="font-semibold text-stone-200">{formData.phone}</div>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px]">
                              {formData.orderType === 'dine-in' ? 'Thời gian & Bàn:' : 'Thời gian giao:'}
                            </span>
                            <div className="font-semibold text-stone-200">
                              {formData.orderType === 'dine-in'
                                ? `${formData.time || '19:00'} • ${formData.guestCount} khách`
                                : 'Giao ngay (25-35 phút)'}
                            </div>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px]">Thanh toán:</span>
                            <div className="font-semibold text-emerald-400">
                              {selectedPaymentMethod === 'POST_PAID_AT_STORE'
                                ? 'Tại quầy sau khi ăn'
                                : selectedPaymentMethod === 'COD'
                                ? 'Tiền mặt khi nhận phở'
                                : 'Đã thanh toán VietQR ✓'}
                            </div>
                          </div>
                        </div>

                        {formData.note && (
                          <div className="border-t border-white/10 pt-2 text-[11px] text-amber-300/90 italic">
                            Khẩu vị riêng: {formData.note}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Tạo Yêu Cầu Mới
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(`PHO1986 - Mã giữ bàn: #${bookingCode} (${formData.customerName} - ${formData.phone})`)}
                          className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redhover text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                        >
                          {isCopied ? 'Đã Sao Chép Mã ✓' : 'Lưu Mã Giữ Bàn'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default React.memo(OrderSection);
