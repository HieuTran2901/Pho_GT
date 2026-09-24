import { memo } from 'react';

function AuthTabNav({ authTab, onTabChange }) {
  return (
    <div className="px-6 pt-4 pb-2 shrink-0">
      <div className="flex rounded-xl bg-[#ede3cf] p-1 border border-[#d6c7ac]">
        <button
          type="button"
          onClick={() => onTabChange('login')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-serif font-bold rounded-lg transition-all ${
            authTab === 'login'
              ? 'bg-white text-[#8a1e14] shadow-xs border border-[#cbb898]'
              : 'text-[#6b584c] hover:text-[#2b1810]'
          }`}
        >
          ĐĂNG NHẬP (KHÁCH QUEN)
        </button>
        <button
          type="button"
          onClick={() => onTabChange('register')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-serif font-bold rounded-lg transition-all relative flex items-center justify-center gap-1.5 ${
            authTab === 'register'
              ? 'bg-white text-[#8a1e14] shadow-xs border border-[#cbb898]'
              : 'text-[#6b584c] hover:text-[#2b1810]'
          }`}
        >
          <span>ĐĂNG KÝ MỚI</span>
          <span className="bg-gradient-to-r from-amber-500 to-red-600 text-white text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full shadow-xs animate-pulse">
            +50Đ
          </span>
        </button>
      </div>
    </div>
  );
}

export default memo(AuthTabNav);
