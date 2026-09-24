import { memo } from 'react';
import { User } from 'lucide-react';

function AuthFullNameField({ fullName, setFullName, required }) {
  return (
    <div>
      <label htmlFor="auth-fullname" className="block text-xs font-serif font-bold text-[#3a251b] mb-1">
        Họ và Tên của bạn <span className="text-[#8a1e14]">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
          <User className="w-4 h-4" />
        </div>
        <input
          id="auth-fullname"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ví dụ: Nguyễn Văn Hiếu"
          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#d6c7ac] text-[#2b1810] text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8a1e14] focus:border-[#8a1e14] transition-all shadow-xs"
          required={required}
        />
      </div>
    </div>
  );
}

export default memo(AuthFullNameField);
