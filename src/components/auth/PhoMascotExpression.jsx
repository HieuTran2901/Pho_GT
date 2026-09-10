import React from 'react';

/**
 * [URBAN & RAVEN] PhoMascotExpression
 * Mascot Bé Tô Phở 1986 với các biểu cảm tương tác giàu cảm xúc:
 * - 'tea': Mời trà thư thái (Vòng 1 - 60s)
 * - 'crying': Khóc rơm rớm, đồng cảm & lo lắng (Vòng 2 - 180s)
 * - 'suspicious': Cầm đũa nghi ngờ "hack công thức gia truyền" (Vòng 3 - 600s)
 * - 'alarm': Toát mồ hôi hột báo động đỏ (Vòng 4 - 1800s)
 * - 'locked': Niêm phong nồi phở & két sắt (Vòng 5 - Khóa vĩnh viễn)
 */
export default function PhoMascotExpression({ mood = 'tea', className = 'w-16 h-16' }) {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* --- 1. HIỆU ỨNG HƠI NƯỚC / KHÓI BỐC LÊN --- */}
        <g className="animate-pulse opacity-80" style={{ animationDuration: '2.5s' }}>
          <path
            d="M45 28C43 20 48 16 46 10"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />
          <path
            d="M60 26C62 18 57 14 61 7"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M75 28C77 21 72 17 74 11"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />
        </g>

        {/* --- 2. THÂN TÔ PHỞ (GỐM SỨ BÁT TRÀNG XƯA) --- */}
        <ellipse cx="60" cy="112" rx="36" ry="6" fill="#000" fillOpacity="0.25" />
        <rect x="42" y="100" width="36" height="8" rx="3" fill="#e7d8c5" stroke="#8a1e14" strokeWidth="2" />
        <path
          d="M16 48C16 88 34 102 60 102C86 102 104 88 104 48H16Z"
          fill="#fffdfa"
          stroke="#8a1e14"
          strokeWidth="3"
        />
        <path
          d="M20 54H100"
          stroke="#c29b38"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Nước dùng phở béo ngậy màu quế hồi */}
        <ellipse cx="60" cy="48" rx="42" ry="12" fill="#92400e" stroke="#8a1e14" strokeWidth="2.5" />
        <ellipse cx="60" cy="48" rx="38" ry="9" fill="#b45309" />

        {/* Hành hoa và ớt tươi bồng bềnh */}
        <circle cx="48" cy="47" r="2.5" fill="#22c55e" />
        <circle cx="72" cy="46" r="2.5" fill="#22c55e" />
        <circle cx="60" cy="51" r="2" fill="#16a34a" />
        <path d="M53 45L57 47" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <path d="M65 47L68 49" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />

        {/* --- 3. ĐÔI MÁ HỒNG TỰ NHIÊN --- */}
        <ellipse cx="36" cy="74" rx="5" ry="3.5" fill="#f87171" fillOpacity="0.6" />
        <ellipse cx="84" cy="74" rx="5" ry="3.5" fill="#f87171" fillOpacity="0.6" />

        {/* --- 4. BIỂU CẢM THEO TỪNG VÒNG (MOOD MATRIX) --- */}

        {/* VÒNG 1: 'tea' - Nhấp chén trà cười hiền từ */}
        {mood === 'tea' && (
          <g>
            <path d="M38 68C41 63 47 63 50 68" stroke="#3a251b" strokeWidth="3" strokeLinecap="round" />
            <path d="M70 68C73 63 79 63 82 68" stroke="#3a251b" strokeWidth="3" strokeLinecap="round" />
            <path d="M54 78C57 82 63 82 66 78" stroke="#3a251b" strokeWidth="2.5" strokeLinecap="round" />
            <g transform="translate(86, 66)">
              <ellipse cx="10" cy="16" rx="8" ry="5" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
              <path d="M3 16C3 23 7 25 10 25C13 25 17 23 17 16H3Z" fill="#ecfdf5" stroke="#166534" strokeWidth="1.5" />
              <path d="M10 11C9 8 11 6 10 3" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* VÒNG 2: 'crying' - Mắt rơm rớm, khóc lóc vì tiếc */}
        {mood === 'crying' && (
          <g>
            <ellipse cx="44" cy="67" rx="6" ry="6" fill="#1c1917" />
            <circle cx="42" cy="65" r="2.5" fill="#fff" />
            <circle cx="46" cy="69" r="1.2" fill="#fff" />

            <ellipse cx="76" cy="67" rx="6" ry="6" fill="#1c1917" />
            <circle cx="74" cy="65" r="2.5" fill="#fff" />
            <circle cx="78" cy="69" r="1.2" fill="#fff" />

            <path d="M38 60L49 63" stroke="#3a251b" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M82 60L71 63" stroke="#3a251b" strokeWidth="2.5" strokeLinecap="round" />

            <path d="M53 82C56 77 64 77 67 82" stroke="#3a251b" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            <g className="animate-bounce" style={{ animationDuration: '1.2s' }}>
              <path
                d="M34 76C32 78 30 81 30 84C30 86.5 32 88 34 88C36 88 38 86.5 38 84C38 81 36 78 34 76Z"
                fill="#38bdf8"
              />
              <path
                d="M86 76C84 78 82 81 82 84C82 86.5 84 88 86 88C88 88 90 86.5 90 84C90 81 88 78 86 76Z"
                fill="#38bdf8"
              />
            </g>
          </g>
        )}

        {/* VÒNG 3: 'suspicious' - Cầm đũa nghi ngờ muốn trộm công thức */}
        {mood === 'suspicious' && (
          <g>
            <path d="M38 67L50 67" stroke="#3a251b" strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx="76" cy="66" rx="5.5" ry="6" fill="#1c1917" />
            <circle cx="74" cy="64" r="2" fill="#fff" />

            <path d="M38 61L49 64" stroke="#3a251b" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M70 59L82 62" stroke="#3a251b" strokeWidth="2.5" strokeLinecap="round" />

            <path d="M54 80L66 77" stroke="#3a251b" strokeWidth="2.5" strokeLinecap="round" />

            <g transform="rotate(-25 90 60)">
              <line x1="88" y1="30" x2="88" y2="85" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
              <line x1="93" y1="32" x2="93" y2="85" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* VÒNG 4: 'alarm' - Toát mồ hôi hột báo động đỏ */}
        {mood === 'alarm' && (
          <g>
            <ellipse cx="45" cy="67" rx="6" ry="7" fill="#fff" stroke="#3a251b" strokeWidth="2" />
            <circle cx="45" cy="67" r="2.5" fill="#1c1917" />

            <ellipse cx="75" cy="67" rx="6" ry="7" fill="#fff" stroke="#3a251b" strokeWidth="2" />
            <circle cx="75" cy="67" r="2.5" fill="#1c1917" />

            <ellipse cx="60" cy="80" rx="4" ry="5.5" fill="#8a1e14" stroke="#3a251b" strokeWidth="1.5" />

            <path
              d="M87 50C85 52 83 55 83 57C83 59 85 60.5 87 60.5C89 60.5 91 59 91 57C91 55 89 52 87 50Z"
              fill="#67e8f9"
            />

            <g className="animate-ping" style={{ animationDuration: '1.5s' }}>
              <circle cx="60" cy="18" r="4" fill="#ef4444" />
            </g>
            <circle cx="60" cy="18" r="5" fill="#dc2626" stroke="#fca5a5" strokeWidth="1.5" />
          </g>
        )}

        {/* VÒNG 5 / KHÓA CỨNG: 'locked' - Nồi phở khóa niêm phong */}
        {mood === 'locked' && (
          <g>
            <path d="M38 64L48 68L38 72" stroke="#3a251b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M82 64L72 68L82 72" stroke="#3a251b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            <path d="M52 81C56 75 64 75 68 81" stroke="#3a251b" strokeWidth="2.5" strokeLinecap="round" />

            <g transform="translate(48, 70)">
              <path d="M8 8V4C8 1.8 9.8 0 12 0C14.2 0 16 1.8 16 4V8" stroke="#d97706" strokeWidth="2.5" fill="none" />
              <rect x="4" y="7" width="16" height="14" rx="3" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
              <circle cx="12" cy="13" r="1.5" fill="#78350f" />
              <path d="M12 14.5V17" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
