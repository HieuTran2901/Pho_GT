import { memo } from 'react';
import { ArrowRight, Clock, RotateCcw } from 'lucide-react';

function AuthSubmitButton({
  isPermanentLocked,
  lockoutSeconds,
  isLoading,
  authTab,
  onChangePhone
}) {
  if (isPermanentLocked) {
    return (
      <button
        type="button"
        onClick={onChangePhone}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-red-700 hover:brightness-110 active:scale-[0.99] text-amber-100 font-serif font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 border border-amber-400/40 cursor-pointer mt-3"
      >
        <RotateCcw className="w-4 h-4 text-amber-200" />
        <span>SỐ NÀY ĐÃ BỊ KHÓA • BẤM ĐỂ ĐỔI SỐ KHÁC</span>
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={isLoading || lockoutSeconds > 0}
      className="w-full py-3 px-4 rounded-xl bg-[#8a1e14] hover:bg-[#731910] active:scale-[0.99] text-amber-100 font-serif font-bold text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-amber-400/30 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer mt-3"
    >
      {lockoutSeconds > 0 ? (
        <>
          <Clock className="w-4 h-4 animate-pulse text-amber-300" />
          <span>TẠM KHÓA THỬ LẠI ({lockoutSeconds}S)</span>
        </>
      ) : isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-amber-200 border-t-transparent rounded-full animate-spin" />
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          <span>{authTab === 'login' ? 'ĐĂNG NHẬP VÀO QUÁN' : 'GIA NHẬP BÁT PHỞ TRI KỶ'}</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

export default memo(AuthSubmitButton);
