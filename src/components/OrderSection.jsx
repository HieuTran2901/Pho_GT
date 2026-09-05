import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Phone, CheckCircle2, Send, ChefHat } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';
import { useAuth } from '../context/AuthContext';

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

  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dismiss mobile virtual keyboard on submission to reveal the result cleanly
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsLoading(true);

    // Simulate order/booking submission with timer cleanup
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    submitTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setIsSubmitted(false);
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
              
              {isSubmitted ? (
                /* Success State */
                <div className="text-center py-10 space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Đặt Bàn Thành Công!
                  </h3>
                  <p className="text-stone-300 text-sm max-w-md mx-auto leading-relaxed">
                    Cảm ơn quý khách <strong className="text-amber-300">{formData.customerName || 'bạn'}</strong>! Quán đã ghi nhận yêu cầu và sẽ gọi điện xác nhận trong vòng 5 phút tới số <strong className="text-amber-300">{formData.phone}</strong>.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-4 px-6 py-2.5 rounded-full bg-brand-red text-white text-sm font-semibold hover:bg-brand-redhover transition-colors shadow-lg"
                  >
                    Tạo Yêu Cầu Mới
                  </button>
                </div>
              ) : (
                /* Interactive Form State */
                <form onSubmit={handleSubmit} className="space-y-4">
                  
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

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default React.memo(OrderSection);
