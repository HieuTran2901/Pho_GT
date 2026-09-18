import React, { useRef, useEffect } from 'react';

/**
 * PhoneOtpInput - 6 ô nhập mã xác thực OTP chuyên biệt cho Phở Gia Truyền 1986
 * Tự động nhảy con trỏ, xử lý dán (paste) 6 số, phím mũi tên & backspace mượt mà.
 */
export default function PhoneOtpInput({
  length = 6,
  value = '',
  onChange,
  disabled = false,
  autoFocus = true,
  isError = false
}) {
  const inputRefs = useRef([]);

  // Chuyển chuỗi value thành mảng ký tự kích thước `length`
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index, e) => {
    const rawVal = e.target.value;
    // Chỉ lấy chữ số cuối cùng vừa nhập
    const digit = rawVal.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    const newOtp = newDigits.join('');
    onChange(newOtp);

    // Tự động nhảy sang ô tiếp theo nếu vừa nhập số
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Nếu ô hiện tại rỗng và bấm backspace -> lùi về ô trước và xóa
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (!pasteData) return;

    onChange(pasteData);

    // Focus vào ô tiếp theo sau chuỗi dán được
    const nextIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 select-none" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={digits[index]}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-10 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-black rounded-xl transition-all duration-200 outline-hidden ${
              disabled
                ? 'bg-stone-900/60 text-stone-500 border-stone-800 cursor-not-allowed'
                : isError
                ? 'bg-red-950/40 text-red-300 border-2 border-red-500 ring-2 ring-red-500/30'
                : isFilled
                ? 'bg-[#10291e] text-[#fae29c] border-2 border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                : 'bg-[#0a1c14] text-stone-200 border-2 border-[#d4af37]/40 hover:border-amber-400/80 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/30 focus:scale-105'
            }`}
            aria-label={`Chữ số OTP thứ ${index + 1}`}
          />
        );
      })}
    </div>
  );
}
