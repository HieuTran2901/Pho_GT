import React, { useState } from 'react';
import { getDishImage, DEFAULT_PHO_IMAGE } from '../../utils/dishImageHelper';

export default function CustomerOrderItemRow({ item }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = getDishImage(item);
  const quantity = item.quantity || 1;
  const unitPrice = item.unitPrice || (item.totalPrice ? item.totalPrice / quantity : 0);
  const totalPrice = unitPrice * quantity;

  // Trích xuất các tùy chọn khẩu vị nếu có
  const options = [];
  if (item.broth) options.push(item.broth);
  if (item.onion) options.push(item.onion);
  if (item.herb) options.push(item.herb);
  if (item.cruller) options.push(item.cruller);
  if (item.customizationNote) options.push(item.customizationNote);

  return (
    <div className="p-2.5 rounded-2xl bg-[#f7f2e7] border border-[#ebdcc7] hover:border-[#d4af37]/60 flex items-center justify-between gap-3 text-xs transition-colors">
      {/* ẢNH THUMBNAIL + TÊN MÓN */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Ảnh món nhỏ 44x44 */}
        <div className="relative w-[44px] h-[44px] rounded-xl overflow-hidden border border-[#d4af37]/40 shrink-0 bg-stone-200">
          <img
            src={imgError ? DEFAULT_PHO_IMAGE : imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 px-1 py-0.2 rounded-tl-md bg-[#8a1e14] text-white text-[9px] font-mono font-bold leading-tight">
            x{quantity}
          </span>
        </div>

        {/* Tên món & tùy chọn */}
        <div className="min-w-0">
          <div className="font-serif font-bold text-stone-900 truncate">
            {item.name}
          </div>
          {options.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              {options.map((opt, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.2 rounded-md bg-amber-100/80 text-[#8a1e14] text-[10px] font-sans font-medium"
                >
                  {opt}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-stone-400 font-sans">
              Công thức gia truyền chuẩn vị
            </div>
          )}
        </div>
      </div>

      {/* GIÁ TIỀN */}
      <div className="text-right shrink-0">
        <div className="font-serif font-bold text-[#8a1e14] text-xs sm:text-sm">
          {totalPrice.toLocaleString('vi-VN')}đ
        </div>
        {quantity > 1 && (
          <div className="text-[10px] text-stone-400 font-sans">
            {unitPrice.toLocaleString('vi-VN')}đ / bát
          </div>
        )}
      </div>
    </div>
  );
}
