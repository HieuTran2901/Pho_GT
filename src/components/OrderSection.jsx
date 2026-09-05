import React, { useState, useRef, useEffect } from 'react';
import { Phone, CheckCircle2, Send, ChefHat } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

function OrderSection() {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.12 });
  const [formData, setFormData] = useState({
    orderType: 'dine-in', // dine-in or delivery
    customerName: '',
    phone: '',
    branch: 'hanoi-hangbac',
    guestCount: '2',
    date: '',
    time: '',
    address: '',
    note: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submitTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
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
      customerName: '',
      phone: '',
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
            <div className="bg-[#241710] border border-amber-900/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
              
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
                  
                  {/* Order Type Toggle */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/30 border border-white/10 mb-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, orderType: 'dine-in' })}
                      className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                        formData.orderType === 'dine-in'
                          ? 'bg-brand-red text-white shadow-md'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      Đặt Bàn Tại Quán
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, orderType: 'delivery' })}
                      className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                        formData.orderType === 'delivery'
                          ? 'bg-brand-red text-white shadow-md'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      Giao Phở Tận Nơi
                    </button>
                  </div>

                  {/* Customer Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Họ và Tên Quý Khách *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Số Điện Thoại Liên Hệ *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0912 345 678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Branch & Guests (or Address) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Chọn Cơ Sở Gần Bạn
                      </label>
                      <select
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#2e1d15] border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400"
                      >
                        <option value="hanoi-hangbac">Hà Nội: 45 Hàng Bạc, Hoàn Kiếm</option>
                        <option value="hanoi-lyquocsu">Hà Nội: 10 Lý Quốc Sư, Hoàn Kiếm</option>
                        <option value="hcm-quan1">TP.HCM: 88 Pasteur, Quận 1</option>
                        <option value="hcm-quan3">TP.HCM: 152 Võ Thị Sáu, Quận 3</option>
                      </select>
                    </div>

                    {formData.orderType === 'dine-in' ? (
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                          Số Lượng Người
                        </label>
                        <select
                          value={formData.guestCount}
                          onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#2e1d15] border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400"
                        >
                          <option value="1">1 Người (Bàn đơn)</option>
                          <option value="2">2 Người (Bàn đôi)</option>
                          <option value="4">3 - 4 Người (Bàn gia đình)</option>
                          <option value="8">5 - 8 Người (Bàn tiệc nhóm)</option>
                          <option value="10">Trên 8 Người</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                          Địa Chỉ Nhận Hàng *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Số nhà, tên đường, phường..."
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Ngày Dùng Bữa
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                        Khung Giờ Dự Kiến
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Ghi Chú Thêm (Khẩu vị, hành, nước béo,...)
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Ví dụ: Ăn nhiều hành, không mì chính, xin thêm ớt chưng cay..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-red to-amber-600 hover:from-brand-redhover hover:to-amber-700 text-white font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Đang Xử Lý Đơn...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Xác Nhận Đặt Bàn / Giao Phở</span>
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
