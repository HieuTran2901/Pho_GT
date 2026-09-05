import React, { useState } from 'react';
import { UtensilsCrossed, MapPin, Clock, Phone, ArrowUp, Facebook, Instagram, Youtube } from 'lucide-react';

const HANOI_BRANCHES = [
  {
    address: '45 Hàng Bạc, Hoàn Kiếm, Hà Nội',
    note: 'Cơ sở gốc 1986 — Phố Cổ',
    mapsUrl: 'https://maps.google.com/?q=45+Hang+Bac+Hoan+Kiem+Ha+Noi'
  },
  {
    address: '10 Lý Quốc Sư, Hoàn Kiếm, Hà Nội',
    note: 'Gần Nhà Thờ Lớn',
    mapsUrl: 'https://maps.google.com/?q=10+Ly+Quoc+Su+Hoan+Kiem+Ha+Noi'
  },
  {
    address: '88 Trần Thái Tông, Cầu Giấy, Hà Nội',
    note: 'Khu văn phòng Cầu Giấy',
    mapsUrl: 'https://maps.google.com/?q=88+Tran+Thai+Tong+Cau+Giay+Ha+Noi'
  }
];

const HCM_BRANCHES = [
  {
    address: '88 Pasteur, P. Bến Nghé, Quận 1',
    note: 'Trung tâm Quận 1 — Sài Gòn',
    mapsUrl: 'https://maps.google.com/?q=88+Pasteur+Quan+1+TP+Ho+Chi+Minh'
  },
  {
    address: '152 Võ Thị Sáu, P. Võ Thị Sáu, Quận 3',
    note: 'Biệt thự Pháp cổ — Có bãi ô tô',
    mapsUrl: 'https://maps.google.com/?q=152+Vo+Thi+Sau+Quan+3+TP+Ho+Chi+Minh'
  },
  {
    address: '24 Song Hành, P. An Phú, TP. Thủ Đức',
    note: 'Khu đô thị An Phú',
    mapsUrl: 'https://maps.google.com/?q=24+Song+Hanh+An+Phu+TP+Thu+Duc'
  }
];

function Footer() {
  const [activeCity, setActiveCity] = useState('hn');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#150d08] text-stone-300 pt-12 sm:pt-16 pb-12 border-t border-amber-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* MOBILE VIEW (< md): COMPACT, TABBED & 1-TAP ACTIONABLE     */}
        {/* ========================================================= */}
        <div className="md:hidden space-y-6 pb-10 border-b border-white/10">
          
          {/* Brand Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-brand-red flex items-center justify-center text-amber-200 border border-amber-400/30 shadow-xs">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <span className="font-serif text-lg font-bold text-amber-100 tracking-wide">
                  PHỞ GIA TRUYỀN 1986
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                TỪ NĂM 1986
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Tinh hoa ẩm thực truyền thống Việt Nam với nước dùng ninh 24h từ xương bò tươi tuyển chọn, lưu giữ hồn phở phố cổ Hà Thành.
            </p>
          </div>

          {/* 1-Tap Quick Dial Hotline Card */}
          <a
            href="tel:19008686"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#7a1c12] to-[#4a110a] border border-red-500/40 text-white shadow-lg active:scale-98 transition-transform group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-xs">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-red-200 font-medium">Tổng đài đặt bàn & giao hàng:</div>
                <div className="font-serif text-base font-bold text-amber-200 tracking-wide">
                  1900 8686
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-amber-400 text-stone-950 font-bold px-3 py-1 rounded-full shadow-xs shrink-0 group-hover:bg-amber-300 transition-colors">
              Chạm Gọi Ngay
            </span>
          </a>

          {/* Segmented Branch Tab: Hà Nội (3) / TP.HCM (3) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                Hệ Thống Cơ Sở Phục Vụ
              </span>
              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>06:00 - 22:30</span>
              </span>
            </div>

            {/* Switcher Buttons */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveCity('hn')}
                className={`py-2 rounded-lg transition-all ${
                  activeCity === 'hn'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Hà Nội (3 cơ sở)
              </button>
              <button
                type="button"
                onClick={() => setActiveCity('hcm')}
                className={`py-2 rounded-lg transition-all ${
                  activeCity === 'hcm'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                TP.HCM (3 cơ sở)
              </button>
            </div>

            {/* Branch Cards List */}
            <div className="space-y-2 pt-1">
              {(activeCity === 'hn' ? HANOI_BRANCHES : HCM_BRANCHES).map((branch) => (
                <a
                  key={branch.address}
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-stone-200 group-hover:text-amber-200 transition-colors flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                      <span className="truncate">{branch.address}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 pl-5">{branch.note}</div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold shrink-0 underline group-hover:text-amber-300">
                    Bản đồ ➔
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Socials & Back to Top Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400 font-medium">Kết nối:</span>
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-red flex items-center justify-center text-stone-300 hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-red flex items-center justify-center text-stone-300 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Youtube"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-red flex items-center justify-center text-stone-300 hover:text-white transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-amber-600 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span>Về đầu trang</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* ========================================================= */}
        {/* DESKTOP VIEW (>= md): SPACIOUS 4-COLUMN WITH MAPS LINKS    */}
        {/* ========================================================= */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center text-amber-200 border border-amber-400/30">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-serif text-xl font-bold text-amber-100">PHỞ GIA TRUYỀN 1986</span>
            </div>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
              Tinh hoa ẩm thực truyền thống Việt Nam với nước dùng ninh 24h từ xương bò tươi tuyển chọn, lưu giữ hồn phở phố cổ Hà Thành.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-red flex items-center justify-center text-stone-400 hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-red flex items-center justify-center text-stone-400 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Youtube"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-red flex items-center justify-center text-stone-400 hover:text-white transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Chi nhánh Hà Nội */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-amber-200">Chi Nhánh Hà Nội</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              {HANOI_BRANCHES.map((b) => (
                <li key={b.address}>
                  <a
                    href={b.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 hover:text-amber-200 transition-colors group"
                  >
                    <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="block">{b.address}</span>
                      <span className="text-[11px] text-stone-500">{b.note}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Chi nhánh TP. Hồ Chí Minh */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-amber-200">Chi Nhánh TP.HCM</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              {HCM_BRANCHES.map((b) => (
                <li key={b.address}>
                  <a
                    href={b.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 hover:text-amber-200 transition-colors group"
                  >
                    <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="block">{b.address}</span>
                      <span className="text-[11px] text-stone-500">{b.note}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Giờ Mở Cửa & Hotline */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-amber-200">Giờ Phục Vụ</h4>
            <div className="text-xs sm:text-sm text-stone-400 space-y-2">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sáng: 06:00 - 14:00</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Tối: 17:00 - 22:30</span>
              </p>
              <p className="text-amber-400/90 text-xs italic">
                * Phục vụ tất cả các ngày trong tuần và ngày lễ.
              </p>
            </div>
            <div className="pt-2">
              <div className="text-xs text-stone-400">Tổng đài đặt bàn & giao tận nơi:</div>
              <a
                href="tel:19008686"
                className="text-xl font-serif font-bold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-2 pt-0.5 transition-colors"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>1900 8686</span>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright & Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} Phở Gia Truyền 1986. Giữ toàn quyền bản quyền thương hiệu ẩm thực.
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <a href="#" className="hover:text-amber-300 transition-colors">Chính sách ATTP</a>
            <a href="#" className="hover:text-amber-300 transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-amber-300 transition-colors">Nhượng quyền</a>
            <button
              type="button"
              onClick={scrollToTop}
              className="hidden sm:inline-flex items-center gap-1 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <span>Lên đầu trang</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default React.memo(Footer);
