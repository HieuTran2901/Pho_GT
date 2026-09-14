import React, { useState, useRef, useEffect } from 'react';
import { useScroll } from 'framer-motion';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import MarketingScenicCanvas from './components/MarketingScenicCanvas';
import MarketingContinuousRiver from './components/MarketingContinuousRiver';
import MarketingStickyBookingBar from './components/MarketingStickyBookingBar';
import MarketingHero from './components/MarketingHero';
import MarketingBotanicals from './components/MarketingBotanicals';
import MarketingBrothFlow from './components/MarketingBrothFlow';
import MarketingDeconstructedBowl from './components/MarketingDeconstructedBowl';
import MarketingImperialVoucher from './components/MarketingImperialVoucher';
import MarketingCta from './components/MarketingCta';

export default function MarketingPage({ onBackToHome, onNavigateToSection }) {
  const [toastMessage, setToastMessage] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const containerRef = useRef(null);

  // Overall page scroll progress driving the 4-scene panoramic canvas & continuous river
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Track scroll position to show/hide sticky marketing booking bar
  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      setShowStickyBar(latest > 0.16 && latest < 0.94);
    });
  }, [scrollYProgress]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleActionClick = (actionType) => {
    switch (actionType) {
      case 'CLAIM_VOUCHER': {
        const promoEl = document.getElementById('imperial-vouchers');
        if (promoEl) {
          promoEl.scrollIntoView({ behavior: 'smooth' });
        }
        showToast('Vui lòng sao chép mã ưu đãi để dùng khi đặt món!');
        break;
      }
      case 'VIEW_MENU':
      case 'EXPLORE_MENU': {
        if (onNavigateToSection) {
          onNavigateToSection('menu');
        } else if (onBackToHome) {
          onBackToHome();
        }
        break;
      }
      case 'BOOK_TABLE': {
        if (onNavigateToSection) {
          onNavigateToSection('booking');
        } else if (onBackToHome) {
          onBackToHome();
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen text-amber-50 font-sans selection:bg-amber-500 selection:text-stone-950 overflow-x-hidden"
    >
      {/* 1. Interactive 4-Landscape Panoramic Scenic Canvas */}
      <MarketingScenicCanvas scrollProgress={scrollYProgress} />

      {/* 2. Continuous Golden Broth Liquid River */}
      <MarketingContinuousRiver scrollProgress={scrollYProgress} />

      {/* 3. Sticky Bottom Marketing Floating Bar (High-Conversion Hook) */}
      <MarketingStickyBookingBar
        show={showStickyBar}
        onActionClick={handleActionClick}
      />

      {/* 4. Sandbox Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#140603]/85 backdrop-blur-md border-b border-amber-800/40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-600/40 bg-stone-900/80 hover:bg-stone-800 text-amber-200 text-xs sm:text-sm font-serif font-semibold transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Trang Chủ</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-400/90 font-mono px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/50">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sân Khấu Thị Giác Agency $10,000</span>
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs sm:text-sm font-serif font-bold text-amber-300">
              PHỞ GIA TRUYỀN 1986
            </span>
            <span className="block text-[10px] text-stone-400 font-mono">
              Phòng Thử Nghiệm UI Marketing
            </span>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-stone-900/95 border border-amber-500/60 shadow-2xl text-amber-200 text-xs sm:text-sm font-serif animate-in fade-in slide-in-from-bottom-3 duration-300 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5-Phân Khúc Hành Trình Thị Giác Điện Ảnh */}
      <main className="relative z-10">
        {/* Phân Khúc 1: Mở Màn Di Sản & Thố Phở Centerpiece */}
        <MarketingHero onActionClick={handleActionClick} />

        {/* Phân Khúc 2: Ngũ Vị Dược Liệu & Màn Thẻ Bay 3D */}
        <MarketingBotanicals />

        {/* Phân Khúc 3: Biên Niên Sử 24 Giờ Chưng Cất */}
        <MarketingBrothFlow />

        {/* Phân Khúc 4: Bản Giao Hưởng Bát Phở Phân Rã & Hội Tụ */}
        <MarketingDeconstructedBowl onExploreDish={(sec) => handleActionClick('VIEW_MENU')} />

        {/* Phân Khúc 5: Chiếu Chỉ Tri Kỷ & Mộc Son Hoàng Gia */}
        <div id="imperial-vouchers">
          <MarketingImperialVoucher onToast={showToast} />
        </div>

        {/* Kêu Gọi Đặt Bàn Fine Dining */}
        <MarketingCta onActionClick={handleActionClick} />
      </main>

      {/* Simplified Heritage Footer */}
      <footer className="relative z-10 py-16 px-4 text-center bg-transparent text-xs text-stone-500 font-serif border-t border-amber-900/30">
        <p className="text-amber-200/90 font-serif font-bold text-sm mb-1">
          PHỞ GIA TRUYỀN 1986 — KỶ NGUYÊN THƯỞNG VỊ KINH KỲ
        </p>
        <p>© 1986 - 2026 Phở Gia Truyền 1986. Bảo lưu mọi quyền thương hiệu.</p>
        <p className="text-[11px] text-stone-600 mt-1.5 font-mono">
          Interactive Scenography • 60fps GPU Acceleration • Agency Standard.
        </p>
      </footer>
    </div>
  );
}
