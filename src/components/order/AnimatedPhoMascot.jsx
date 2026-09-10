import React from 'react';
import { motion } from 'framer-motion';

/**
 * [URBAN & RAVEN] AnimatedPhoMascot
 * Linh vật Chibi Phở 1986 dạng Vector SVG sinh động:
 * - 3 làn khói phở thơm lượn sóng & tan biến mượt mà (Loop 60fps)
 * - Đôi mắt Chibi chớp nháy đáng yêu & má hồng e ấp
 * - Cờ lê hoàng kim lắc lư bảo dưỡng & bánh răng cơ khí xoay 360 độ
 * - Bát phở nhấp nhô bồng bềnh thở nhịp nhàng
 */
function AnimatedPhoMascot({ size = 52, className = '' }) {
  return (
    <div
      className={`relative select-none flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient men gốm bát phở */}
          <linearGradient id="phoBowlGrad" x1="20" y1="50" x2="80" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="50%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Gradient nước dùng phở bò gia truyền */}
          <linearGradient id="brothGrad" x1="24" y1="46" x2="76" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Gradient viền vàng hoàng gia */}
          <linearGradient id="goldRimGrad" x1="16" y1="42" x2="84" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Gradient cờ lê hoàng kim */}
          <linearGradient id="wrenchGrad" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* --- 1. LÀN KHÓI PHỞ BỐC NGHI NGÚT (3 WISPS) --- */}
        {/* Làn khói 1: Trái */}
        <motion.path
          d="M 36 38 C 32 30, 42 22, 34 14 C 30 10, 36 4, 38 2"
          stroke="#fde68a"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0.8, opacity: 0.2, y: 0 }}
          animate={{
            y: [-2, -10, -18],
            opacity: [0, 0.85, 0],
            x: [0, -3, 1, 0]
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.5, 1]
          }}
        />

        {/* Làn khói 2: Giữa (Cao & Thơm) */}
        <motion.path
          d="M 50 36 C 54 28, 44 20, 52 11 C 56 6, 50 2, 52 0"
          stroke="#fef08a"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0.9, opacity: 0.3, y: 0 }}
          animate={{
            y: [-2, -12, -22],
            opacity: [0, 0.95, 0],
            x: [0, 3, -2, 0]
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.4,
            times: [0, 0.5, 1]
          }}
        />

        {/* Làn khói 3: Phải */}
        <motion.path
          d="M 64 38 C 68 31, 58 24, 66 16 C 70 12, 65 5, 68 3"
          stroke="#fde68a"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0.8, opacity: 0.2, y: 0 }}
          animate={{
            y: [-2, -9, -17],
            opacity: [0, 0.8, 0],
            x: [0, 2, -3, 0]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
            times: [0, 0.5, 1]
          }}
        />

        {/* --- 2. THÂN BÁT PHỞ VỚI NHỊP THỞ BỒNG BỀNH --- */}
        <motion.g
          animate={{ y: [0, -2.5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Bóng đổ chân bát */}
          <ellipse cx="50" cy="88" rx="26" ry="4" fill="#000000" opacity="0.45" />

          {/* Đáy bát phở */}
          <ellipse cx="50" cy="83" rx="14" ry="4" fill="#592508" stroke="#ca8a04" strokeWidth="1" />

          {/* Thân bát gốm sứ */}
          <path
            d="M 20 48 Q 23 83 50 83 Q 77 83 80 48 Z"
            fill="url(#phoBowlGrad)"
            stroke="#ca8a04"
            strokeWidth="1.5"
          />

          {/* Mặt nước dùng phở bò */}
          <ellipse cx="50" cy="48" rx="30" ry="7" fill="url(#brothGrad)" />

          {/* Vài lát hành hoa & rau mùi trang trí */}
          <circle cx="38" cy="48" r="2.2" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
          <circle cx="62" cy="47" r="1.8" fill="#4ade80" stroke="#16a34a" strokeWidth="0.8" />
          <circle cx="50" cy="45" r="1.6" fill="#86efac" />
          <ellipse cx="44" cy="51" rx="2.5" ry="1.2" fill="#22c55e" opacity="0.9" />

          {/* Vành miệng bát mạ vàng di sản */}
          <ellipse
            cx="50"
            cy="47"
            rx="31"
            ry="7.5"
            fill="none"
            stroke="url(#goldRimGrad)"
            strokeWidth="2.5"
          />

          {/* Hoa văn di sản trên thân bát */}
          <path
            d="M 33 58 Q 50 63 67 58"
            stroke="#fef08a"
            strokeWidth="0.9"
            strokeDasharray="2 2"
            fill="none"
            opacity="0.6"
          />

          {/* --- 3. KHUÔN MẶT CHIBI KAWAII BIẾT CHỚP MẮT --- */}
          {/* Má hồng hào tươi tắn */}
          <motion.ellipse
            cx="34"
            cy="67"
            rx="4.5"
            ry="2.5"
            fill="#f43f5e"
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.ellipse
            cx="66"
            cy="67"
            rx="4.5"
            ry="2.5"
            fill="#f43f5e"
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Đôi mắt cười tít / chớp mắt đáng yêu */}
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              times: [0, 0.9, 0.94, 1]
            }}
            style={{ transformOrigin: '50px 63px' }}
          >
            {/* Mắt trái hình vòm cười ^_^ */}
            <path
              d="M 38 64 Q 42 59 46 64"
              stroke="#fef08a"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Mắt phải hình vòm cười ^_^ */}
            <path
              d="M 54 64 Q 58 59 62 64"
              stroke="#fef08a"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Nụ cười mỉm nhỏ xinh */}
          <path
            d="M 47 70 Q 50 74 53 70"
            stroke="#fef08a"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Đốm sáng phản chiếu men gốm */}
          <path
            d="M 24 55 Q 26 72 36 78"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.3"
          />
        </motion.g>

        {/* --- 4. TAY CHIBI CẦM CỜ LÊ HOÀNG KIM BẢO DƯỠNG --- */}
        <motion.g
          animate={{
            rotate: [-14, 16, -14],
            y: [0, -1.5, 0]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{ transformOrigin: '76px 65px' }}
        >
          {/* Tay chibi ôm cờ lê */}
          <circle cx="76" cy="65" r="4.5" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1" />

          {/* Thân cờ lê */}
          <rect
            x="76"
            y="56"
            width="4"
            height="18"
            rx="2"
            fill="url(#wrenchGrad)"
            stroke="#ca8a04"
            strokeWidth="0.8"
            transform="rotate(28 78 65)"
          />

          {/* Đầu ngàm cờ lê */}
          <path
            d="M 78 48 C 74 48, 71 52, 73 56 C 75 57, 78 57, 79 55 C 80 54, 82 54, 83 56 C 85 57, 87 56, 87 53 C 87 49, 82 48, 78 48 Z"
            fill="url(#goldRimGrad)"
            stroke="#ca8a04"
            strokeWidth="0.9"
            transform="rotate(28 78 52)"
          />
        </motion.g>

        {/* --- 5. BÁNH RĂNG CƠ KHÍ XOAY TRÒN 360 ĐỘ --- */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '82px 28px' }}
        >
          <circle cx="82" cy="28" r="7" fill="#291408" stroke="#f59e0b" strokeWidth="1.2" />
          <circle cx="82" cy="28" r="3" fill="#fef08a" />
          {/* Răng cưa bánh răng */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <rect
              key={angle}
              x="81"
              y="19.5"
              width="2"
              height="2.5"
              rx="0.5"
              fill="#f59e0b"
              transform={`rotate(${angle} 82 28)`}
            />
          ))}
        </motion.g>

        {/* Ngôi sao lấp lánh nhỏ */}
        <motion.path
          d="M 22 26 L 23.5 29 L 26.5 30.5 L 23.5 32 L 22 35 L 20.5 32 L 17.5 30.5 L 20.5 29 Z"
          fill="#fef08a"
          animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      </svg>
    </div>
  );
}

export default React.memo(AnimatedPhoMascot);
