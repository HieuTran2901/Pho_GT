import React from 'react';
import { UtensilsCrossed, MapPin, Clock, Facebook, Instagram, Youtube } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-[#150d08] text-stone-300 pt-16 pb-12 border-t border-amber-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
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
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-red flex items-center justify-center text-stone-400 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-red flex items-center justify-center text-stone-400 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-red flex items-center justify-center text-stone-400 hover:text-white transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Chi nhánh Hà Nội */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-amber-200">Chi Nhánh Hà Nội</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                <span>45 Hàng Bạc, Hoàn Kiếm, Hà Nội</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                <span>10 Lý Quốc Sư, Hoàn Kiếm, Hà Nội</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                <span>88 Trần Thái Tông, Cầu Giấy, Hà Nội</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Chi nhánh TP. Hồ Chí Minh */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-amber-200">Chi Nhánh TP.HCM</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                <span>88 Pasteur, P. Bến Nghé, Quận 1</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                <span>152 Võ Thị Sáu, P. Võ Thị Sáu, Quận 3</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                <span>24 Song Hành, P. An Phú, TP. Thủ Đức</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Giờ Mở Cửa & Hotline */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-amber-200">Giờ Phục Vụ</h4>
            <div className="text-xs sm:text-sm text-stone-400 space-y-2">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Sáng: 06:00 - 14:00</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Tối: 17:00 - 22:30</span>
              </p>
              <p className="text-amber-400/90 text-xs italic">
                * Phục vụ tất cả các ngày trong tuần và ngày lễ.
              </p>
            </div>
            <div className="pt-2">
              <div className="text-xs text-stone-400">Tổng đài đặt hàng & góp ý:</div>
              <div className="text-xl font-serif font-bold text-amber-300">1900 8686</div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div>
            © {new Date().getFullYear()} Phở Gia Truyền 1986. Giữ toàn quyền bản quyền thương hiệu ẩm thực.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-amber-300">Chính sách vệ sinh ATTP</a>
            <a href="#" className="hover:text-amber-300">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-amber-300">Nhượng quyền thương hiệu</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default React.memo(Footer);
