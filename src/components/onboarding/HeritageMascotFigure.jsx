import React, { memo } from 'react';
import SteamEffect from '../SteamEffect';

/**
 * HeritageMascotFigure - Linh vật hoạt họa Chibi "Tiểu Nhị 1986"
 * Minh họa vector thuần khiết phong cách tranh dân gian phố cổ Hà Nội.
 * Hỗ trợ các biểu cảm: idle (chờ), pointing (chỉ đũa), praising (nhảy cẫng reo vui).
 */
const HeritageMascotFigure = memo(function HeritageMascotFigure({
  expression = 'idle', // 'idle' | 'pointing' | 'praising'
  size = 'md', // 'sm' (56px) | 'md' (76px) | 'lg' (96px)
  className = '',
  showSteam = true
}) {
  const isPraising = expression === 'praising';
  const isPointing = expression === 'pointing';

  // Kích thước linh hoạt
  const dimensionClasses = {
    sm: 'w-14 h-16',
    md: 'w-20 h-24',
    lg: 'w-24 h-28'
  }[size] || 'w-20 h-24';

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none shrink-0 ${dimensionClasses} ${
        isPraising ? 'animate-bounce [animation-duration:1.2s]' : 'animate-float'
      } ${className}`}
      aria-label="Linh vật Tiểu Nhị 1986"
    >
      {/* Hiệu ứng khói nghi ngút bốc lên từ bát phở trên tay Tiểu Nhị */}
      {showSteam && (
        <div className="absolute -top-4 right-1/2 translate-x-3 pointer-events-none opacity-85 z-20 scale-75">
          <SteamEffect />
        </div>
      )}

      {/* Hiệu ứng pháo hoa & sao lấp lánh khi khen ngợi */}
      {isPraising && (
        <div className="absolute -top-3 inset-x-0 flex justify-between px-1 pointer-events-none z-30">
          <span className="text-amber-300 text-xs animate-ping">✨</span>
          <span className="text-amber-200 text-sm animate-bounce">🎉</span>
          <span className="text-yellow-300 text-xs animate-ping [animation-delay:200ms]">✨</span>
        </div>
      )}

      {/* Vector SVG nhân vật Chibi Tiểu Nhị 1986 */}
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] overflow-visible"
      >
        <defs>
          {/* Đổ bóng vàng kim di sản */}
          <linearGradient id="goldHeadband" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f6d365" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#96281b" />
          </linearGradient>

          {/* Màu áo nâu sồng gấm phố cổ */}
          <linearGradient id="waiterTunic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#244d3b" />
            <stop offset="100%" stopColor="#0f261c" />
          </linearGradient>

          {/* Nước men gốm Bát Tràng bát phở */}
          <linearGradient id="ceramicBowl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e2d4be" />
            <stop offset="100%" stopColor="#bfa075" />
          </linearGradient>

          {/* Màu khay gỗ sơn then */}
          <linearGradient id="woodTray" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5c2417" />
            <stop offset="50%" stopColor="#7a3424" />
            <stop offset="100%" stopColor="#42180e" />
          </linearGradient>
        </defs>

        {/* 1. THÂN & ÁO BÀ BA GẤM KINH KỲ */}
        <g id="body">
          {/* Tà áo */}
          <path
            d="M32 64 C25 72 20 88 18 102 C28 105 72 105 82 102 C80 88 75 72 68 64 Z"
            fill="url(#waiterTunic)"
            stroke="#d4af37"
            strokeWidth="1.5"
          />
          {/* Cổ áo giao lĩnh chéo ngực đặc trưng xưa */}
          <path
            d="M40 60 L50 74 L60 60"
            stroke="#d4af37"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Thắt lưng dải lụa đỏ */}
          <rect x="26" y="86" width="48" height="6" rx="3" fill="#96281b" stroke="#f6d365" strokeWidth="0.8" />
          <circle cx="50" cy="89" r="2.5" fill="#d4af37" />
        </g>

        {/* 2. KHUÔN MẶT CHIBI TRÒN TRĨNH ĐÁNG YÊU */}
        <g id="head">
          {/* Cổ */}
          <rect x="44" y="52" width="12" height="10" rx="3" fill="#ffd1a4" />

          {/* Tai */}
          <circle cx="27" cy="42" r="5.5" fill="#ffc38b" stroke="#d4af37" strokeWidth="0.5" />
          <circle cx="73" cy="42" r="5.5" fill="#ffc38b" stroke="#d4af37" strokeWidth="0.5" />

          {/* Đầu tròn Chibi */}
          <ellipse cx="50" cy="40" rx="24" ry="22" fill="#ffe0bd" stroke="#5c3016" strokeWidth="1.2" />

          {/* Má hồng hào sảng */}
          <ellipse cx="36" cy="46" rx="4" ry="2.5" fill="#ff857a" opacity={isPraising ? 0.9 : 0.65} />
          <ellipse cx="64" cy="46" rx="4" ry="2.5" fill="#ff857a" opacity={isPraising ? 0.9 : 0.65} />

          {/* ĐÔI MẮT BIỂU CẢM THEO TRẠNG THÁI */}
          {isPraising ? (
            /* Mắt cười tít hạt tiêu hình vòng cung hạnh phúc (^‿^) */
            <g id="praising-eyes">
              <path d="M34 38 Q39 31 44 38" stroke="#4a2211" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M56 38 Q61 31 66 38" stroke="#4a2211" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            /* Mắt long lanh thông minh, hiếu khách */
            <g id="curious-eyes">
              <circle cx="39" cy="38" r="4.2" fill="#2d1305" />
              <circle cx="61" cy="38" r="4.2" fill="#2d1305" />
              {/* Đốm sáng trong mắt */}
              <circle cx="38" cy="36.5" r="1.5" fill="#ffffff" />
              <circle cx="40.5" cy="39" r="0.7" fill="#ffffff" />
              <circle cx="60" cy="36.5" r="1.5" fill="#ffffff" />
              <circle cx="62.5" cy="39" r="0.7" fill="#ffffff" />
            </g>
          )}

          {/* Miệng cười tươi đón khách */}
          {isPraising ? (
            <path d="M43 47 Q50 56 57 47 Z" fill="#96281b" stroke="#ffe0bd" strokeWidth="0.5" />
          ) : (
            <path d="M44 48 Q50 53 56 48" stroke="#682710" strokeWidth="2" strokeLinecap="round" fill="none" />
          )}

          {/* KHĂN ĐÓNG / KHĂN RẰN TRUYỀN THỐNG 1986 */}
          <path
            d="M26 28 C26 14 36 6 50 6 C64 6 74 14 74 28 C68 23 58 20 50 20 C42 20 32 23 26 28 Z"
            fill="url(#goldHeadband)"
            stroke="#d4af37"
            strokeWidth="1.2"
          />
          {/* Nếp gấp khăn vải mỏ quạ */}
          <path d="M30 20 Q50 14 70 20" stroke="#f6d365" strokeWidth="1.2" fill="none" />
          <path d="M34 25 Q50 20 66 25" stroke="#ffe0bd" strokeWidth="0.8" fill="none" />
          {/* Huy hiệu đồng triện đỏ son 1986 trên khăn */}
          <circle cx="50" cy="15" r="4" fill="#96281b" stroke="#d4af37" strokeWidth="1" />
          <text x="50" y="16.5" textAnchor="middle" fontSize="3.5" fill="#fff" fontWeight="bold" fontFamily="sans-serif">
            86
          </text>
        </g>

        {/* 3. TAY BÊ KHAY GỖ & BÁT PHỞ BÁT TRÀNG BỐC KHÓI */}
        <g id="hands-and-tray">
          {/* Khay gỗ sơn then */}
          <ellipse cx="50" cy="80" rx="30" ry="7" fill="url(#woodTray)" stroke="#d4af37" strokeWidth="1" />

          {/* Bát phở gốm Bát Tràng */}
          <path
            d="M38 78 C38 88 62 88 62 78 Z"
            fill="url(#ceramicBowl)"
            stroke="#96281b"
            strokeWidth="0.8"
          />
          {/* Miệng bát phở vàng óng */}
          <ellipse cx="50" cy="78" rx="12" ry="3.5" fill="#874e1d" stroke="#f6d365" strokeWidth="0.7" />
          {/* Bánh phở & hành hoa xanh non rắc lên */}
          <ellipse cx="50" cy="78" rx="9" ry="2" fill="#ffe9c7" />
          <circle cx="47" cy="77.5" r="0.8" fill="#38a169" />
          <circle cx="52" cy="78" r="0.9" fill="#2f855a" />
          <circle cx="50" cy="77" r="0.8" fill="#c53030" />

          {/* Tay trái đỡ khay */}
          <circle cx="23" cy="80" r="4.5" fill="#ffe0bd" stroke="#d4af37" strokeWidth="0.8" />

          {/* Tay phải: Nếu đang pointing thì cầm đũa tre chỉ hướng, ngược lại đỡ khay */}
          {isPointing ? (
            <g id="pointing-chopstick">
              {/* Tay chỉ */}
              <circle cx="77" cy="76" r="4.8" fill="#ffe0bd" stroke="#d4af37" strokeWidth="0.8" />
              {/* Đôi đũa tre vàng óng vươn dài chỉ hướng */}
              <line x1="77" y1="76" x2="98" y2="60" stroke="#d4af37" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="78" y1="78" x2="96" y2="64" stroke="#e2b93b" strokeWidth="1.5" strokeLinecap="round" />
              {/* Hạt phát sáng đầu đũa */}
              <circle cx="98" cy="60" r="2" fill="#fff" className="animate-ping" />
            </g>
          ) : (
            /* Tay phải đỡ khay gỗ */
            <circle cx="77" cy="80" r="4.5" fill="#ffe0bd" stroke="#d4af37" strokeWidth="0.8" />
          )}
        </g>
      </svg>
    </div>
  );
});

export default HeritageMascotFigure;
